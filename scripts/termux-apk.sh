#!/data/data/com.termux/files/usr/bin/bash

set -euo pipefail

REPO="HOWCKs/ParentLock"
BRANCH="arena/019fbfa8-parentlock"
WORKFLOW="android-apk.yml"
OUTPUT_DIR="${HOME}/storage/downloads/ParentLock"

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

APK="$(find "$OUTPUT_DIR" -type f -name '*.apk' -print -quit)"
if [ -z "$APK" ]; then
  echo "A build terminou, mas nenhum APK foi encontrado em $OUTPUT_DIR." >&2
  exit 1
fi

echo
echo "APK disponível em: $APK"
ls -lh "$APK"

if command -v termux-open >/dev/null 2>&1; then
  echo "Abrindo instalador Android..."
  termux-open "$APK"
fi
