import { describe, expect, it } from 'vitest'
import { AppError } from './errors.js'
import { aCentimos, formatear, multiplicar, porcentaje, sumar } from './money.js'

describe('aCentimos', () => {
  it('convierte un decimal con dos cifras a céntimos', () => {
    expect(aCentimos('1234.56')).toBe(123456)
    expect(aCentimos('100.00')).toBe(10000)
    expect(aCentimos('0.25')).toBe(25)
  })

  it('acepta enteros sin parte decimal', () => {
    expect(aCentimos('7')).toBe(700)
  })

  it('rechaza formatos que no son un decimal positivo', () => {
    for (const invalido of ['12,50', '-1.00', 'abc', '1.234', '']) {
      expect(() => aCentimos(invalido)).toThrow(AppError)
    }
  })
})

describe('formatear', () => {
  it('devuelve siempre dos decimales', () => {
    expect(formatear(123456)).toBe('1234.56')
    expect(formatear(5)).toBe('0.05')
    expect(formatear(0)).toBe('0.00')
  })

  it('conserva el signo', () => {
    expect(formatear(-1250)).toBe('-12.50')
  })
})

describe('porcentaje', () => {
  it('aplica puntos básicos sobre céntimos', () => {
    expect(porcentaje(10000, 1800)).toBe(1800)
  })

  it('redondea a mitad hacia arriba', () => {
    expect(porcentaje(1, 1800)).toBe(0) // 0.18
    expect(porcentaje(3, 1800)).toBe(1) // 0.54
    expect(porcentaje(25, 1800)).toBe(5) // 4.50 -> 5
  })
})

describe('sumar y multiplicar', () => {
  it('suma céntimos', () => {
    expect(sumar(100, 250, 5)).toBe(355)
    expect(sumar()).toBe(0)
  })

  it('multiplica por una cantidad entera positiva', () => {
    expect(multiplicar(1250, 3)).toBe(3750)
  })

  it('rechaza cantidades que no son enteros positivos', () => {
    expect(() => multiplicar(100, 0)).toThrow(AppError)
    expect(() => multiplicar(100, 1.5)).toThrow(AppError)
  })
})
