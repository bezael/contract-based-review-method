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
}

export type NewInvoice = {
  customerId: string
  lines: InputLine[]
}

const withLines = { lines: true } as const

export async function createInvoice(db: Db, data: NewInvoice) {
  await getCustomer(db, data.customerId)

  const lines = data.lines.map((line) => {
    const unitPriceCents = toCents(line.unitPrice)
    return {
      description: line.description,
      quantity: line.quantity,
      unitPriceCents,
      totalCents: multiply(unitPriceCents, line.quantity),
    }
  })

  const subtotalCents = sum(...lines.map((line) => line.totalCents))
  const taxCents = percentage(subtotalCents, TAX_BPS)

  return db.invoice.create({
    data: {
      customerId: data.customerId,
      subtotalCents,
      taxCents,
      totalCents: subtotalCents + taxCents,
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
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status as Status,
    customerId: invoice.customerId,
    subtotal: formatMoney(invoice.subtotalCents),
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
    })),
  }
}
