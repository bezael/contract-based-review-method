# Contrato — Issue #142: rate limit en el endpoint de login

## Carril (lo único que se puede tocar)
- `src/auth/login.ts`
- `src/auth/rate-limit.ts` (nuevo)
- `src/auth/login.test.ts`

## Criterios de aceptación
1. Un mismo email no puede intentar login más de 5 veces en 15 minutos.
2. Al superar el límite, la respuesta es 429 con cabecera `Retry-After`.
3. El contador se resetea tras un login correcto.
4. La firma pública de `login()` no cambia.

## Prohibido
- Tocar el esquema de base de datos.
- Cambiar firmas de funciones exportadas.
- Añadir dependencias nuevas.
