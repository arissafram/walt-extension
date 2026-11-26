#!/usr/bin/env bash
# Builds dist/walt.zip: only the files Chrome needs, no dev files.
# Unzips to a single "walt" folder that people pick in "Load unpacked".
# Usage: ./scripts/build-zip.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# Everything the extension loads. Add new top-level files here.
FILES=(
  manifest.json
  background.js
  content.js
  boxes.js
  site-bridge.js
  popup.html
  popup.js
  icon16.png icon32.png icon48.png icon128.png
  boxes
)

VERSION=$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')

rm -rf dist
mkdir -p dist/walt
for f in "${FILES[@]}"; do
  cp -R "$f" dist/walt/
done
find dist/walt -name '.DS_Store' -delete

(cd dist && zip -qr -X walt.zip walt)
rm -rf dist/walt

echo "Built dist/walt.zip (version $VERSION)"
