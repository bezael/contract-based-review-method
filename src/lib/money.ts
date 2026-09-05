/**
 * Money arithmetic in cents.
 *
 * House rules:
 *  - Amounts enter and leave the API as decimal strings ("1234.56").
 *    Internally and in the database, they are integer cents. Never Float.
 *  - Rounding uses half-up, as required by accounting.
 *  - Percentages use basis points: 18% = 1800 bps.
 */
import { AppError } from './errors.js'

/** General tax rate for the Dominican Republic. */
export const TAX_BPS = 1800

const MONEY_FORMAT = /^\d{1,12}(\.\d{1,2})?$/

/** "1234.56" -> 123456. Only positive decimals with up to two digits are accepted. */
export function toCents(moneyValue: string): number {
  if (!MONEY_FORMAT.test(moneyValue)) {
    throw new AppError(
      'VALIDATION',
      `Invalid money format: "${moneyValue}". Expected format: 1234.56`,
    )
  }
  const [wholePart = '0', decimalPart = ''] = moneyValue.split('.')
  return Number(wholePart) * 100 + Number(decimalPart)
}

/** 123456 -> "1234.56". */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const absolute = Math.abs(cents)
  const wholePart = Math.floor(absolute / 100)
  const decimalPart = String(absolute % 100).padStart(2, '0')
  return `${sign}${wholePart}.${decimalPart}`
}

/** Percentage in basis points, rounded half-up. */
export function percentage(cents: number, basisPoints: number): number {
  return Math.floor((cents * basisPoints + 5_000) / 10_000)
}

export function sum(...amounts: number[]): number {
  return amounts.reduce((accumulated, amount) => accumulated + amount, 0)
}

export function multiply(cents: number, quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('VALIDATION', `Invalid quantity: ${quantity}`)
  }
  return cents * quantity
}
