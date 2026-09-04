# [transversal] Identificador de petición en respuestas y logs

Labels: refactor, observabilidad

## Qué se quiere

Soporte no puede correlacionar una queja de un cliente con los logs. Cada
respuesta de la API lleva la cabecera `x-request-id`. Si la petición ya
traía una, se respeta; si no, se genera. Todos los logs de esa petición
incluyen el mismo identificador, y los errores `AppError` y los `500` lo
devuelven también en el cuerpo (`requestId`).

## Qué queda fuera

- Trazas distribuidas, OpenTelemetry.
- Cambiar el formato de los logs.
- Añadir dependencias: Fastify ya genera un id por petición y ya usa pino.

## Criterios de aceptación (verificables)

- [ ] Toda respuesta (200, 201, 400, 404, 409, 500) incluye `x-request-id`.
- [ ] Si la petición trae `x-request-id: abc-123`, la respuesta devuelve el mismo valor.
- [ ] Un cuerpo de error incluye `requestId` con el mismo valor que la cabecera.
- [ ] Un id entrante de más de 64 caracteres o con caracteres fuera de
      `[A-Za-z0-9._-]` se descarta y se genera uno nuevo.
- [ ] `pnpm typecheck && pnpm lint` en verde y `package.json` sin cambios.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `src/app.ts`
- `src/app.test.ts`
- `src/routes/*.test.ts` solo si hace falta añadir un caso; los asserts existentes no se tocan.
