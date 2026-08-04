// AUTO-GENERATED FROM theme.css — do not edit by hand.
// Run: bun run --filter=@repo/tailwind-config generate:tokens

export type TokenCategory =
  | 'color'
  | 'font'
  | 'text'
  | 'tracking'
  | 'shadow'
  | 'animate'
  | 'spacing'
  | 'other';

export interface Token {
  name: string;
  value: string;
  category: TokenCategory;
  utility: string;
  subcategory?: 'core' | 'semantic';
}

export const tokens: Token[] = [
  {
    "name": "--spacing",
    "value": "0.25rem",
    "category": "spacing",
    "utility": ""
  },
  {
    "name": "--color-obsidian",
    "value": "#0F0F0F",
    "category": "color",
    "utility": "bg-obsidian · text-obsidian · border-obsidian",
    "subcategory": "core"
  },
  {
    "name": "--color-lime",
    "value": "#DFFF00",
    "category": "color",
    "utility": "bg-lime · text-lime · border-lime",
    "subcategory": "core"
  },
  {
    "name": "--color-steel",
    "value": "#333333",
    "category": "color",
    "utility": "bg-steel · text-steel · border-steel",
    "subcategory": "core"
  },
  {
    "name": "--color-white",
    "value": "#FFFFFF",
    "category": "color",
    "utility": "bg-white · text-white · border-white",
    "subcategory": "core"
  },
  {
    "name": "--color-black",
    "value": "#000000",
    "category": "color",
    "utility": "bg-black · text-black · border-black",
    "subcategory": "core"
  },
  {
    "name": "--color-surface",
    "value": "#0A0A0A",
    "category": "color",
    "utility": "bg-surface · text-surface · border-surface",
    "subcategory": "semantic"
  },
  {
    "name": "--color-text-secondary",
    "value": "#A3A3A3",
    "category": "color",
    "utility": "bg-text-secondary · text-text-secondary · border-text-secondary",
    "subcategory": "semantic"
  },
  {
    "name": "--color-text-tertiary",
    "value": "#7C7C7C",
    "category": "color",
    "utility": "bg-text-tertiary · text-text-tertiary · border-text-tertiary",
    "subcategory": "semantic"
  },
  {
    "name": "--color-ambient",
    "value": "#3A3A3A",
    "category": "color",
    "utility": "bg-ambient · border-ambient",
    "subcategory": "semantic"
  },
  {
    "name": "--font-sans",
    "value": "var(--font-sans-face, sans-serif)",
    "category": "font",
    "utility": "font-sans"
  },
  {
    "name": "--font-mono",
    "value": "var(--font-mono-face, monospace)",
    "category": "font",
    "utility": "font-mono"
  },
  {
    "name": "--text-micro",
    "value": "0.625rem / 1rem",
    "category": "text",
    "utility": "text-micro"
  },
  {
    "name": "--text-xs",
    "value": "0.75rem / 1rem",
    "category": "text",
    "utility": "text-xs"
  },
  {
    "name": "--text-sm",
    "value": "0.875rem / 1.25rem",
    "category": "text",
    "utility": "text-sm"
  },
  {
    "name": "--text-base",
    "value": "1rem / 1.5rem",
    "category": "text",
    "utility": "text-base"
  },
  {
    "name": "--text-lg",
    "value": "1.125rem / 1.75rem",
    "category": "text",
    "utility": "text-lg"
  },
  {
    "name": "--text-xl",
    "value": "1.25rem / 1.75rem",
    "category": "text",
    "utility": "text-xl"
  },
  {
    "name": "--text-2xl",
    "value": "1.5rem / 2rem",
    "category": "text",
    "utility": "text-2xl"
  },
  {
    "name": "--text-3xl",
    "value": "1.875rem / 2.25rem",
    "category": "text",
    "utility": "text-3xl"
  },
  {
    "name": "--text-4xl",
    "value": "2.25rem / 2.5rem",
    "category": "text",
    "utility": "text-4xl"
  },
  {
    "name": "--text-5xl",
    "value": "3rem / 1",
    "category": "text",
    "utility": "text-5xl"
  },
  {
    "name": "--text-6xl",
    "value": "3.75rem / 1",
    "category": "text",
    "utility": "text-6xl"
  },
  {
    "name": "--tracking-label",
    "value": "0.2em",
    "category": "tracking",
    "utility": "tracking-label"
  },
  {
    "name": "--shadow-lime-glow",
    "value": "0 0 15px rgba(223, 255, 0, 0.3)",
    "category": "shadow",
    "utility": "shadow-lime-glow"
  },
  {
    "name": "--shadow-lime-glow-lg",
    "value": "0 0 30px rgba(223, 255, 0, 0.4), 0 0 60px rgba(223, 255, 0, 0.1)",
    "category": "shadow",
    "utility": "shadow-lime-glow-lg"
  },
  {
    "name": "--animate-scan",
    "value": "scan 4s linear infinite",
    "category": "animate",
    "utility": "animate-scan"
  }
];

export const colorTokens = tokens.filter((t) => t.category === 'color');
export const coreColors = colorTokens.filter((t) => t.subcategory === 'core');
export const semanticColors = colorTokens.filter((t) => t.subcategory === 'semantic');
export const textTokens = tokens.filter((t) => t.category === 'text');
