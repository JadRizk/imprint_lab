#!/usr/bin/env bash
# Baseline capture / comparison for the imprint_lab refactor.
#
#   ./.refactor/capture.sh              # write baseline (or promote after an accepted phase)
#   ./.refactor/capture.sh --compare    # capture to current/ and diff vs baseline/
#
# Env: PORT (apps/docs, default 3118)
#
# Why CSS and not screenshots: a lost token or dropped utility shows up here
# exactly, where a screenshot only catches it if the loss happens to be visible.
# Do both.
#
# Capture against a COLD server. Turbopack's HMR does not always recompile CSS
# before the next request, so a capture taken moments after an edit can report
# the previous build. If a diff looks implausible, restart, delete .next/dev,
# and re-capture before believing it.

set -uo pipefail

PORT="${PORT:-3118}"
DOCS="http://localhost:${PORT}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-}"

if [[ "$MODE" == "--compare" ]]; then
  OUT="$ROOT/.refactor/current"
else
  OUT="$ROOT/.refactor/baseline"
fi

# Phase 06 dissolved apps/web into apps/docs — one site, four routes per system.
DOCS_ROUTES=(
  "/"
  "/systems/human-laboratory"
  "/systems/human-laboratory/components"
  "/systems/human-laboratory/example"
  "/systems/human-laboratory/report"
)

require_server() {
  if ! curl -sf -m 10 -o /dev/null "$1/"; then
    echo "error: no dev server on $1" >&2
    echo "  start one:  cd $2 && bunx next dev --port $3" >&2
    exit 1
  fi
}

capture() {   # capture <base-url> <prefix> <route>
  local base="$1" prefix="$2" route="$3" name html
  name="$(echo "$route" | sed 's#^/##; s#/#_#g')"
  name="${prefix}${name:-home}"
  html="$OUT/$name.html"

  if ! curl -sf -m 60 -o "$html" "$base$route"; then
    echo "error: failed to fetch $base$route" >&2
    exit 1
  fi

  # Collect every stylesheet the route pulls in.
  # Turbopack percent-encodes bracketed chunk names, so % must be in the class.
  grep -ohE '/_next/static/[a-zA-Z0-9._/%-]+\.css' "$html" | sort -u | while read -r href; do
    curl -sf -m 60 "$base$href"
    echo
  done > "$OUT/$name.css"

  echo "  $name — $(wc -c < "$html" | tr -d ' ') bytes html, $(wc -c < "$OUT/$name.css" | tr -d ' ') bytes css"
}

# ── Normalised, order-independent signals ──
#
# Derived from every .css in $1. Factored into a function so self-test.sh can
# exercise the exact pipeline this script ships, on fixtures, with no dev server.
derive_signals() {
  local OUT="$1"

# Custom properties: the token surface. Any disappearance here is a lost token.
cat "$OUT"/*.css \
  | grep -ohE '\-\-[a-zA-Z0-9_-]+[[:space:]]*:[^;{}]*' \
  | sed 's/[[:space:]]\+/ /g; s/ *$//' | sort -u > "$OUT/tokens.txt"

# Class selectors: the utility surface. Disappearance means a utility stopped generating.
#
# CSS Module class names embed a hash of the source file's PATH, so they change
# whenever a file moves — which is most of what this refactor does. Normalise the
# hash away: the class names and their count are the signal, the hash is not.
#
# Anchored to selector position: a bare `\.[a-z0-9...]+` also matches CSS decimals
# (`.5em`) and font-file content hashes (`.4564287c`), which put 37 non-selectors
# into a 290-line signal and made a font rehash read as utility drift.
cat "$OUT"/*.css \
  | grep -ohE '(^|[},;[:space:]])\.[a-zA-Z_\\-][a-zA-Z0-9\\:_-]*' \
  | grep -ohE '\.[a-zA-Z_\\-][a-zA-Z0-9\\:_-]*' \
  | sed -E 's/(module)__[A-Za-z0-9_-]+__/\1__HASH__/g' \
  | sort -u > "$OUT/utilities.txt"

# Full rule surface: selector AND normalised declaration body, order-independent.
#
# This is the signal that matters. The two above carry only NAMES — the set of
# custom properties and the set of class names — so anything that changes what a
# rule DOES passes them silently. All of base.css lives here and nowhere else:
# `cursor: crosshair` could be deleted from the served CSS and both name-signals
# still reported "identical". Subsumes both; they are kept for readable diffs.
#
# Nested at-rules (@media, @supports, & inside @utility) land as one chunk rather
# than being flattened. Coarser than ideal, still strictly more than nothing.
cat "$OUT"/*.css \
  | tr '\n' ' ' \
  | sed -E 's/\}/}\n/g' \
  | sed -E 's/(module)__[A-Za-z0-9_-]+__/\1__HASH__/g' \
  | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//' \
  | grep -v '^$' \
  | sort -u > "$OUT/rules.txt"
}

# Sourcing for the signal pipeline only (self-test.sh) stops here — before any
# network call, so the self-test needs no dev server.
[[ -n "${CAPTURE_LIB_ONLY:-}" ]] && return 0

require_server "$DOCS" apps/docs "$PORT"
rm -rf "$OUT"; mkdir -p "$OUT"
for route in "${DOCS_ROUTES[@]}"; do capture "$DOCS" "" "$route"; done

derive_signals "$OUT"

echo "  tokens: $(wc -l < "$OUT/tokens.txt" | tr -d ' ')  utilities: $(wc -l < "$OUT/utilities.txt" | tr -d ' ')  rules: $(wc -l < "$OUT/rules.txt" | tr -d ' ')"

if [[ "$MODE" == "--compare" ]]; then
  echo
  status=0
  for f in tokens utilities rules; do
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
