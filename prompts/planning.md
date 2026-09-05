# Planificación · de la spec firmada al plan

Solo después de que la spec esté en `Estado: firmada`.

---

La spec `specs/<slug>/spec.md` está firmada. Antes de escribir código quiero
el plan de implementación. Sin código todavía.

Devuélveme una lista numerada de pasos donde cada paso:

- Toca **uno o dos ficheros** del alcance de modificación de la spec, y
  ninguno fuera.
- Termina con **un comando del bucle corto** o con el comando de un criterio
  concreto de la spec que tiene que pasar al final del paso. Un paso sin
  comando al final no es un paso.
- Dice qué criterio de aceptación acerca (número).

Orden obligatorio: primero los tests que codifican cada criterio (tienen que
fallar por el comportamiento que falta, no por un import roto), después la
implementación mínima que los pone en verde, después la limpieza si aporta.

Además:

1. Si al planificar descubres que un criterio es ambiguo, pide dos cosas a la
   vez o no se puede verificar con el comando que dice, **para** y dímelo.
   Se corrige la spec, no el plan.
2. Si necesitas tocar un fichero que no está en el alcance, **para** y dime
   cuál y por qué. No lo añadas al plan por tu cuenta.
3. No añadas pasos que ningún criterio pida: renombrados, refactors de paso,
   "mejoras" de ficheros vecinos. Código de más es código sin contrato.
4. Termina con la lista de riesgos de la spec y, para cada uno, en qué paso
   del plan queda cubierto.

Muéstrame el plan y para. Empezamos por el paso 1 cuando yo lo diga.
