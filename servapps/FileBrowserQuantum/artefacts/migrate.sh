#!/bin/sh
# FileBrowser Quantum servapp bootstrap — runs on EVERY container start.
# Makes v1 -> v2 migration work WITHOUT uninstall/reinstall:
#   1. If config.yaml is missing or is still the old v1 format, replace it with the
#      current v2 servapp config (fetched from this store's Pages artifact).
#   2. If a legacy BoltDB (data/database.db) exists and no SQLite DB yet, append
#      server.database.migrateFrom so FileBrowser v2 imports it on this boot.
#   3. Otherwise just start FileBrowser.
# All steps are idempotent, so this is safe on every start (fresh install or update).

set -e
cd /home/filebrowser || exit 1

CONFIG_URL="https://aseracorp.github.io/resiSTORE/servapps/FileBrowserQuantum/artefacts/config.yaml"
CONFIG="$PWD/data/config.yaml"
LEGACY="$PWD/data/database.db"
SQLITE="$PWD/data/database.sqlite"

# 1) Ensure the v2 config is in place.
if [ ! -s "$CONFIG" ] || ! grep -q "^http:" "$CONFIG" 2>/dev/null; then
  echo "[fbq-bootstrap] replacing config with v2 config"
  mkdir -p "$(dirname "$CONFIG")"
  if command -v wget >/dev/null 2>&1; then
    wget -q -O "$CONFIG" "$CONFIG_URL"
  else
    curl -fsSL -o "$CONFIG" "$CONFIG_URL"
  fi
fi

# 2) Enable one-time migration from a legacy BoltDB if one exists and SQLite has not been created yet.
if [ -f "$LEGACY" ] && [ ! -f "$SQLITE" ]; then
  if ! grep -q "migrateFrom" "$CONFIG" 2>/dev/null; then
    echo "[fbq-bootstrap] enabling migration from $LEGACY"
    printf '\nserver:\n  database:\n    migrateFrom: %s\n' "$LEGACY" >> "$CONFIG"
  fi
fi

# 3) Start FileBrowser.
exec ./filebrowser "$@"