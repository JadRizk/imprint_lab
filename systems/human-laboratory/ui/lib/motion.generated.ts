// AUTO-GENERATED FROM theme.css — do not edit by hand.
// Run: bun run --filter=@thl/tokens generate:tokens
//
// The duration ladder in seconds, for JS animation. Pick the rung by what the
// motion MEANS — see the Motion block in theme.css. Feedback enters at `ack`
// and decays at `state`; `transit` is something entering or leaving the page;
// `process` is the machine doing something, and is the one rung where the
// duration is the content.

export const duration = {
  ack: 0,
  state: 0.12,
  transit: 0.32,
  process: 1.2
} as const;

export type DurationRung = keyof typeof duration;
