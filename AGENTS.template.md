# AGENTS.template.md

> Plantilla del **contrato permanente** de un repositorio: lo que un agente
> necesita saber antes de tocar una línea, y lo que no puede tocar sin permiso.
> Cópiala a la raíz de tu repo como `AGENTS.md` y sustitúyela entera.
>
> No es documentación. Es el fichero que decide si puedes fiarte del diff sin
> leerlo. Cuando el agente hace algo que no querías, la respuesta casi siempre
> es "eso no estaba aquí".

## Cómo se usa

1. Copia este fichero a la raíz de tu repo y renómbralo a `AGENTS.md`.
2. Con Claude Code, crea además `CLAUDE.md` con una sola línea: `@AGENTS.md`.
   Un contrato, dos puertas de entrada.
3. **Ejecuta cada comando antes de escribirlo.** Es la regla de oro y no tiene
   excepciones: un harness con comandos inventados es peor que no tener
   harness, porque el agente cree que está verificado y tú también.
4. Borra todas las citas de instrucción (las líneas que empiezan por `>`) y las
   marcas `[CAMBIA]` / `[COPIA]` / `[FORMATO FIJO]`. En tu `AGENTS.md` no queda
   ni una.
5. Repasa la checklist del final y bórrala también.

### Marcas de esta plantilla

| Marca | Qué significa |
|---|---|
| `{{ASÍ}}` | Dato tuyo. Si no lo verificaste, no lo escribas: déjalo fuera y anótalo como hueco. |
| `> Cita en bloque` | Instrucción para ti. Se borra antes del commit. |
| **[CAMBIA]** | Sección que se reescribe entera. Copiarla tal cual es mentir en el contrato. |
| **[COPIA]** | Portable entre repos. Cámbiala solo si sabes por qué. |
| **[FORMATO FIJO]** | La leen los scripts y los hooks. Cambia el contenido, nunca la estructura. |

### Cuánto debe medir

Dos pantallas. Si tu `AGENTS.md` pasa de unas 150 líneas, no lo lee nadie: ni
la persona nueva del equipo ni el agente con el contexto lleno. Lo que no cabe
se va a `docs/` y se enlaza desde aquí.

---

<!-- ↓↓↓ A partir de aquí empieza lo que copias a tu AGENTS.md ↓↓↓ -->

# AGENTS.md

> **[CAMBIA]** Dos o tres frases: qué es este proyecto, para quién y —sobre
> todo— **qué NO es**. Esta última parte desactiva suposiciones caras. Un
> ejemplo real: "No es pública: todo el tráfico entra por el gateway, así que no
> hay autenticación ni rate limiting aquí, y no hay que añadirlos". Sin esa
> frase, el agente te añade auth "por si acaso" y tú lo descubres en la review.

{{QUÉ ES ESTE PROYECTO. QUÉ HACE Y PARA QUIÉN.}}

{{QUÉ NO ES. LO QUE ALGUIEN CON BUEN CRITERIO PODRÍA AÑADIR Y NO DEBE.}}

Este fichero es el contrato permanente del repo. El contrato de cada tarea vive
en `specs/<slug>/spec.md`.

## Stack — [CAMBIA]

> Versiones exactas, no rangos. Y di de dónde sale cada dato: el gestor de
> paquetes se deriva del lockfile, no de la costumbre del equipo. Si hay dos
> lockfiles, ese es tu primer bug.

- **Lenguaje:** {{LENGUAJE Y VERSIÓN}}, {{RUNTIME Y VERSIÓN}}
- **Framework:** {{FRAMEWORK Y VERSIÓN}}
- **Gestor de paquetes:** {{GESTOR}} — derivado de `{{LOCKFILE}}`. No uses otro.
- **Persistencia:** {{BASE DE DATOS / ORM / DÓNDE VIVE EL FICHERO O LA CONEXIÓN}}
- **Tests:** {{RUNNER Y VERSIÓN}}, {{CÓMO ESTÁN ORGANIZADOS}}
- **Lint / formato:** {{HERRAMIENTA}}, configuración en `{{FICHERO}}`

## Cómo se trabaja — [COPIA], con el punto 5 a tu medida

1. Toda tarea nace de un Issue y se firma en `specs/<slug>/spec.md` antes de
   tocar código (plantilla en `specs/spec.template.md`).
