#!/data/data/com.termux/files/usr/bin/bash

set -euo pipefail

REPO="HOWCKs/ParentLock"
BRANCH="arena/019fbfa8-parentlock"
WORKFLOW="android-apk.yml"
OUTPUT_DIR="${HOME}/storage/downloads/ParentLock"
TARGET="${1:-}"

command -v gh >/dev/null 2>&1 || {
  echo "GitHub CLI não encontrado. Instale com: pkg install gh" >&2
  exit 1
}

gh auth status >/dev/null

if [ ! -d "${HOME}/storage/downloads" ] && command -v termux-setup-storage >/dev/null 2>&1; then
  termux-setup-storage
fi

RUN_ID="$(gh run list \
  --repo "$REPO" \
  --workflow "$WORKFLOW" \
  --branch "$BRANCH" \
  --limit 1 \
  --json databaseId \
  --jq '.[0].databaseId')"

if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo "Nenhuma execução do APK foi encontrada para $BRANCH." >&2
  exit 1
fi

echo "Acompanhando a build Android: $RUN_ID"
gh run watch "$RUN_ID" --repo "$REPO" --exit-status

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "Baixando o artefato parentlock-interface-debug..."
for ATTEMPT in 1 2 3; do
  rm -rf "$OUTPUT_DIR"
  mkdir -p "$OUTPUT_DIR"
  if gh run download "$RUN_ID" \
    --repo "$REPO" \
    --name parentlock-interface-debug \
    --dir "$OUTPUT_DIR"; then
    break
  fi
  if [ "$ATTEMPT" = "3" ]; then
    echo "Não foi possível baixar o artefato após 3 tentativas." >&2
    exit 1
  fi
  echo "Download interrompido; tentando novamente em $((ATTEMPT * 5)) segundos..." >&2
  sleep $((ATTEMPT * 5))
done

mapfile -t APKS < <(find "$OUTPUT_DIR" -type f -name '*.apk' -print | sort)
if [ "${#APKS[@]}" -eq 0 ]; then
  echo "A build terminou, mas nenhum APK foi encontrado em $OUTPUT_DIR." >&2
  exit 1
fi

echo
echo "APKs disponíveis:"
printf ' - %s\n' "${APKS[@]}"

if [ -n "$TARGET" ]; then
  if [ "$TARGET" != "admin" ] && [ "$TARGET" != "companion" ]; then
    echo "Uso: bash scripts/termux-apk.sh [admin|companion]" >&2
    exit 1
  fi
  APK="$(find "$OUTPUT_DIR" -type f -iname "*${TARGET}*.apk" -print -quit)"
  if [ -z "$APK" ]; then
    echo "APK do perfil '$TARGET' não encontrado." >&2
    exit 1
  fi
  echo "Abrindo instalador: $APK"
  if command -v termux-open >/dev/null 2>&1; then
    termux-open "$APK"
  fi
else
  echo
echo "Para instalar o app administrador:"
  echo "  bash scripts/termux-apk.sh admin"
  echo "Para instalar o app acompanhado:"
  echo "  bash scripts/termux-apk.sh companion"
fi
