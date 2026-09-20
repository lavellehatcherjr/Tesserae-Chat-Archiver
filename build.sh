#!/usr/bin/env bash
# Assembles extension/ into the zip that goes on a release. Nothing is compiled;
# the extension ships exactly as written. Needs bash, sed and zip, so it runs
# anywhere including a fresh container.
set -euo pipefail
cd "$(dirname "$0")"
ROOT=$PWD
NAME=tesserae-chat-archiver

command -v zip >/dev/null || { echo "zip is not installed" >&2; exit 1; }

VERSION=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' extension/manifest.json | head -1)
[ -n "$VERSION" ] || { echo "no version in extension/manifest.json" >&2; exit 1; }

OUT=$NAME-v$VERSION.zip
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

mkdir "$STAGE/$NAME"
cp -R extension/. "$STAGE/$NAME/"
cp README.md LICENSE "$STAGE/$NAME/"   # the download should stand on its own

rm -f "$OUT"
( cd "$STAGE" && zip -rX9 "$ROOT/$OUT" "$NAME" >/dev/null )

echo "$OUT"
if command -v sha256sum >/dev/null; then sha256sum "$OUT"; else shasum -a 256 "$OUT"; fi
