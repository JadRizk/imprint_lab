# Changelog — The Human Laboratory (`@thl`)

All notable changes to this system. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the system is
versioned with [semantic versioning](https://semver.org/spec/v2.0.0.html).

> ⚠ **This file is parsed.** The newest `## [x.y.z] — date` heading below **is**
> the system's version — nothing else declares it. `token-tools` reads it and
> emits it into `ui/lib/version.generated.ts`, the report-kit bundle headers, and
> the published registry. So the release procedure is: write the entry, then
> regenerate. A version cannot be bumped without saying what changed, which is
> the point.
>
> `## [Unreleased]` is ignored by the parser. Keep the heading shape exactly —
> square brackets, a semver triple, a dash, an ISO date. `check-version` fails
> the build if it drifts.

## What a version means here

The system version is the atomic unit: tokens, components, brand and report kit
ship together at one number, and a consumer adopts it deliberately. That is what
makes the following a real promise rather than a wish.

| Bump | Means |
|---|---|
| **Major** | A consumer's existing copy breaks. A role renamed or removed, a component's props changed, a report-kit class deleted, a contract in `CLAUDE.md` reversed. |
| **Minor** | Additive. A new role, component, report-kit primitive or token that existing code can ignore. |
| **Patch** | A value moves without renaming anything — a contrast fix, a corrected ratio, a generated artifact caught up to its source. |

**Primitives are private.** `--color-lime` moving is a patch, because nothing in
`ui/` is allowed to reference it. Roles are the public surface; that asymmetry is
the whole reason for the two tiers.

## [Unreleased]

### Changed

**`report-kit` installs `SKILL.md` to `~/.claude/skills/thl-report/SKILL.md`,
not `~/thl/SKILL.md`.** The instructions now land where an agent looks, so a
project that adopts the system receives the class vocabulary alongside the
stylesheets instead of seven stylesheets and a file nothing reads.

> **This is a `target` change, which makes the release carrying it a major.**
> `shadcn add` copies files and never removes them, so if you installed
> `report-kit` before this, re-adding it places the instructions at the new path
> and leaves your existing `thl/SKILL.md` behind. Nothing breaks and nothing
> errors — you simply have two copies, and only one of them will be updated
> again. **Delete the old `thl/SKILL.md` after upgrading.**
>
> If you have never installed `report-kit`, there is nothing to do.

Why it was wrong: `~/thl/` is not a skills directory, so nothing scanned it. The
cold-start test that validated the kit had been run by handing the agent the file
explicitly — proving the content was sufficient while never exercising the
delivery, which is the half that was broken.

**The contrast companions are aliases, not literals.** `--color-line--contrast`
and `--color-line-strong--contrast` now read `var(--color-text-tertiary)` and
`var(--color-text-secondary)` instead of repeating `#7C7C7C` and `#A3A3A3` by
hand. **The resolved values are identical** — the only visible difference in a
generated file is that the hex casing now matches every other value. They were
two copies free to drift from the greys they are supposed to equal, and a comment
was the only thing recording the relationship.

Both targets are primitives the `prefers-contrast` block does not reassign, which
is what the rule requires: a companion pointing at a promoted role would resolve
to the promoted value and collapse the ladder onto one grey. That safety depends
on text staying un-promoted, so if text is ever promoted these must stop pointing
at it.

### Fixed

**`BentoCard` no longer renders at the wrong line tier when scripts do not run.**
The `1.1.0` floor restored the card's opacity and stopped there, but the entrance
has two beats — the fade, and then the edge climbing `ambient → line`. The second
beat is driven by React state, so with no script the server-rendered class list
keeps `border-ambient`, and tailwind-merge has already dropped `border-line` from
it. Every card was bounded at 1.23:1 by the token the line ladder reserves for
subdivision *inside* a panel and forbids as the edge *of* one. The card was
visible and drawn at the wrong rank, permanently.

The floor now lands the card in its arrived state rather than its dormant one.
This is the same correction `ImageFrame`'s floor makes in the opposite direction:
there the accent edge marks a reveal in progress and is dropped, because a reveal
that never runs is not in progress; here the dormant edge marks an entrance not
yet finished, and an entrance that never runs is not pending. Either way the
no-script render has to state where the machine actually is.

Measured rather than assumed: printing the components page with the floor draws
the card edge at `#3A3A3A`, and without it at `#242424`.

> **No action needed if you take the file.** `bento-card.module.css` already
> shipped at `1.1.0`, so this is a change to bytes you have rather than a new
> file — unlike the fix that introduced it.


## [1.1.0] — 2026-08-19

Everything here is a fix, so this could defensibly have been a patch. It is a
minor because one file is **new on disk**: `bento-card.tsx` now imports a
stylesheet that did not ship at 1.0.0. A patch tells a reader the fix is in
files they already have — and following that instruction here gives them an
`import` pointing at nothing. `ImageFrame` is the control case: its module
already shipped, so the identical fix there really is patch-class. The upgrade
procedure changed, not just the bytes.

### Added

**`bento-card.module.css`** — a new file in the `bento-card` registry item, which
now ships two files instead of one. It carries the no-JS floor described below.

> **This one needs an action.** `shadcn add bento-card` will place the stylesheet
> next to the component, but a copy updated by hand — or a component file diffed
> across on its own — gets the `import` without the file it names, which is a
> build error rather than a silent one. Take both files or neither.

### Fixed

**`BentoCard` and `ImageFrame` no longer render permanently invisible when
scripts do not run.** Both stage their entrance in JavaScript, so Framer Motion
server-renders the `initial` state as an inline style — `opacity: 0` on a card,
`height: 0%` plus a hidden `<img>` on a frame — and with scripts off nothing ever
arrives to undo it. The content is not merely unanimated; it is gone, and it
stays gone. Found on this system's own components page, where thirteen cards had
been sitting behind an IntersectionObserver that never fired.

Printing failed the same way for a different reason: a print stylesheet renders
whatever the DOM currently says, and anything not yet scrolled into view still
says hidden. A reader printing a page got blank boxes.

Each component now carries a floor under `@media (scripting: none)` and
`@media print`. `ImageFrame` additionally drops its accent edge and emission in
that branch — those mark the *growing* edge of a reveal, so a reveal that never
runs would otherwise claim to be in progress for good, which is the accent spent
on a state the machine is not in.

Both rules are inert wherever scripts do run: the animated path is untouched, and
this is a floor rather than a branch. `prefers-reduced-motion` is a separate
question and was already handled — that preference asks for less movement from a
page that works, while this asks what the page is when the animation layer never
arrives at all.

## [1.0.0] — 2026-08-06

First release. The system has a settled role contract, an enforced token
pipeline, a published registry, a brand and a document tier — the things that
have to be stable before anyone can adopt a version rather than a commit.

Everything below already existed at this tag; it is written out because a first
entry is the only chance to state what the version is promising to keep. The
thirty commits that built it are not itemised — they fixed a system nobody had
installed yet, so there is nothing there for a consumer to act on.

### Added

**The token model.** `theme.css` is hand-authored and is the only source;
`token-tools` emits typed tokens, a plain `:root` stylesheet, a scoped
stylesheet, DTCG JSON, a Tailwind safelist, a tailwind-merge config, the motion
ladder as JS values, and the report-kit bundles. Nothing under `generated/` is
edited by hand.

**Eleven role tokens**, the shared contract across every system in
`imprint_lab`: `canvas` · `ambient` · `line` · `line-strong` · `ink` ·
`ink-muted` · `ink-subtle` · `accent` · `accent-ink` · `critical` · `warning`,
plus `--shadow-glow` and `--shadow-glow-strong`. Components reference roles only;
`check-roles` fails the build on a primitive.

**Eight components**, all roles-only: `Button` · `PageShell` · `SectionHeader` ·
`BentoGrid` · `BentoCard` · `ImageFrame` · `Mark` · `Wordmark`.

**The line ladder.** Four tiers — `ambient` (1.23:1, subdivision inside a panel),
`line` (1.69:1, the edge of a thing), `line-strong` (2.69:1, a boundary that
outranks its neighbours), `accent` (16.83:1, live state). There is deliberately
no elevation and no `surface` fill: a panel measured 1.03:1 against this canvas,
so line carries every boundary instead.

**The duration ladder.** Four rungs — `ack` (0ms), `state` (120ms), `transit`
(320ms), `process` (1200ms). Feedback enters at `ack` and decays at `state`;
symmetric timing reads as the interface animating at you. Emitted to JS as
`ui/lib/motion.generated.ts`, because Framer Motion cannot read a custom
property.

**A closed type scale**, `micro` through `6xl`, with letter-spacing declared per
size step rather than picked at a call site. `--text-*`, `--tracking-*` and
`--leading-*` are all reset, so Tailwind's own rungs do not exist here.

**The report kit** — a pure HTML/CSS tier for standalone documents, with no
React, no build step and no network request. Base bundle plus opt-in chart,
diagram and interaction layers, a worked example, a catalogue, and the agent
instructions in `static/SKILL.md`.

**The brand**: the mark, its monochrome and favicon variants, and the rules in
`brand/README.md`. The favicon is a separate drawing rather than an export — the
frame is 1.69:1 and stops rendering below ~24px.

**Accessibility floors, enforced by token rather than by review.** Any role used
for text clears 4.5:1 against the canvas. `prefers-contrast: more` promotes the
whole line ladder — `line` reaches 4.59:1, clearing WCAG 1.4.11's 3:1 for the
visual boundary of a control — and deliberately leaves text alone, because
promoting `ink-subtle` would merge it with `ink-muted` and cost the hierarchy
that carries the meaning. `prefers-reduced-motion` restricts *what* may
transition rather than flattening every duration, so colour feedback survives at
full length while anything positional lands instantly.

**Distribution** through a shadcn-compatible registry at
`https://jadrizk.github.io/imprint_lab/r/thl/{name}.json`, with `bun run smoke`
proving every item is installable: complete manifest, declared dependencies, and
files byte-identical to their source.

### Known gaps

Recorded rather than tidied away, so the next version can close them:

- **No input, card, badge, dialog or table.** The component set covers layout,
  identity and the two display surfaces, and nothing else.
- **Dark mode only.** Deferred, not forgotten — the role layer is what makes
  adding light mode small.
- **The report kit's instructions are not auto-discoverable in a consuming
  project.** The registry lands `SKILL.md` at `~/thl/SKILL.md`, which is not a
  skills directory, so an agent there has to be pointed at it by hand.

[Unreleased]: https://github.com/JadRizk/imprint_lab/compare/thl/v1.1.0...HEAD
[1.1.0]: https://github.com/JadRizk/imprint_lab/releases/tag/thl%2Fv1.1.0
[1.0.0]: https://github.com/JadRizk/imprint_lab/releases/tag/thl%2Fv1.0.0
