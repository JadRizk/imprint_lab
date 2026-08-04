// AUTO-GENERATED FROM theme.css — do not edit by hand.
// Run: bun run --filter=@thl/tokens generate:tokens
//
// Feeds extendTailwindMerge. Without it, tailwind-merge cannot distinguish a
// custom font size from a color — text-micro and text-ink-subtle collide in one
// conflict group and the color is silently dropped.

export const twMergeConfig = {
  "extend": {
    "theme": {
      "text": [
        "micro",
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl"
      ],
      "tracking": [
        "label"
      ]
    }
  }
};
