#!/usr/bin/env bash
# Builds dist/site/: the folder that goes on the website at /walt/.
#   dist/site/walt.zip      only the files Chrome needs, unzipping to a "walt" folder
#   dist/site/version.json  {"version": "..."}, read by the download page
#   dist/site/index.html    the download page
#   dist/site/box.png       the box shown bouncing on the download page
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
mkdir -p dist/walt dist/site
for f in "${FILES[@]}"; do
  cp -R "$f" dist/walt/
done
find dist/walt -name '.DS_Store' -delete

# Same files in, same zip out: fixed timestamps and a sorted file order, so a
# push that doesn't change the extension doesn't change walt.zip either (and
# the deploy skips committing to personal-site).
find dist/walt -exec env TZ=UTC touch -t 202001010000 {} +
(cd dist && find walt -type f | LC_ALL=C sort | TZ=UTC zip -q -X -D site/walt.zip -@)
rm -rf dist/walt

printf '{ "version": "%s" }\n' "$VERSION" > dist/site/version.json
cp site/index.html dist/site/index.html
cp boxes/walt-original.png dist/site/box.png

echo "Built dist/site/ (version $VERSION)"
