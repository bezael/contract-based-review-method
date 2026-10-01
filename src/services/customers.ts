import type { Db } from '../lib/db.js'
import { AppError } from '../lib/errors.js'

export type NewCustomer = {
  name: string
  taxId: string
  email?: string
}

export async function createCustomer(db: Db, data: NewCustomer) {
  const existing = await db.customer.findUnique({ where: { taxId: data.taxId } })
  if (existing) {
    throw new AppError('DUPLICATE_RNC', `A customer with RNC ${data.taxId} already exists`)
  }
  return db.customer.create({
    data: {
      name: data.name,
      taxId: data.taxId,
      email: data.email ?? null,
    },
  })
}

export async function getCustomer(db: Db, id: string) {
  const customer = await db.customer.findUnique({ where: { id } })
  if (!customer) {
    throw new AppError('CUSTOMER_NOT_FOUND', `Customer ${id} not found`)
  }
  return customer
}
