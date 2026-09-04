import type { Db } from '../lib/db.js'
import { AppError } from '../lib/errors.js'

export type NuevoCliente = {
  nombre: string
  rnc: string
  email?: string
}

export async function crearCliente(db: Db, datos: NuevoCliente) {
  const existente = await db.cliente.findUnique({ where: { rnc: datos.rnc } })
  if (existente) {
    throw new AppError('RNC_DUPLICADO', `Ya existe un cliente con RNC ${datos.rnc}`)
  }
  return db.cliente.create({
    data: {
      nombre: datos.nombre,
      rnc: datos.rnc,
      email: datos.email ?? null,
    },
  })
}

export async function obtenerCliente(db: Db, id: string) {
  const cliente = await db.cliente.findUnique({ where: { id } })
  if (!cliente) {
    throw new AppError('CLIENTE_NO_ENCONTRADO', `No existe el cliente ${id}`)
  }
  return cliente
}
