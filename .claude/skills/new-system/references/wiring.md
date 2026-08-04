# Step 3 — Wiring a system into `apps/docs`

Four edits. **Three of them fail silently**, which is why this file exists.

The docs app works by a specific asymmetry, and understanding it makes every
failure below obvious rather than mysterious:

> **One system's `@theme` supplies the utility *surface*.** Tailwind generates
> `bg-accent`, `text-ink` and friends **once**, from the names in the single
> `@theme` that `globals.css` imports. Every other system contributes only a
> `[data-system]` block that overrides the **values** behind those names.
> Because roles carry the same names in every system, one utility set serves all
> of them and the data attribute does the switching.

---

## The edits

### 1 · `@import "@<ns>/tokens/theme.scoped.css"`

In `apps/docs/app/globals.css`, alongside the other `@import`s — CSS requires
imports to precede every other rule.

**Fails loudly-ish:** the system's page renders in system 01's colours. Visible
if you look, invisible if you only run the build.

### 2 · `@source "../../../systems/<slug>/ui"`

**The one that is easiest to miss and hardest to diagnose.** Tailwind scans these
paths for class names. A system absent here compiles clean, renders, and is
**completely unstyled — with nothing reported anywhere.**

The scaffold's printed step 5 names both this and the `@import` for exactly this
reason. Do not treat it as optional.

### 3 · `@import "@<ns>/tokens/safelist.css"`

The showcase renders tokens through a variable — `` className={`${token.utility}`} ``
— and **Tailwind only scans for literal class names**. A class built at runtime
generates nothing.

This is not hypothetical: `text-6xl` was missing from the served CSS for the
entire refactor, and the type-scale table rendered its largest step at inherited
size. The safelist is generated from `theme.css` so it cannot drift — **never
hand-keep one.**

> ⚠ **Unverified for a second system.** The safelist forces utilities the token
> model declares, but utilities are only *defined* by the one `@theme` imported
> at the top of `globals.css`. If system 02 declares a scale value system 01 does
> not have, it is an open question whether `@source inline()` alone generates it.
> **Check this explicitly** when wiring system 02: declare a scale step unique to
> it, and grep the built CSS for the utility. Do not assume either answer.

### 4 · An entry in `apps/docs/lib/systems.ts`

Plus a page under `app/systems/<slug>/`. The `slug` is what lands in
`data-system`, so it **must match the selector the scoped stylesheet was
generated with** — they come from the same argument, so this only breaks if
someone edits one by hand.

---

## The asymmetry to expect

**Primitives exist only for the system whose `@theme` is imported.**
`bg-obsidian` is reachable on every page; system 02's `bg-<its-primitive>` is
reachable on none.

This is intentional, not a bug: docs chrome uses roles, and a system's private
vocabulary is not meant to be reachable from another system's page. It does mean
**a second system's example page must be built on roles**, where system 01's was
allowed to use primitives.

---

## The document-level boundary

`base.css` rules must bind to either `:root` or a `[data-system]` scope, **and
they must bind to roles rather than primitives** — a primitive is private to one
system and resolves to nothing under another. Both halves are required; the
second is the larger one and was missed the first time.

Three things have no container to move to and stay global:

- `color-scheme`
- the universal `*` reset
- the page scrollbar

**Two systems with different colour schemes cannot share a document.** The second
one needs its own page. That is a constraint to design around, not a bug to fix.

---

## Verifying the wiring

Not "the page renders" — unstyled pages render fine. Check that a **role
resolves differently per scope**:

```bash
bun run dev   # :3001
```

Then in the served CSS, confirm neither system's scoped block writes to `:root`,
that the scopes are distinct, and that the same role name resolves to different
values under each. That check is what caught two bugs invisible with one system:
`token-tools` assuming every system ships a `parts/chart.css`, and the generated
banners hardcoding `@thl/tokens` as the regenerate command.
