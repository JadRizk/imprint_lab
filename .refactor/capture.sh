#!/usr/bin/env bash
# Baseline capture / comparison for the imprint_lab refactor.
#
#   ./.refactor/capture.sh              # write baseline (first run)
#   ./.refactor/capture.sh --compare    # capture to current/ and diff vs baseline/
#
# Env: PORT (default 3117)
#
# Why CSS and not screenshots: a lost token or dropped utility shows up here exactly,
# where a screenshot only catches it if the loss happens to be visible. Do both.

set -uo pipefail

PORT="${PORT:-3117}"
BASE="http://localhost:${PORT}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-}"

if [[ "$MODE" == "--compare" ]]; then
  OUT="$ROOT/.refactor/current"
else
  OUT="$ROOT/.refactor/baseline"
fi

ROUTES=("/" "/design-system" "/demo")

if ! curl -sf -m 10 -o /dev/null "$BASE/"; then
  echo "error: no dev server on $BASE" >&2
  echo "  start one:  cd apps/web && bunx next dev --port $PORT" >&2
  exit 1
fi

rm -rf "$OUT"; mkdir -p "$OUT"

for route in "${ROUTES[@]}"; do
  name="$(echo "$route" | sed 's#^/##; s#/#_#g')"; name="${name:-home}"
  html="$OUT/$name.html"

  if ! curl -sf -m 60 -o "$html" "$BASE$route"; then
    echo "error: failed to fetch $route" >&2
    exit 1
  fi

  # Collect every stylesheet the route pulls in.
  # Turbopack percent-encodes bracketed chunk names, so % must be in the class.
  grep -ohE '/_next/static/[a-zA-Z0-9._/%-]+\.css' "$html" | sort -u | while read -r href; do
    curl -sf -m 60 "$BASE$href"
    echo
  done > "$OUT/$name.css"

  echo "  $name — $(wc -c < "$html" | tr -d ' ') bytes html, $(wc -c < "$OUT/$name.css" | tr -d ' ') bytes css"
done

# ── Normalised, order-independent signals ──
# Custom properties: the token surface. Any disappearance here is a lost token.
cat "$OUT"/*.css \
  | grep -ohE '\-\-[a-zA-Z0-9_-]+[[:space:]]*:[^;{}]*' \
  | sed 's/[[:space:]]\+/ /g; s/ *$//' | sort -u > "$OUT/tokens.txt"

# Class selectors: the utility surface. Disappearance means a utility stopped generating.
cat "$OUT"/*.css \
  | grep -ohE '\.[a-zA-Z0-9\\:_-]+' \
  | sort -u > "$OUT/utilities.txt"

echo "  tokens: $(wc -l < "$OUT/tokens.txt" | tr -d ' ')  utilities: $(wc -l < "$OUT/utilities.txt" | tr -d ' ')"

if [[ "$MODE" == "--compare" ]]; then
  echo
  status=0
  for f in tokens utilities; do
    if diff -q "$ROOT/.refactor/baseline/$f.txt" "$OUT/$f.txt" >/dev/null 2>&1; then
      echo "OK    $f.txt identical to baseline"
    else
      echo "DRIFT $f.txt differs from baseline:"
      diff "$ROOT/.refactor/baseline/$f.txt" "$OUT/$f.txt" | head -40
      status=1
    fi
  done
  exit $status
fi

echo
echo "baseline written to .refactor/baseline/"
