# @imprint/system-template

```bash
bun run new-system <slug> <namespace> ["Display Name"]
bun run new-system atelier atl "Atelier"
```

Scaffolds a system already wired to the token pipeline, the role contract, the
report kit and the registry — so the cost of a second system is a set of design
decisions rather than a set-up.

**It deliberately does not invent an aesthetic.** The eleven roles are stubbed
and the placeholder accent is magenta, so the first thing you must do is make
real decisions. Every role used for text has to clear 4.5:1 against the canvas;
measure it and record the ratio beside the token, as system 01 does.

After scaffolding: `bun install`, edit `tokens/theme.css`, regenerate, then add
the system to `apps/docs`.

> The scaffold currently fails `lint` and `check` out of the box — see
> `REMEDIATION.md` R4. Fix that before relying on it.
