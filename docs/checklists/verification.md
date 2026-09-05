# Checklist de Verificación

Lo que certifica que una feature está terminada. Se recorre por tarea. Es el
Módulo 5, y lo que la PR (Módulo 7) tiene que poder demostrar.

La pregunta de fondo en cada punto: **¿qué cosa, que no sea yo, puede mirar
esto y decir que está mal?**

## Antes de escribir código

- [ ] La spec está en `Estado: firmada`.
- [ ] Cada criterio de aceptación tiene un comando entre backticks. Los que no lo tienen están fuera de la tabla.
- [ ] Los tests que codifican los criterios existen **y fallan** por el comportamiento que falta, no por un import roto, un fixture ausente o un typo. Un rojo por la razón equivocada no es evidencia.
- [ ] La rama se llama como la carpeta de la spec (`feat/<slug>`), para que el carril y el veredicto sepan qué contrato aplica.

## Durante la implementación

- [ ] Bucle corto después de cada cambio, no al final. Si tarda más de 60 s, el problema es el bucle, no la disciplina.
- [ ] Cualquier rojo que no esté en "Rojos conocidos" se arregla antes del siguiente cambio.
- [ ] Ningún assert existente modificado. Si uno parece mal, es otra tarea.
- [ ] Ningún `as any`, `eslint-disable`, `.skip`, `.only` ni `catch` vacío nuevo.
- [ ] Ninguna dependencia añadida sin acuerdo.
- [ ] Ningún fichero fuera del alcance. Si hizo falta, la spec lo dice y alguien lo firmó.

## Antes de la PR: el veredicto

- [ ] `pnpm build && pnpm test && pnpm smoke` en verde (bucle largo).
- [ ] `pnpm verdict specs/<slug>/spec.md --write`: cada criterio PASA, alcance limpio, asserts intactos.
- [ ] Los criterios marcados MANUAL están identificados y alguien los ha ejecutado de verdad, con Dado / Cuando / Entonces y resultado anotado.
- [ ] Evidencia previa revalidada: un test que pasó hace tres pasos puede haber dejado de pasar. Se ejecuta la suite completa, no el filtro.
- [ ] Revisión del segundo agente hecha, con alineación **Exacto**. Enredado se limpia; Incompleto se termina o se descarta por escrito en la spec.
- [ ] Ningún hallazgo crítico abierto.

## Lo que la PR enseña

- [ ] Issue y spec enlazados.
- [ ] Tabla de veredicto pegada tal cual sale del harness.
- [ ] Checklist de harness marcado solo con lo ejecutado; lo demás dice "no ejecutado".
- [ ] "Para quien revisa" nombra lo único que hay que mirar a mano y por qué. Si dice "todo", no está lista.

## Los veinte minutos de quien revisa

1. **Mira el veredicto.** Qué pasó, qué falló, qué se saltó. Treinta segundos.
2. **Lee el contrato**, no la implementación. La pregunta ya no es "¿está bien este código?" sino "¿pedí lo correcto?".
3. **Lee el diff, pero apuntando.** Donde el contrato no llega: nombres de dominio, decisiones de diseño, lo que ninguna comprobación automática iba a ver.

Ese tercer punto es el trabajo de verdad. Nunca fue buscar un `null` en cuatrocientas líneas.
