#!/usr/bin/env bash
# Publica docs/issues/NN-*.md como Issues de GitHub en el repo actual.
#
#   bash scripts/create-issues.sh            crea los issues
#   bash scripts/create-issues.sh --dry-run  solo muestra qué haría
#
# Cada fichero: primera línea "# Título", una línea "Labels: a, b" y el resto
# es el cuerpo. Requiere `gh` autenticado y el remoto apuntando a tu fork.
set -euo pipefail

cd "$(dirname "$0")/.."
DRY_RUN="${1:-}"

for fichero in docs/issues/[0-9][0-9]-*.md; do
  titulo="$(sed -n '1s/^# //p' "$fichero")"
  etiquetas="$(sed -n 's/^Labels:[[:space:]]*//p' "$fichero" | tr -d ' ')"
  cuerpo="$(sed '1d; /^Labels:/d' "$fichero")"

  args=(--title "$titulo" --body "$cuerpo")
  [ -n "$etiquetas" ] && args+=(--label "$etiquetas")

  if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "gh issue create --title \"$titulo\" --label \"$etiquetas\"   # $fichero"
  else
    for etiqueta in ${etiquetas//,/ }; do
      gh label create "$etiqueta" --force >/dev/null 2>&1 || true
    done
    gh issue create "${args[@]}"
  fi
done
