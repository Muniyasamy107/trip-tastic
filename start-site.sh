#!/usr/bin/env bash
# Trip Tastic — local dev server (macOS / Linux). Usage: ./start-site.sh
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "  [X] Node.js kaanom — https://nodejs.org la LTS (Node 20+) install pannunga."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "  [1/2] Packages install aaguthu (first time mattum)…"
  npm install
fi

echo "  [2/2] Server start aaguthu… free port automatic-a edukkum."
exec node scripts/launch.mjs
