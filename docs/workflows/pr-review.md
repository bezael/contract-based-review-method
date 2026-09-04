# Workflow · PR Review y decisión humana

Módulo 7. La Pull Request conecta Issue, spec, diff, veredicto y revisión
para que una persona decida el merge en minutos. Este documento cubre las
dos mitades: cómo se construye la PR y cómo se revisa.

## Construir la PR

Condiciones de entrada, todas:

1. Spec en `Estado: firmada`.
2. `pnpm verdict specs/<slug>/spec.md --write` en PASA.
3. Revisión del segundo agente con alineación Exacto y sin críticos.
4. Bucle largo en verde.

Con eso, la skill `revision-pr` (o `prompts/revision-pr.md`) rellena
`.github/PULL_REQUEST_TEMPLATE.md` con evidencia real y pregunta antes de
`gh pr create`.

Lo que va en cada sección:

| Sección | Contenido | De dónde sale |
|---|---|---|
| Contrato | Issue y spec | `specs/<slug>/spec.md` |
| Veredicto | Tabla criterio → estado → evidencia | Sección "## Veredicto" de la spec |
| Harness | Bucle corto y largo, rojos nuevos | Salida real de los comandos |
| Alcance | Ficheros dentro/fuera, asserts intactos, dependencias | `pnpm verdict:scope` |
| Para quien revisa | Lo único que hay que mirar a mano | La decisión de diseño que el contrato no cubre |

## Revisar la PR: los veinte minutos

Este es el cambio de trabajo entero del workshop. No se lee el diff de
arriba abajo. Se lee en este orden:

### 1. El veredicto (30 segundos)

¿Todos los criterios PASA? ¿Alcance limpio? ¿Asserts intactos? ¿CI verde?
Si algo está en rojo, la PR vuelve sin abrir el diff. Se sabe qué cláusula
se rompió antes de leer una línea de código.

### 2. El contrato (5 minutos)

Se lee la spec, no la implementación. La pregunta cambia: ya no es *"¿está
bien este código?"* sino *"¿pedí lo correcto?"*. Es la única pregunta que
solo puede responder una persona, y suele ser donde aparecen los problemas
de verdad: un criterio que se cumple pero no era lo que operaciones
necesitaba.

### 3. El diff, apuntando (10 minutos)

Solo donde el contrato no llega:

- Los nombres encajan con el dominio (`anularFactura`, no `cancelInvoice`).
- La solución es la adecuada para este proyecto, no la más general.
- Lo que ninguna comprobación automática iba a ver: un `count` que se
  volverá lento, una transacción que falta, un caso de negocio que la spec
  no nombró.

Si en este paso se encuentra algo que un comando podría haber detectado,
eso es un hueco del harness: se anota y se convierte en la siguiente mejora
de `AGENTS.md` o de la plantilla de spec.

### 4. Decidir

- **Merge**: veredicto PASA, contrato correcto, nada raro en el diff apuntado.
- **Cambios**: con el número del criterio o el fichero:línea. Nunca "revísalo todo".
- **Cerrar**: si el contrato estaba mal. Se corrige la spec y se vuelve a empezar; no se parchea en código.

## Protección de rama

Para que la capa "detectado" del carril valga algo:

- CI obligatorio en verde antes del merge.
- Al menos una aprobación humana.
- Sin push directo a `main`.

Sin esto, el veredicto es un consejo. Con esto, es una valla.
