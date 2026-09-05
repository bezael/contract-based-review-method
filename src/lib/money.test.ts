import { describe, expect, it } from 'vitest'
import { AppError } from './errors.js'
import { formatMoney, multiply, percentage, sum, toCents } from './money.js'

describe('toCents', () => {
  it('converts a decimal with two digits to cents', () => {
    expect(toCents('1234.56')).toBe(123456)
    expect(toCents('100.00')).toBe(10000)
    expect(toCents('0.25')).toBe(25)
  })

  it('accepts integers without a decimal part', () => {
    expect(toCents('7')).toBe(700)
  })

  it('rejects formats that are not a positive decimal', () => {
    for (const invalidValue of ['12,50', '-1.00', 'abc', '1.234', '']) {
      expect(() => toCents(invalidValue)).toThrow(AppError)
    }
  })
})

describe('formatMoney', () => {
  it('always returns two decimal places', () => {
    expect(formatMoney(123456)).toBe('1234.56')
    expect(formatMoney(5)).toBe('0.05')
    expect(formatMoney(0)).toBe('0.00')
  })

  it('preserves the sign', () => {
    expect(formatMoney(-1250)).toBe('-12.50')
  })
})

describe('percentage', () => {
  it('applies basis points to cents', () => {
    expect(percentage(10000, 1800)).toBe(1800)
  })

  it('rounds half up', () => {
    expect(percentage(1, 1800)).toBe(0) // 0.18
    expect(percentage(3, 1800)).toBe(1) // 0.54
    expect(percentage(25, 1800)).toBe(5) // 4.50 -> 5
  })
})

describe('sum and multiply', () => {
  it('adds cents', () => {
    expect(sum(100, 250, 5)).toBe(355)
    expect(sum()).toBe(0)
  })

  it('multiplies by a positive integer quantity', () => {
    expect(multiply(1250, 3)).toBe(3750)
  })

  it('rejects values that are not positive integers', () => {
    expect(() => multiply(100, 0)).toThrow(AppError)
    expect(() => multiply(100, 1.5)).toThrow(AppError)
  })
})
