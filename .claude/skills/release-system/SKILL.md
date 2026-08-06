---
name: release-system
description: Release a version of a design system in imprint_lab — classify the change, write the changelog entry, regenerate, tag and publish. Use when cutting a release, deciding whether a change is major, minor or patch, writing a CHANGELOG entry, bumping a version, tagging thl/vX.Y.Z, or working out whether a consuming project is behind and what upgrading it costs. Covers the classification judgement that lives in no file and the refusals that stop a bad release.
---

# Releasing a system

`new-system` stands a system up and leaves it at `0.1.0`. This is what happens
every time after that.

> **Why the version lives in the changelog, why the registry can only advertise
> it, and what each derived artifact is for: `CLAUDE.md` contract 2.** That is
> the contract and it is loaded every session — it is not repeated here. This
> skill owns the two things that live nowhere else: **the classification
> judgement**, and **the procedure with its refusals.**

**The mechanics are four commands. The judgement is the whole job.** Getting a
release wrong does not fail a build — it publishes a number that lies to
everyone who reads it.

---

## Preflight

**1. Read the version from the tool, not from memory or prose.**

```bash
node packages/token-tools/check-version.mjs        # every system, current state
node packages/token-tools/release-notes.mjs thl/v1.0.0   # what a tag would publish
```

`packages/token-tools/lib/version.mjs` is the authoritative parser. If this skill
and that file disagree, the file is right.

**2. Confirm there is something to release.** Regenerating artifacts with no
source change is not a release. See *What is not a release* below — it is a
longer list than it looks.

**3. Know which surface you touched.** Everything downstream depends on it, and
it is the step people skip. Read
[`references/classification.md`](references/classification.md) before choosing a
number.

---

## Steps

### 1 · Classify

Major, minor or patch — decided against the system's **public surface**, which is
narrower than its file list. The one-line rule:

> **Public is what a consumer's copy references by name.** The eleven roles, the
> two shadow roles, component names and props, registry item names, report-kit
> classes, and every utility the closed scales generate. Primitives are private,
> because `check-roles` forbids `ui/` from referencing them.

| | |
|---|---|
| **Major** | A consumer's existing copy breaks — something they reference by name is renamed, removed, or behaves differently |
| **Minor** | Additive; existing code can ignore it |
| **Patch** | A value moves and every name holds |

The cases that are genuinely hard — a contrast fix versus an accent re-decision,
adding a role, closing a namespace, a registry item rename — are worked through
in [`references/classification.md`](references/classification.md). **Do not
improvise those.**

> **Gate:** you can name the specific thing a consumer references that would
> break. If you cannot, it is not a major.

### 2 · Write the entry

Move what is under `## [Unreleased]` into a new heading and leave `[Unreleased]`
empty behind it:

```
## [1.1.0] — 2026-09-02
```

Square brackets, a semver triple, a dash, an ISO date. `check-version` fails on
any other shape.

**Write for the consumer, not the diff.** The reader is someone deciding whether
to upgrade. They need to know what breaks and what it buys them — not which files
changed, which git already records. If an entry cannot be written without listing
files, the release is probably several releases.

> **Gate:** every entry says what a reader must *do*, or explicitly that they
> need do nothing.

### 3 · Regenerate

```bash
bun run --filter=@<ns>/tokens generate:tokens
```

The version reaches `ui/lib/version.generated.ts` and every report-kit bundle
header from here. Skipping this is the failure the next step exists to catch.

> **Gate:** `git status` shows the version file and the `static/<ns>.*.css`
> bundles modified. If it shows nothing, the changelog edit did not land or the
> build cache swallowed it — see *Refusals*.

### 4 · Run the gates

```bash
bun run lint && bun run check-types && bun run test && bun run smoke
```

`check-version` runs under `lint` and is the one that matters here.

> **Gate:** `check-version` prints the version you just wrote. If it prints the
> previous one, step 3 did not happen.

### 5 · Commit, then tag

The tag must land on a commit that **already contains the entry** — the release
workflow reads the changelog at the tagged commit, so tagging first publishes
notes for a version that commit does not carry.

```bash
git tag <ns>/v1.1.0 && git push origin <ns>/v1.1.0
```

