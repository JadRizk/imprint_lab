# Step 6 — Verification

Ordered by how often each catches something the one before it missed.

---

## 1 · The gates

```bash
bun run build          # regenerates token artifacts, then builds
bun run check-types
bun run lint           # Biome + check-roles + validate-palette
bun run check          # Biome across the repo
bun run test           # parser tests + .refactor/self-test.sh
bun run smoke          # proves the registry is installable
```

**Run these from clean at least once** — `rm -rf node_modules .next .turbo` then
`install && build`. A scaffold that fails its own gates teaches that the gates
are noise, which is a worse outcome than the failure.

**The generator must be stable.** Run `generate:tokens` twice; the second run
produces no diff. If it does, the committed artifacts and the generator disagree.

---

## 2 · The CSS diff — and what it cannot see

`.refactor/capture.sh` diffs served CSS against a committed baseline. It carries
**three** signals:

| Signal | Carries | Catches |
|---|---|---|
| `tokens.txt` | custom property **names** | a lost or added token |
| `utilities.txt` | class-selector **names** | a lost or added utility |
| `rules.txt` | selector **plus normalised declaration body** | what a rule actually *does* |

**Only `rules.txt` matters.** The first two carry names only, so anything that
changes a rule's behaviour passes them in silence — `cursor: crosshair` was
deleted from the served stylesheet and both reported "identical". The signature
interaction of the system vanished and the instrument said clean.

**Do not trust a "verified" claim citing only the first two.** And run:

```bash
./.refactor/self-test.sh    # asserts each mutation class is still caught
```

Two more things about this instrument:

- **Capture against a cold server.** Turbopack's HMR does not always recompile
  CSS before the next request lands, so a capture taken moments after an edit can
  report the *previous* build. The same comparison once read 3 dropped utilities
  warm and 7 cold. If a diff looks implausible, restart, delete `.next/dev`, and
  re-capture before believing it.
- **Re-baseline after each accepted change**, or diffs accumulate into unreadable
  noise that nobody reads — which is the same as having no check.

---

## 3 · Look at it

**CSS diffs are not a substitute for looking.** The strongest evidence for this
is `text-6xl`: absent from the built CSS for the entire refactor, rendering the
largest step of the type scale *smaller than the one below it*, on the page whose
only purpose was displaying the type scale. `utilities.txt` reported "identical"
across six phases.

Headless Chrome needs no extension:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --virtual-time-budget=9000 --screenshot=out.png \
  http://localhost:3001/systems/<slug>/components
```

Render **every** route. "Unverified visually — the extension was unresponsive"
appeared in three consecutive phase write-ups here, and everything found later by
looking was present the whole time.

Check specifically: does the system render in **its own** skin, or system 01's?
An unstyled page and a correctly-styled page both "render".

---

## 4 · The cold-start test

The one that matters for the report kit, and the only one that is a judgment
call by design.

> **Fresh context. Empty directory. Only `<ns>.css` and `SKILL.md`, no
> conversation history.** Ask for a report.
>
> If the output is not recognisably this system, **`SKILL.md` is wrong, not the
> agent.**

This was outstanding for two phases and passed when finally run properly — the
output carried the eyebrow square, the label casing, the status vocabulary, the
identifiers, zero radius, no invented CSS, no hardcoded hex and CSP-safe
inlining. It also surfaced a real gap no other check would have: `SKILL.md`
documented what happens when the fonts bundle is absent, but not what to do when
the chart layer is absent and the report needs a chart.

---

## 5 · Do not grade your own homework

Both self-authored documents in this repo turned out to be unreliable narrators
of their own scope. `REFACTOR.md` graded its own work; `REMEDIATION.md` declared
Phase 06 out of scope while Phase 06 was landing. The blind instrument in §2 was
found by an **independent** audit, not by either of them.

When a system lands, have something that did not build it check it — against the
artifacts, not against the write-up.

And record what is **not** known. A phase report that lists only what worked is
not trustworthy; mark what was assumed, what was unverified, and what would
falsify the claim. Both this repo and the report kit it ships were built that
way, and it is the reason the gaps were findable at all.
