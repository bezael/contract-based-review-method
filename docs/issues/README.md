# Issues para practicar

Diez tareas reales sobre esta API, en tres niveles. Ninguna trae la spec
hecha: escribirla es la mitad del ejercicio (Módulo 2). Elige una, abre la
rama con su slug y reproduce el ciclo entero sin seguir al instructor:
contrato → carril → implementación → veredicto → revisión → PR.

| # | Tipo | Tarea | Nivel | Toca límites |
|---|---|---|---|---|
| 01 | feature | Anular una factura emitida | ★☆☆ | no |
| 02 | feature | Registrar pagos y pasar a PAGADA | ★★☆ | migración |
| 03 | feature | Listar facturas con filtros y paginación | ★★☆ | no |
| 04 | feature | Líneas exentas de ITBIS | ★★☆ | migración |
| 05 | bug | Un precio con un solo decimal se registra mal | ★☆☆ | `money.ts` |
| 06 | bug | Emitir dos veces cambia el número de la factura | ★☆☆ | no |
| 07 | refactor | Extraer la numeración a un servicio propio | ★★☆ | no |
| 08 | arquitectura | Historial de cambios de estado | ★★★ | migración |
| 09 | feature | Notas de crédito | ★★★ | migración (y hay que dividirla) |
| 10 | transversal | Identificador de petición en respuestas y logs | ★★☆ | no |

`00-demo-descuento-factura.md` es la feature que se construye en el workshop
delante de ti. Está aquí para que puedas repetirla por tu cuenta.

## Publicarlos en tu fork

Con `gh` autenticado y el repo apuntando a tu fork:

```bash
bash scripts/create-issues.sh
```

Crea un Issue por fichero, con su etiqueta. `scripts/create-issues.sh --dry-run`
solo muestra lo que haría.

## Orden recomendado

Empieza por 06 (bug pequeño, sin límites), sigue con 01 (feature sin
migración) y después 05 (te obliga a autorizar un límite en la spec). A
partir de ahí, el que más se parezca a tu trabajo.
