import type { Db } from '../lib/db.js'
import { AppError } from '../lib/errors.js'
import { ITBIS_BPS, aCentimos, formatear, multiplicar, porcentaje, sumar } from '../lib/money.js'
import { obtenerCliente } from './clientes.js'

/** SQLite no tiene enums: el estado se acota aquí, no en el esquema. */
export const ESTADOS = ['BORRADOR', 'EMITIDA', 'PAGADA', 'ANULADA'] as const
export type Estado = (typeof ESTADOS)[number]

export type LineaEntrada = {
  descripcion: string
  cantidad: number
  /** Decimal con hasta dos cifras: "1234.56". */
  precioUnitario: string
}

export type NuevaFactura = {
  clienteId: string
  lineas: LineaEntrada[]
}

const conLineas = { lineas: true } as const

export async function crearFactura(db: Db, datos: NuevaFactura) {
  await obtenerCliente(db, datos.clienteId)

  const lineas = datos.lineas.map((linea) => {
    const precioUnitCent = aCentimos(linea.precioUnitario)
    return {
      descripcion: linea.descripcion,
      cantidad: linea.cantidad,
      precioUnitCent,
      totalCent: multiplicar(precioUnitCent, linea.cantidad),
    }
  })

  const subtotalCent = sumar(...lineas.map((linea) => linea.totalCent))
  const impuestoCent = porcentaje(subtotalCent, ITBIS_BPS)

  return db.factura.create({
    data: {
      clienteId: datos.clienteId,
      subtotalCent,
      impuestoCent,
      totalCent: subtotalCent + impuestoCent,
      lineas: { create: lineas },
    },
    include: conLineas,
  })
}

export async function obtenerFactura(db: Db, id: string) {
  const factura = await db.factura.findUnique({ where: { id }, include: conLineas })
  if (!factura) {
    throw new AppError('FACTURA_NO_ENCONTRADA', `No existe la factura ${id}`)
  }
  return factura
}

/**
 * Pasa una factura de BORRADOR a EMITIDA y le asigna número correlativo.
 * La numeración se reinicia cada año: F-2026-0001, F-2026-0002...
 */
export async function emitirFactura(db: Db, id: string, ahora = new Date()) {
  await obtenerFactura(db, id)
  const numero = await siguienteNumero(db, ahora)
  return db.factura.update({
    where: { id },
    data: { estado: 'EMITIDA', numero, emitidaEn: ahora },
    include: conLineas,
  })
}

async function siguienteNumero(db: Db, fecha: Date): Promise<string> {
  const anio = fecha.getUTCFullYear()
  const prefijo = `F-${anio}-`
  const emitidas = await db.factura.count({ where: { numero: { startsWith: prefijo } } })
  return `${prefijo}${String(emitidas + 1).padStart(4, '0')}`
}

type FacturaConLineas = Awaited<ReturnType<typeof obtenerFactura>>

/** Lo que sale por la API: importes como string decimal y fechas en ISO UTC. */
export function aDto(factura: FacturaConLineas) {
  return {
    id: factura.id,
    numero: factura.numero,
    estado: factura.estado as Estado,
    clienteId: factura.clienteId,
    subtotal: formatear(factura.subtotalCent),
    impuesto: formatear(factura.impuestoCent),
    total: formatear(factura.totalCent),
    emitidaEn: factura.emitidaEn?.toISOString() ?? null,
    creadoEn: factura.creadoEn.toISOString(),
    lineas: factura.lineas.map((linea) => ({
      id: linea.id,
      descripcion: linea.descripcion,
      cantidad: linea.cantidad,
      precioUnitario: formatear(linea.precioUnitCent),
      total: formatear(linea.totalCent),
    })),
  }
}
