/**
 * Errores de dominio.
 *
 * Todo error que la API devuelve a propósito es un `AppError` con un código
 * del catálogo. El handler de errores de `app.ts` lo traduce a HTTP. Nada más
 * en el código lanza strings ni `Error` pelado: eso es un 500 y se investiga.
 */
export const CODIGOS = {
  VALIDACION: 400,
  CLIENTE_NO_ENCONTRADO: 404,
  FACTURA_NO_ENCONTRADA: 404,
  RNC_DUPLICADO: 409,
  ESTADO_INVALIDO: 409,
} as const

export type CodigoError = keyof typeof CODIGOS

export class AppError extends Error {
  readonly codigo: CodigoError
  readonly status: number

  constructor(codigo: CodigoError, mensaje: string) {
    super(mensaje)
    this.name = 'AppError'
    this.codigo = codigo
    this.status = CODIGOS[codigo]
  }
}

export function esAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
