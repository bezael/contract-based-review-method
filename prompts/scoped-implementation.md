# Implementación acotada

Un paso cada vez. El bucle corto después de cada cambio.

---

Implementa el paso <N> del plan, y solo ese.

Contrato de este paso:

- **Alcance**: los ficheros que el plan asigna a este paso. Si necesitas
  salir de ahí, para y dímelo. No toques nada de los límites de `AGENTS.md`
  que la spec no autorice: el hook te lo bloqueará, y si no lo hace, lo
  detectará el veredicto.
- **Después de cada cambio** ejecuta el bucle corto de `AGENTS.md`
  (`pnpm typecheck`, `pnpm lint`, `pnpm test:unit`) y muéstrame el resultado
  real. No sigas con el siguiente cambio si hay un rojo que no estaba en
  "Rojos conocidos".
- **Al terminar el paso** ejecuta el comando que el plan asigna al paso y
  pégame su salida.

Lo que no haces, aunque parezca buena idea:

- Modificar un assert de un test que ya existía. Si crees que el assert está
  mal, para y dímelo: es otra tarea.
- Añadir una dependencia. Si hace falta una, para y pregunta.
- Poner `as any`, `// eslint-disable`, `.skip` o un `catch` vacío para que
  algo pase.
- Arreglar de paso cosas que ves por ahí. Anótamelas al final, en una lista
  aparte, y sigue.

Cuando el paso esté hecho y en verde, para y espera al siguiente. Si algo
te impide cumplir un criterio sin salirte del alcance, la respuesta correcta
es una frase: "no puedo cumplir el criterio X sin tocar Y", no un rodeo.
