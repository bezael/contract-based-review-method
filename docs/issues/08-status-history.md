# [arquitectura] Historial de cambios de estado

Labels: feature, arquitectura

## Qué se quiere

Auditoría exige saber cuándo cambió de estado cada factura. Cada transición
(`DRAFT → ISSUED`, y las que existan: anulación, pago) deja un evento con
el estado anterior, el nuevo y la fecha. `GET /facturas/:id/historial`
devuelve la lista en orden cronológico.

## Qué queda fuera

- Quién hizo el cambio (no hay usuarios en esta API).
- Eventos que no sean cambios de estado.
- Borrar o editar el historial.

## Criterios de aceptación (verificables)

- [ ] Al crear una factura se registra un evento `null → DRAFT`.
- [ ] Al emitir, un evento `DRAFT → ISSUED` con la misma fecha que `emitidaEn`.
- [ ] `GET /facturas/:id/historial` devuelve los eventos ordenados por fecha
      ascendente, con `de`, `a` y `fecha` en ISO UTC.
- [ ] Sobre un id inexistente devuelve `404 FACTURA_NO_ENCONTRADA`.
- [ ] La escritura del evento y el cambio de estado ocurren en la misma
      transacción: si falla una, no queda la otra (test que fuerza el fallo).
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `prisma/schema.prisma` y una migración: tabla `EventoFactura`.
  **Límite de AGENTS.md: lo autoriza quien firma la spec.**
- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- Sus tests

## Contexto

Si ya se implementaron los issues 01 o 02, sus transiciones también generan
evento. Si no, la spec lo deja fuera explícitamente.
