/**
 * Domain errors.
 *
 * Every error intentionally returned by the API is an `AppError` with a code
 * from the catalog. The error handler in `app.ts` maps it to HTTP. Nothing
 * else in the code throws strings or a bare `Error`: that becomes a 500.
 */
export const ERROR_CODES = {
  VALIDATION: 400,
  CUSTOMER_NOT_FOUND: 404,
  INVOICE_NOT_FOUND: 404,
  DUPLICATE_RNC: 409,
  INVALID_STATUS: 409,
} as const

export type ErrorCode = keyof typeof ERROR_CODES

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number

  constructor(code: ErrorCode, message: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = ERROR_CODES[code]
  }

  get errorCode(): ErrorCode {
    return this.code
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
