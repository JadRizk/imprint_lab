#!/usr/bin/env bash
# Self-test for capture.sh's signal pipeline.
#
#   ./.refactor/self-test.sh
#
# Why this exists: fb04503 claimed capture.sh was "verified in both directions"
# on the strength of one simulated token loss. That is the single failure mode
# tokens.txt was built to catch. Declaration-body change was never simulated —
# and it turned out to be invisible to both name-signals, which is how
# `cursor: crosshair` could be deleted from the served CSS while --compare
# reported OK. A check that has only ever passed has not been tested.
#
# Each case mutates one fixture and asserts the signals CHANGE. No dev server:
# this sources capture.sh's derive_signals() and feeds it fixture CSS, so it
# tests the pipeline that ships rather than a copy of it.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CAPTURE_LIB_ONLY=1 source "$ROOT/.refactor/capture.sh"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

BASE_CSS=':root{--color-obsidian:#0F0F0F;--color-lime:#DFFF00}
body{background-color:var(--color-obsidian);cursor:crosshair;font-family:var(--font-mono)}
.text-micro{font-size:.625rem;line-height:1rem}
.bg-accent{background-color:var(--color-lime)}
@media (min-width:768px){.md\:flex{display:flex}}'

signals() {   # signals <dir> <css>
  rm -rf "$1"; mkdir -p "$1"
  printf '%s\n' "$2" > "$1/fixture.css"
  derive_signals "$1"
}

pass=0; fail=0
check() {   # check <name> <mutated-css> <signal-that-must-move>
  local name="$1" css="$2" want="$3"
  signals "$TMP/b" "$BASE_CSS"
  signals "$TMP/m" "$css"
  local moved=()
  for f in tokens utilities rules; do
    diff -q "$TMP/b/$f.txt" "$TMP/m/$f.txt" >/dev/null 2>&1 || moved+=("$f")
  done
  if [[ " ${moved[*]-} " == *" $want "* ]]; then
    printf '  ok    %-34s detected by: %s\n' "$name" "${moved[*]}"
    pass=$((pass + 1))
  else
    printf '  FAIL  %-34s expected %s to move, moved: [%s]\n' "$name" "$want" "${moved[*]-none}"
    fail=$((fail + 1))
  fi
}

echo "capture.sh self-test — every mutation class must move a signal"
echo

# 1. Token removed — the one case the original check covered.
check "token removed" \
  "${BASE_CSS/--color-lime:#DFFF00/}" tokens

# 2. Token value changed.
check "token value changed" \
  "${BASE_CSS/--color-obsidian:#0F0F0F/--color-obsidian:#4B0082}" tokens

# 3. Utility removed.
check "utility removed" \
  "${BASE_CSS/.bg-accent\{background-color:var(--color-lime)\}/}" utilities

# 4. Declaration body changed — invisible to both name-signals. THE regression.
check "declaration body changed" \
  "${BASE_CSS/cursor:crosshair/cursor:default}" rules

# 5. Declaration dropped from an existing rule, rule name intact.
check "declaration dropped from rule" \
  "${BASE_CSS/;font-family:var(--font-mono)/}" rules

# 6. Rule moved between selectors — the :root -> [data-system] transformation
#    Phase 05 performs and tokens.txt cannot see (it is sort -u, no selector).
check "rule moved between selectors" \
  "${BASE_CSS/:root\{/[data-system=\"x\"]\{}" rules

# 7. A utility swapped for another name already present elsewhere in the set.
check "utility body swapped" \
  "${BASE_CSS/.text-micro\{font-size:.625rem/.text-micro\{font-size:2rem}" rules

echo
# 8. Non-regressions: the normalisations must NOT fire.
signals "$TMP/b" "$BASE_CSS"
signals "$TMP/m" "${BASE_CSS//module__abc123__/module__def456__}"
hash_css='.a{color:red}.foo-module__aaaaaa__bar{color:blue}'
signals "$TMP/b" "$hash_css"
signals "$TMP/m" "${hash_css/aaaaaa/zzzzzz}"
if diff -q "$TMP/b/utilities.txt" "$TMP/m/utilities.txt" >/dev/null 2>&1; then
  printf '  ok    %-34s CSS-module hash normalised away\n' "module hash churn ignored"
  pass=$((pass + 1))
else
  printf '  FAIL  %-34s hash churn leaked into utilities.txt\n' "module hash churn ignored"
  fail=$((fail + 1))
fi

# 9. CSS decimals and font content-hashes must not be counted as selectors.
signals "$TMP/b" '.a{margin:.5em;padding:.125rem}@font-face{src:url(/f/.4564287c.woff2)}'
if grep -qE '^\.[0-9]' "$TMP/b/utilities.txt"; then
  printf '  FAIL  %-34s decimals/hashes counted as selectors:\n' "selector anchoring"
  grep -E '^\.[0-9]' "$TMP/b/utilities.txt" | sed 's/^/          /'
  fail=$((fail + 1))
else
  printf '  ok    %-34s decimals and font hashes excluded\n' "selector anchoring"
  pass=$((pass + 1))
fi

echo
echo "  $pass passed, $fail failed"
[[ $fail -eq 0 ]] || exit 1
