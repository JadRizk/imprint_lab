# Classifying a change

Semver was written for libraries, where the public surface is a set of function
signatures. A design system's surface is different, and the mapping is not
obvious — which is why this file exists rather than a sentence saying "follow
semver".

**The whole question is: what does a consumer's copy reference by name?**
Everything else is implementation, however visible it is on screen.

---

## The decision, in order

1. **Did a name a consumer writes disappear or change meaning?** → major.
2. **Did a name appear that existing code can ignore?** → minor.
3. **Did only a value move, with every name intact?** → patch.
4. **Did nothing under `generated/`, `ui/lib/*.generated.ts` or `static/<ns>.*`
   move?** → not a release at all.

Step 4 first, if you are unsure. It is the cheapest and it eliminates most
candidates.

---

## The public surface

Read the authoritative role list from
[`packages/token-tools/lib/emit.mjs`](../../../../packages/token-tools/lib/emit.mjs)
— `ROLE_COLOR_NAMES` and `ROLE_OTHER_NAMES`. **Never from prose, including this
file.** At the time of writing that is eleven colour roles plus `--shadow-glow`
and `--shadow-glow-strong`, but the file is what ships.

| Surface | Public? | Because |
|---|---|---|
| The role tokens | **Yes** | The contract every component is written against |
| Primitives (`--color-lime`, `--color-obsidian`) | **Partly — see below** | `ui/` may not touch them; a consumer's app code may |
| Component names, props, defaults | **Yes** | Call sites reference them |
| Registry item names and targets | **Yes** | Install paths; permanent once anything installs |
| Report-kit class vocabulary | **Yes** | Hand-written into standalone documents |
| Utilities from the closed scales (`text-*`, `tracking-*`, `duration-*`) | **Yes** | Written into class strings |
| `tokens.json` (DTCG) shape | **Yes** | Advertised as interchange — Figma, Style Dictionary |
| `base.css` scoping behaviour | **Yes** | Determines whether a consumer's page renders |
| Brand assets | Yes, weakly | Files, not identifiers |
| `generated/tokens.ts`, `tw-merge.generated.ts` internals | No | Regenerated; nobody writes against the shape |
| `packages/*`, `apps/docs`, every `.md` | No | Not shipped to anyone |

---

## Worked cases

### Roles

| Change | Class | Note |
|---|---|---|
| Rename `--color-line-strong` | **MAJOR** | Every `border-line-strong` in a consumer's copy silently stops generating |
| Remove a role | **MAJOR** | The `--color-surface` removal was pre-1.0; the same act now is a major |
| Add a twelfth role | **MINOR** | ⚠ **and it is a two-file change.** A colour token absent from `ROLE_COLOR_NAMES` is a *primitive*, so `check-roles` bans it inside `ui/`. `theme.css` alone ships a role no component may use — a broken minor |
| Repoint a role at a different primitive, fixing a measured contract breach | **PATCH** | The token now does what it always claimed |
| Repoint a role as a direction re-decision (a new accent hue) | **MAJOR** | See below |

> **The hard one: a value moved, so why is it ever major?**
>
> Ask whether the change **restores** a contract the old value violated, or
> **revises** the direction.
>
> Restoring is a patch. The severity inversion — warning at 8.11:1 shouting
> louder than critical — was a value that contradicted its own token's meaning.
> Fixing it makes `--color-warning` mean what a consumer already believed.
>
> Revising is a major. A new accent hue keeps every name and breaks every
> composition a consumer built *around* the old one, in their own app code, where
> primitives are permitted. Nothing errors. It is the most expensive kind of
> silent change, and hiding it in a patch is how a design system loses trust.

### Primitives

| Change | Class | Note |
|---|---|---|
| A primitive's **value** moves | **PATCH** | `ui/` cannot reference it, so nothing in the system's own code depends on it |
| A primitive is **renamed or removed** | **MAJOR** | `CLAUDE.md` permits app code to use primitives freely, so `bg-obsidian` may exist in a consumer's project. Delete the token and that class generates **nothing** — no error, no warning, the element simply loses its background |
| A primitive is added | **MINOR** | It also becomes a newly guarded name for `check-roles`, automatically |

The asymmetry is deliberate: primitives are *exposed but unguaranteed* in value,
and guaranteed in name. That is the honest description of what the two tiers
actually promise.

### Components

| Change | Class |
|---|---|
| Rename a component, or a prop | **MAJOR** |
| Remove a variant or size | **MAJOR** |
| Change a **default** variant, size or behaviour | **MAJOR** — every existing call site renders differently and none of them changed |
| Add a variant, size or optional prop | **MINOR** |
| Add a component | **MINOR** |
| Change internal markup with identical rendered output and API | **PATCH** |
| Bump a dependency the consumer must also upgrade (a framer-motion major) | **MAJOR** — their install breaks, wherever the fault technically lies |

### The registry

| Change | Class |
|---|---|
| Rename an item, or change a file's `target` | **MAJOR** — and effectively permanent. Anything already installed resolved the old path |
| Add a file to an existing item | **MINOR** — new installs get it; existing copies do not, so say so in the entry |
| Add an item | **MINOR** |
| Add a `dependencies` entry the item genuinely needed all along | **PATCH** — the manifest was wrong; it is now right |

### The report kit

| Change | Class |
|---|---|
| Rename or remove a class | **MAJOR** — documents are hand-written against this vocabulary and never re-run |
| Add a class or an opt-in layer | **MINOR** |
| Restyle a class without changing its box behaviour | **PATCH** |
| Restyle a class so it changes layout (inline → block, new padding that reflows) | **MAJOR** — a standalone document's whole value is that it still renders years later |

### The scales

| Change | Class |
|---|---|
| Close a namespace, or delete a rung | **MAJOR** — `tracking-tighter` and friends generate nothing afterwards. Silent, and the reason `--text-6xl` was missing from a served build for an entire refactor |
| Add a step or rung | **MINOR** |
| Change a step's value or its tracking companion | **PATCH** |

### Brand

| Change | Class |
|---|---|
| Redraw the mark or favicon | **MINOR** — files change, no identifier moves. Call it out anyway; it is the most visible change a system can make without breaking anything |
| Change the namespace (`@thl` → anything) | **MAJOR** — it is the registry, the bundle filenames and every install path at once |

---

## Below 1.0

A scaffolded system starts at `0.1.0` and everything above is advisory until it
reaches 1.0: under semver, `0.x` may break in a minor, and a system whose palette
is still being decided *should*.

**What forces 1.0 is adoption, not completeness.** The moment a project outside
this repo installs the system, breaking it costs someone else time, and the
classification becomes a promise rather than a description. `@thl` reached 1.0
with a known component gap and no light mode — because the *contracts* were
settled, which is the only thing a version can protect.

---

## When two classifications are both defensible

Take the higher one, and say why in the entry.

A major that turns out to have been a minor costs a reader ten minutes of
diffing. A minor that turns out to have been a major costs them a broken build
they did not consent to — and the trust that the numbers mean anything, which is
the only thing making the version worth publishing.
