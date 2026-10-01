import type { Db } from '../lib/db.js'
import { AppError } from '../lib/errors.js'
import {
  TAX_BPS,
  toCents,
  formatMoney,
  multiply,
  percentage,
  sum,
} from '../lib/money.js'
import { getCustomer } from './customers.js'

/** SQLite has no enums: statuses are constrained here, not in the schema. */
export const STATUSES = ['DRAFT', 'ISSUED', 'PAID', 'VOIDED'] as const
export type Status = (typeof STATUSES)[number]

export type InputLine = {
  description: string
  quantity: number
  /** Decimal value with up to two digits: "1234.56". */
  unitPrice: string
  /** Exempt lines are left out of the tax. Defaults to false. */
  taxExempt?: boolean
}

export type NewInvoice = {
  customerId: string
  lines: InputLine[]
  /** Whole percentage from 0 to 100, taken off the subtotal before tax. */
  discountPct?: number
}

const withLines = { lines: true } as const

type BaseLine = { totalCents: number; taxExempt: boolean }

/**
 * Splits the invoice into taxable and exempt bases, both net of discount.
 * The taxable share of the discount is rounded on its own and the exempt base
 * takes the remainder, so taxableCents + exemptCents = subtotal - discount.
 * Bases are derived, not stored: createInvoice and toDto both go through here.
 */
function computeBases(lines: BaseLine[], discountBps: number) {
  const subtotalCents = sum(...lines.map((line) => line.totalCents))
  const discountCents = percentage(subtotalCents, discountBps)
  const taxableGrossCents = sum(
    ...lines.filter((line) => !line.taxExempt).map((line) => line.totalCents),
  )
  const taxableCents = taxableGrossCents - percentage(taxableGrossCents, discountBps)
  const exemptCents = subtotalCents - discountCents - taxableCents
  return { subtotalCents, discountCents, taxableCents, exemptCents }
}

export async function createInvoice(db: Db, data: NewInvoice) {
  await getCustomer(db, data.customerId)

  const lines = data.lines.map((line) => {
    const unitPriceCents = toCents(line.unitPrice)
    return {
      description: line.description,
      quantity: line.quantity,
      unitPriceCents,
      totalCents: multiply(unitPriceCents, line.quantity),
      taxExempt: line.taxExempt ?? false,
    }
  })

  const discountBps = (data.discountPct ?? 0) * 100
  const { subtotalCents, discountCents, taxableCents } = computeBases(lines, discountBps)
  const netCents = subtotalCents - discountCents
  const taxCents = percentage(taxableCents, TAX_BPS)

  return db.invoice.create({
    data: {
      customerId: data.customerId,
      subtotalCents,
      discountBps,
      discountCents,
      taxCents,
      totalCents: netCents + taxCents,
      lines: { create: lines },
    },
    include: withLines,
  })
}

export async function getInvoice(db: Db, id: string) {
  const invoice = await db.invoice.findUnique({ where: { id }, include: withLines })
  if (!invoice) {
    throw new AppError('INVOICE_NOT_FOUND', `Invoice ${id} not found`)
  }
  return invoice
}

/**
 * Moves an invoice from DRAFT to ISSUED and assigns a sequential number.
 * Numbering resets each year: F-2026-0001, F-2026-0002...
 */
export async function issueInvoice(db: Db, id: string, now = new Date()) {
  await getInvoice(db, id)
  const invoiceNumber = await nextNumber(db, now)
  return db.invoice.update({
    where: { id },
    data: { status: 'ISSUED', number: invoiceNumber, issuedAt: now },
    include: withLines,
  })
}

async function nextNumber(db: Db, date: Date): Promise<string> {
  const year = date.getUTCFullYear()
  const prefix = `F-${year}-`
  const issued = await db.invoice.count({ where: { number: { startsWith: prefix } } })
  return `${prefix}${String(issued + 1).padStart(4, '0')}`
}

type InvoiceWithLines = Awaited<ReturnType<typeof getInvoice>>

/** API output: amounts as decimal strings and dates in UTC ISO format. */
export function toDto(invoice: InvoiceWithLines) {
  const { taxableCents, exemptCents } = computeBases(invoice.lines, invoice.discountBps)
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status as Status,
    customerId: invoice.customerId,
    subtotal: formatMoney(invoice.subtotalCents),
    discountPct: invoice.discountBps / 100,
    discount: formatMoney(invoice.discountCents),
    taxableBase: formatMoney(taxableCents),
    exemptBase: formatMoney(exemptCents),
    tax: formatMoney(invoice.taxCents),
    total: formatMoney(invoice.totalCents),
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    lines: invoice.lines.map((line: InvoiceWithLines['lines'][number]) => ({
      id: line.id,
      description: line.description,
      quantity: line.quantity,
      unitPrice: formatMoney(line.unitPriceCents),
      total: formatMoney(line.totalCents),
      taxExempt: line.taxExempt,
    })),
  }
}
