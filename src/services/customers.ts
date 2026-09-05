import type { Db } from '../lib/db.js'
import { AppError } from '../lib/errors.js'

export type NewCustomer = {
  nombre: string
  rnc: string
  email?: string
}

export async function createCustomer(db: Db, data: NewCustomer) {
  const existing = await db.customer.findUnique({ where: { taxId: data.rnc } })
  if (existing) {
    throw new AppError('RNC_DUPLICADO', `Ya existe un cliente con RNC ${data.rnc}`)
  }
  return db.customer.create({
    data: {
      name: data.nombre,
      taxId: data.rnc,
      email: data.email ?? null,
    },
  })
}

export async function getCustomer(db: Db, id: string) {
  const customer = await db.customer.findUnique({ where: { id } })
  if (!customer) {
    throw new AppError('CLIENTE_NO_ENCONTRADO', `No existe el cliente ${id}`)
  }
  return customer
}