Scoped, never a bare `v1.1.0`. Systems evolve on their own timelines; a flat tag
claims to version all of them at once.

> **Gate:** `release-notes.mjs <ns>/v1.1.0` prints the entry you wrote, before
> you push.

---

## Refusals — what stops a release, and what it means

Each of these is a tool declining to proceed. None is a nuisance; each marks a
state where continuing publishes something false.

| Refusal | What actually happened |
|---|---|
| `check-version: … does not carry v1.1.0` | Step 3 was skipped. The artifacts still claim the old version and would ship that way. |
| `release-notes: tag … disagrees with the changelog` | The tag is on the wrong commit, or the entry was never written. **A tag is the only artifact here nobody generates** — someone types it — so it is the only thing that can name a version the repository does not contain. |
| `version: no release heading in …` | The heading shape drifted. Brackets, semver triple, dash, ISO date. |
| `check-version: … has a \`version\` field` | A second declaration came back. Delete it; the packages are private and nothing reads it. |
| `check-version: … out of order` | An entry was inserted in the wrong place. Newest first. |

**One refusal has no error message.** If step 3 produces no diff, suspect
turbo's cache before suspecting your edit: `../CHANGELOG.md` must be in the token
build's `inputs`, or a version bump changes no file turbo hashes and the task
reports `FULL TURBO` while doing nothing. Verified in both directions — see
[`../new-system/references/failure-catalogue.md`](../new-system/references/failure-catalogue.md).

---

## What is not a release

There is deliberately **no repo-level changelog**, so the question is always
"which system does this change?" — and often the answer is none.

| Change | Release? |
|---|---|
| `CLAUDE.md`, `README.md`, `REFACTOR.md`, any prose | No |
| `apps/docs` — the docs site, its routes, its styling | No. The site tracks `main`; it is not a system |
| `packages/token-tools` where emitted bytes are unchanged | No |
| `packages/token-tools` where emitted bytes **change** | **Yes — a patch of every system that regenerates.** This is the one people miss: the tool is not consumer-facing, but its output is |
| A new adversarial fixture, a test, a gate | No |
| `.github/workflows` | No |

When in doubt: regenerate, and look at whether anything under `generated/`,
`ui/lib/*.generated.ts` or `static/<ns>.*` actually moved. Those bytes are the
consumer's copy. If they did not move, nothing shipped.

---

## The consumer side

The version exists so a consuming project can answer a question the registry
cannot answer for it. Both halves matter, and only one of them has tooling.

**What a consumer can find out.** `shadcn add` copies files and records nothing,
so the answer is on their disk, not in the registry:

| Question | Where |
|---|---|
| What did I install? | `~/thl/lib/version.generated.ts` — `version`, `released`, `namespace` |
| …with no JavaScript? | The header comment of `~/thl/thl.css` and every report-kit bundle |
| What is current? | `version` at the top of `<site>/r/thl/registry.json` |
| What changed between them? | The changelog, and the GitHub Release published from it |

**What upgrading actually costs.** There is no upgrade command. `shadcn add`
re-copies files and **overwrites local edits**, which is not a bug — divergence
is the point of a copy-in registry. So an upgrade is: read the entries between
the two versions, re-add the items you use, diff, and re-apply your own changes
deliberately.

That makes the changelog the upgrade instructions. Write it that way.

> ⚠ **This side is undelivered, and knowingly so.** The registry lands
> `SKILL.md` at `~/thl/SKILL.md`, which is not a skills directory, so an agent
> working in a consuming project will not discover any of this unless it is
> handed to them. `CLAUDE.md` records the same gap for the report kit. Until that
> is fixed, **a release that changes the public surface should say so in the
> entry loudly enough to survive being read by a human with no tooling.**

---

## Scope

**In:** deciding the number, writing the entry, regenerating, tagging,
publishing, and what a consumer does with the result.

**Out:** standing up a new system (`new-system`), deciding a system's direction
(`design-direction`), and writing HTML documents (`thl-report`).

**Out, deliberately:** changesets, conventional-commit changelog generation, and
any automated bump. The classification above is a judgement about a design
system's public surface; no commit-message convention encodes it, and a tool
that guesses it would be confidently wrong at the exact moment being wrong is
expensive.
