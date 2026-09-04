# [feat] Listar facturas con filtros y paginación

Labels: feature

## Qué se quiere

`GET /facturas` devuelve las facturas más recientes primero, con filtros
opcionales por `estado` y `clienteId`, y paginación con `pagina` (desde 1) y
`porPagina` (por defecto 20, máximo 100). La respuesta incluye los datos de
paginación para que el cliente sepa si hay más.

## Qué queda fuera

- Filtros por fecha o por importe.
- Búsqueda por texto.
- Ordenación configurable.

## Criterios de aceptación (verificables)

- [ ] `GET /facturas` sin parámetros devuelve `200` con `datos: [...]`
      ordenadas por `creadoEn` descendente y `paginacion: { pagina: 1, porPagina: 20, total: N }`.
- [ ] `?estado=EMITIDA` devuelve solo facturas emitidas; un estado que no
      existe en `ESTADOS` devuelve `400 VALIDACION`.
- [ ] `?clienteId=<id>` devuelve solo las de ese cliente; un cliente sin
      facturas devuelve lista vacía y `total: 0`, no 404.
- [ ] `?pagina=2&porPagina=2` con 5 facturas devuelve exactamente las
      facturas 3 y 4 del orden.
- [ ] `porPagina=101` o `pagina=0` devuelven `400 VALIDACION`.
- [ ] Cada elemento de `datos` tiene la misma forma que `GET /facturas/:id`
      (mismo DTO), incluidas las líneas.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `src/services/facturas.ts`
- `src/routes/facturas.ts`
- Sus tests
