/**
 * Aritmética de dinero en céntimos.
 *
 * Reglas de la casa:
 *  - Los importes entran y salen de la API como string decimal ("1234.56").
 *    Dentro, y en la base de datos, son enteros en céntimos. Nunca Float.
 *  - Redondeo a mitad hacia arriba (half-up), que es lo que espera contabilidad.
 *  - Los porcentajes se expresan en puntos básicos: 18 % = 1800 bps.
 *
 * Este fichero está en la lista de límites de AGENTS.md: no se toca sin que
 * la spec lo autorice explícitamente.
 */
import { AppError } from './errors.js'

/** ITBIS general de República Dominicana. */
export const ITBIS_BPS = 1800

const FORMATO_IMPORTE = /^\d{1,12}(\.\d{1,2})?$/

/** "1234.56" -> 123456. Solo acepta decimales positivos con hasta dos cifras. */
export function aCentimos(importe: string): number {
  if (!FORMATO_IMPORTE.test(importe)) {
    throw new AppError(
      'VALIDACION',
      `Importe inválido: "${importe}". Formato esperado: 1234.56`,
    )
  }
  const [entera = '0', decimal = ''] = importe.split('.')
  return Number(entera) * 100 + Number(decimal)
}

/** 123456 -> "1234.56". */
export function formatear(centimos: number): string {
  const signo = centimos < 0 ? '-' : ''
  const absoluto = Math.abs(centimos)
  const entera = Math.floor(absoluto / 100)
  const decimal = String(absoluto % 100).padStart(2, '0')
  return `${signo}${entera}.${decimal}`
}

/** Porcentaje en puntos básicos, redondeando a mitad hacia arriba. */
export function porcentaje(centimos: number, bps: number): number {
  return Math.floor((centimos * bps + 5_000) / 10_000)
}

export function sumar(...importes: number[]): number {
  return importes.reduce((acumulado, importe) => acumulado + importe, 0)
}

export function multiplicar(centimos: number, cantidad: number): number {
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new AppError('VALIDACION', `Cantidad inválida: ${cantidad}`)
  }
  return centimos * cantidad
}
