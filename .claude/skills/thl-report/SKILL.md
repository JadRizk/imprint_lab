---
name: thl-report
description: Build a standalone HTML document — report, audit, spec, handoff, dashboard — in The Human Laboratory design system. Use whenever producing an HTML artifact for a project that has adopted @thl, including Claude artifacts. Covers the stylesheets, the class vocabulary, the four diagram forms, chart rules, interactive tables, and the editorial voice that makes the output read as one system.
---

# The Human Laboratory report kit

**Read [`systems/human-laboratory/static/SKILL.md`](../../../systems/human-laboratory/static/SKILL.md)
now, before writing anything.** That file is the instructions; this one only
makes them discoverable.

It carries the wiring table, the class vocabulary, the four diagram forms, the
chart rules, the interactive-table behaviour and the editorial voice — none of
which are repeated here, deliberately.

## Why this file is a stub

The real skill lives in `systems/human-laboratory/static/` because it **ships to
consumers** as part of the `@thl/report-kit` registry item: a project adopting
the system receives the instructions alongside the stylesheets they describe. But
a skill is only auto-discoverable from a skills directory, so without this stub
nothing would load it, and the kit would be found only by someone who happened to
read `CLAUDE.md`.

**This stub routes; it never copies.** The only duplicated thing is the
`description`, because the loader reads it from this file. If you change the
description in the canonical `SKILL.md`, change it here too — that one line is
the entire drift surface, and it is the price of the kit being both shippable and
discoverable.

### On symlinks — corrected

An earlier version of this file claimed a symlink here "silently does not work".
**That claim was wrong and is withdrawn.** A file-level symlink was tried, probed
once, and reported unregistered — but the plain file that replaced it *also*
reported unregistered on three consecutive probes before appearing. The variable
was index-refresh latency, not symlink resolution, and the test could not
distinguish them.

Directory symlinks demonstrably work: `~/.claude/skills/find-skills` and
`~/.claude/skills/using-git-worktrees` are both symlinks into `~/.agents/skills/`
and both load normally.

So the zero-duplication option is open and is probably better than this stub:

```bash
rm -rf .claude/skills/thl-report
ln -s ../../systems/human-laboratory/static .claude/skills/thl-report
```

That makes the skill directory *be* `static/`, so `SKILL.md` has one copy and the
description cannot drift. Verify it registers in a **fresh session** before
trusting it — in-session probes are not a reliable signal, which is the whole
lesson above. The trade is that the skill directory then also contains the
bundles, which is cosmetically odd and functionally harmless.

The other fix is to move the canonical file here and point `registry.json` at
this path. That was not done because `static/SKILL.md` had uncommitted edits from
another session at the time.

## The three rules most often broken

Worth knowing even before opening the full file:

- **Never re-derive the palette inline.** Copying hex values into a `<style>`
  block is the exact drift the kit exists to prevent.
- **Never link a font, script or stylesheet from a CDN.** A standalone document
  is usually served under a strict CSP; inline or omit.
- **Everything must work without JavaScript.** Tables read, charts render,
  detail rows stay visible. The kit's value is surviving email, PDF export and
  stripped script.