2. La rama se llama `feat/<slug>`, `fix/<slug>` o `refactor/<slug>`. El slug es
   el de la carpeta de la spec: así el carril y el veredicto saben qué contrato
   aplica.
3. Se implementa solo lo que la spec pide, dentro de su alcance de modificación.
4. Antes de abrir la PR: `{{COMANDO_VEREDICTO}} specs/<slug>/spec.md`. Lo que
   sale ahí es lo que lee la persona que revisa, en vez del diff.
5. {{EL RITUAL DEL REPO QUE SIEMPRE SE OLVIDA Y ROMPE LOS TESTS: regenerar el
   cliente del ORM al cambiar de rama, levantar un contenedor, sembrar la BD.
   Escribe también el síntoma, para que se reconozca: "si no, los tests fallan
   con «no such column»".}}

## Verificación — [CAMBIA] los comandos, [FORMATO FIJO] la estructura

> Los dos bucles no son adorno. El corto lo ejecuta el agente solo, después de
> cada cambio, y por eso tiene que bajar de 60 segundos: si tarda más, deja de
> ejecutarlo. El largo es la puerta de la PR.
>
> Cada comando lleva su tiempo medido, no estimado. Y todos han sido ejecutados
> por ti antes de aparecer aquí.

Estos comandos están ejecutados y comprobados. Son el harness: si uno falla, el
trabajo no está hecho. Tiempos medidos en caliente; la primera ejecución tarda
el doble.

### Bucle corto — después de cada cambio

```bash
{{COMANDO_TIPOS}}      # {{N}}s
{{COMANDO_LINT}}       # {{N}}s
{{COMANDO_TEST_UNIT}}  # {{N}}s
```

### Bucle largo — antes de abrir la PR

```bash
{{COMANDO_BUILD}}      # {{N}}s
{{COMANDO_TEST_ALL}}   # {{N}}s
{{COMANDO_SMOKE_E2E}}  # {{N}}s
```

### Veredicto de la tarea

```bash
{{COMANDO_VEREDICTO}} specs/<slug>/spec.md   # ejecuta cada criterio y comprueba el alcance
```

### Rojos conocidos

> Lo que ya fallaba antes de que llegara el agente, con el número de fallos.
> Sirve para que distinga lo que rompió él de lo que estaba roto. Un harness
> honesto con dos rojos vale más que un verde falso.
>
> Si no hay ninguno, escríbelo con fecha: "Ninguno. Todo el harness está en
> verde a fecha de {{AAAA-MM-DD}}. Si algo falla, lo rompiste tú." Esa última
> frase le quita al agente la excusa de "ya venía así".

{{LISTA DE ROJOS CONOCIDOS, CON SU COMANDO Y CUÁNTOS FALLOS · O LA FRASE DE ARRIBA CON SU FECHA}}

## Convenciones — [CAMBIA]

> Aquí es donde casi todo el mundo escribe deseos en vez de hechos. Las
> convenciones se **detectan leyendo tu código**, no se importan de una guía de
> estilo. Abre cinco o diez ficheros reales y anota lo que ya se hace.
>
> Cada viñeta: qué se hace, dónde vive y por qué —o qué pasó la vez que alguien
> no lo hizo. El "por qué" es lo que evita que el agente lo negocie.
>
> Categorías que casi siempre dan una convención útil: qué capa puede hablar con
> cuál · errores de dominio · tipos delicados (dinero, fechas, ids) · dónde se
> valida la entrada · dónde viven los tests y cómo se aíslan · nomenclatura e
> idioma del código.

Detectadas leyendo el código, no impuestas desde fuera:

- {{QUÉ CAPA PUEDE HABLAR CON CUÁL. Ej.: los handlers de rutas no tocan el ORM: pasan por un servicio.}}
- {{CÓMO SE SEÑALAN LOS ERRORES DE DOMINIO, y qué significa saltárselo.}}
- {{EL TIPO QUE YA OS HA MORDIDO: dinero, fechas, zonas horarias, ids.}}
- {{DÓNDE SE VALIDA LA ENTRADA Y QUÉ DA POR VÁLIDO CADA CAPA.}}
- {{DÓNDE VIVEN LOS TESTS Y CÓMO SE AÍSLAN ENTRE SÍ.}}
- {{NOMENCLATURA E IDIOMA: qué se nombra en qué y con qué criterio.}}

## Límites — [FORMATO FIJO]

> Esta sección la lee una máquina. Respeta el formato o la valla se abre sola:
>
> - El encabezado tiene que ser exactamente `## Límites`.
> - **Una ruta por viñeta, entre backticks, y la primera de la línea es la única
>   que cuenta.** Si escribes «- `a.ts` y `b.ts`», solo queda protegido `a.ts`.
> - Sin espacios dentro de la ruta.
> - Se admiten globs: `carpeta/` (todo lo de dentro), `*`, `**`, `?`. Para una
>   familia de ficheros, `.env*` en una viñeta en vez de dos.
> - El texto que va después del backtick es para la persona: pon ahí el motivo.
>   Los límites que se explican se discuten menos.
>
> Las viñetas de abajo son el mínimo portable: cámbialas a las rutas de tu repo,
> pero no las quites. La que de verdad es tuya es la del fichero que ya os ha
> mordido.

Sin permiso explícito en la spec de la tarea, el agente no toca:

- `{{ruta/de/migraciones/}}` — una migración se revisa a mano, siempre.
- `{{ruta/del/esquema}}` — el esquema se cambia con una persona delante.
- `{{.github/workflows/}}` — CI y despliegue.
- `{{manifiesto}}` — no se añaden ni se actualizan dependencias. Si hace falta una, para y pregunta.
- `{{lockfile}}` — lo mismo, y no se regenera "de paso".
- `{{.env*}}` — credenciales.
- `{{ruta/del/fichero/que/ya/os/mordio}}` — {{por qué duele tocarlo}}.
- `{{ruta/del/harness}}` — quien recibe el veredicto no edita a quien lo emite.
- Los asserts de los tests que ya existen. Añadir tests nuevos, sí. Cambiar los
  que ya estaban, no: eso se corrige aparte y a mano.

> **[COPIA]** el párrafo siguiente si tienes el hook instalado. Bórralo si no:
> prometer una valla que no existe es peor que declarar una señal.

Estos límites no son solo una señal: el hook `.claude/hooks/guard-boundaries.mjs`
bloquea la escritura en las rutas de esta lista salvo que la spec activa las
incluya en su alcance.

## Definición de terminado — [COPIA]

Una tarea está terminada cuando:

1. El bucle corto pasa en verde.
2. El bucle largo pasa en verde.
3. Cada criterio de aceptación de la spec tiene evidencia: qué comando lo
   demuestra y cuál fue su salida.
4. El diff no contiene nada que la spec no pidiera.

El punto 4 es el que más veces se olvida. Código de más es código sin contrato.

<!-- ↑↑↑ Aquí termina lo que copias a tu AGENTS.md ↑↑↑ -->

---

## Antes de dar por bueno tu AGENTS.md — borra esta sección

- [ ] **Ningún hueco sin rellenar.** `grep -n "{{" AGENTS.md` no devuelve nada.
- [ ] **Ninguna instrucción de la plantilla.** No quedan citas de ayuda ni marcas
      `[CAMBIA]`, `[COPIA]`, `[FORMATO FIJO]`, ni los comentarios de corte.
- [ ] **Cada comando ejecutado**, con su tiempo real al lado. Ninguno copiado de
      otro repo ni deducido del manifiesto.
- [ ] **El bucle corto baja de 60 segundos.** Si no, algo tiene que bajar al largo.
- [ ] **Los límites los ve el parser.** Si has copiado el harness de este repo,
      no lo mires a ojo: imprímelos.

  ```bash
  node -e "import('./scripts/lib/spec.mjs').then(m => console.log(m.boundaries(require('fs').readFileSync('AGENTS.md', 'utf8'))))"
  ```

  La lista que sale es **lo único** que la valla protege. Cuenta las viñetas de
  tu sección `## Límites`: si salen menos rutas de las que escribiste, tienes
  dos en la misma línea. Lo que no aparece ahí es una señal, no un límite.
- [ ] **Las convenciones salen de tu código**, no de tus buenas intenciones: cada
      una se puede señalar con un fichero y una línea.
- [ ] **Cabe en dos pantallas** y un agente sin más contexto puede arrancar solo
      con este fichero.
