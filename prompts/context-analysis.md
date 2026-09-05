# Análisis de contexto

Pega esto al abrir el repo por primera vez con un agente nuevo. No pide
código: pide que demuestre que ha entendido dónde está.

---

Antes de tocar nada, quiero que entiendas este repositorio. Lee y ejecuta;
no modifiques ningún fichero.

1. Lee `AGENTS.md` entero. Es el contrato permanente de este repo.
2. Lee `specs/INDEX.md` y las specs que existan en `specs/*/spec.md`.
3. Abre tres ficheros de `src/` de distintas carpetas (`lib/`, `services/`,
   `routes/`) y su test. Anota las convenciones que ves en el código, no las
   que te gustaría que tuviera.
4. Ejecuta el bucle corto tal y como lo define `AGENTS.md`. Anota el
   resultado real de cada comando: exit code y tiempo.

Devuélveme, en menos de 40 líneas:

- **Stack** y gestor de paquetes, con el lockfile que lo demuestra.
- **Cómo se verifica**: los comandos del bucle corto y del largo, con el
  resultado que acabas de obtener. Si alguno falló, di cuál y por qué, y si
  está en la lista de rojos conocidos.
- **Convenciones** que has visto en el código (mínimo cinco), cada una con
  el fichero donde la viste.
- **Límites**: qué no puedes tocar sin permiso, y qué mecanismo lo impide
  además de declararlo.
- **Cómo se trabaja aquí**: de dónde sale una tarea, dónde vive su contrato,
  cómo se llama la rama y qué se ejecuta antes de la PR.
- **Tres preguntas** que te harías antes de aceptar tu primera tarea aquí.

No propongas mejoras. No es el momento.
