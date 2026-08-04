// AUTO-GENERATED FROM theme.css — do not edit by hand.
// Run: bun run --filter=@thl/tokens generate:tokens

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
  /** As authored — role tokens keep their var() so the alias stays visible. */
  value: string;
  /** var() chains flattened, for anything that cannot resolve them itself. */
  resolved: string;
  /** Resolved, without the paired line height folded in. */
  base: string;
  /** Companion line height, for font sizes that declare one. */
  lineHeight?: string;
  category: TokenCategory;
  utility: string;
  /** Set when this token is a pure alias of another token in this file. */
  aliasOf?: string;
  /** Trailing annotation from theme.css, e.g. a measured contrast ratio. */
  note?: string;
  subcategory?: 'core' | 'semantic' | 'role';
}

export const tokens: Token[] = [
  {
    "name": "--spacing",
    "value": "0.25rem",
    "resolved": "0.25rem",
    "base": "0.25rem",
    "category": "spacing",
    "utility": ""
  },
  {
    "name": "--color-obsidian",
    "value": "#0F0F0F",
    "resolved": "#0F0F0F",
    "base": "#0F0F0F",
    "category": "color",
    "utility": "bg-obsidian · text-obsidian · border-obsidian",
    "subcategory": "core"
  },
  {
    "name": "--color-lime",
    "value": "#DFFF00",
    "resolved": "#DFFF00",
    "base": "#DFFF00",
    "category": "color",
    "utility": "bg-lime · text-lime · border-lime",
    "subcategory": "core"
  },
  {
    "name": "--color-steel",
    "value": "#333333",
    "resolved": "#333333",
    "base": "#333333",
    "category": "color",
    "utility": "bg-steel · text-steel · border-steel",
    "subcategory": "core"
  },
  {
    "name": "--color-white",
    "value": "#FFFFFF",
    "resolved": "#FFFFFF",
    "base": "#FFFFFF",
    "category": "color",
    "utility": "bg-white · text-white · border-white",
    "subcategory": "core"
  },
  {
    "name": "--color-black",
    "value": "#000000",
    "resolved": "#000000",
    "base": "#000000",
    "category": "color",
    "utility": "bg-black · text-black · border-black",
    "subcategory": "core"
  },
  {
    "name": "--color-surface",
    "value": "#0A0A0A",
    "resolved": "#0A0A0A",
    "base": "#0A0A0A",
    "category": "color",
    "utility": "bg-surface · text-surface · border-surface",
    "subcategory": "role"
  },
  {
    "name": "--color-text-secondary",
    "value": "#A3A3A3",
    "resolved": "#A3A3A3",
    "base": "#A3A3A3",
    "category": "color",
    "utility": "bg-text-secondary · text-text-secondary · border-text-secondary",
    "note": "7.62:1 — body copy (the body default)",
    "subcategory": "semantic"
  },
  {
    "name": "--color-text-tertiary",
    "value": "#7C7C7C",
    "resolved": "#7C7C7C",
    "base": "#7C7C7C",
    "category": "color",
    "utility": "bg-text-tertiary · text-text-tertiary · border-text-tertiary",
    "note": "4.59:1 — labels, metadata, tags",
    "subcategory": "semantic"
  },
  {
    "name": "--color-ambient",
    "value": "#3A3A3A",
    "resolved": "#3A3A3A",
    "base": "#3A3A3A",
    "category": "color",
    "utility": "bg-ambient · border-ambient",
    "subcategory": "role"
  },
  {
    "name": "--color-canvas",
    "value": "var(--color-obsidian)",
    "resolved": "#0F0F0F",
    "base": "#0F0F0F",
    "category": "color",
    "utility": "bg-canvas · text-canvas · border-canvas",
    "aliasOf": "--color-obsidian",
    "subcategory": "role"
  },
  {
    "name": "--color-line",
    "value": "var(--color-steel)",
    "resolved": "#333333",
    "base": "#333333",
    "category": "color",
    "utility": "bg-line · text-line · border-line",
    "aliasOf": "--color-steel",
    "subcategory": "role"
  },
  {
    "name": "--color-ink",
    "value": "var(--color-white)",
    "resolved": "#FFFFFF",
    "base": "#FFFFFF",
    "category": "color",
    "utility": "bg-ink · text-ink · border-ink",
    "aliasOf": "--color-white",
    "subcategory": "role"
  },
  {
    "name": "--color-ink-muted",
    "value": "var(--color-text-secondary)",
    "resolved": "#A3A3A3",
    "base": "#A3A3A3",
    "category": "color",
    "utility": "bg-ink-muted · text-ink-muted · border-ink-muted",
    "aliasOf": "--color-text-secondary",
    "subcategory": "role"
  },
  {
    "name": "--color-ink-subtle",
    "value": "var(--color-text-tertiary)",
    "resolved": "#7C7C7C",
    "base": "#7C7C7C",
    "category": "color",
    "utility": "bg-ink-subtle · text-ink-subtle · border-ink-subtle",
    "aliasOf": "--color-text-tertiary",
    "subcategory": "role"
  },
  {
    "name": "--color-accent",
    "value": "var(--color-lime)",
    "resolved": "#DFFF00",
    "base": "#DFFF00",
    "category": "color",
    "utility": "bg-accent · text-accent · border-accent",
    "aliasOf": "--color-lime",
    "subcategory": "role"
  },
  {
    "name": "--color-accent-ink",
    "value": "var(--color-black)",
    "resolved": "#000000",
    "base": "#000000",
    "category": "color",
    "utility": "bg-accent-ink · text-accent-ink · border-accent-ink",
    "aliasOf": "--color-black",
    "subcategory": "role"
  },
  {
    "name": "--color-critical",
    "value": "#FF4A4A",
    "resolved": "#FF4A4A",
    "base": "#FF4A4A",
    "category": "color",
    "utility": "bg-critical · text-critical · border-critical",
    "note": "5.78:1 — errors, destructive actions",
    "subcategory": "role"
  },
  {
    "name": "--color-warning",
    "value": "#FF8A00",
    "resolved": "#FF8A00",
    "base": "#FF8A00",
    "category": "color",
    "utility": "bg-warning · text-warning · border-warning",
    "note": "8.11:1 — warnings, degraded states",
    "subcategory": "role"
  },
  {
    "name": "--font-sans",
    "value": "var(--font-sans-face, sans-serif)",
    "resolved": "var(--font-sans-face, sans-serif)",
    "base": "var(--font-sans-face, sans-serif)",
    "category": "font",
    "utility": "font-sans"
  },
  {
    "name": "--font-mono",
    "value": "var(--font-mono-face, monospace)",
    "resolved": "var(--font-mono-face, monospace)",
    "base": "var(--font-mono-face, monospace)",
    "category": "font",
    "utility": "font-mono"
  },
  {
    "name": "--text-micro",
    "value": "0.625rem / 1rem",
    "resolved": "0.625rem / 1rem",
    "base": "0.625rem",
    "category": "text",
    "utility": "text-micro",
    "lineHeight": "1rem"
  },
  {
    "name": "--text-xs",
    "value": "0.75rem / 1rem",
    "resolved": "0.75rem / 1rem",
    "base": "0.75rem",
    "category": "text",
    "utility": "text-xs",
    "lineHeight": "1rem"
  },
  {
    "name": "--text-sm",
    "value": "0.875rem / 1.25rem",
    "resolved": "0.875rem / 1.25rem",
    "base": "0.875rem",
    "category": "text",
    "utility": "text-sm",
    "lineHeight": "1.25rem"
  },
  {
    "name": "--text-base",
    "value": "1rem / 1.5rem",
    "resolved": "1rem / 1.5rem",
    "base": "1rem",
    "category": "text",
    "utility": "text-base",
    "lineHeight": "1.5rem"
  },
  {
    "name": "--text-lg",
    "value": "1.125rem / 1.75rem",
    "resolved": "1.125rem / 1.75rem",
    "base": "1.125rem",
    "category": "text",
    "utility": "text-lg",
    "lineHeight": "1.75rem"
  },
  {
    "name": "--text-xl",
    "value": "1.25rem / 1.75rem",
    "resolved": "1.25rem / 1.75rem",
    "base": "1.25rem",
    "category": "text",
    "utility": "text-xl",
    "lineHeight": "1.75rem"
  },
  {
    "name": "--text-2xl",
    "value": "1.5rem / 2rem",
    "resolved": "1.5rem / 2rem",
    "base": "1.5rem",
    "category": "text",
    "utility": "text-2xl",
    "lineHeight": "2rem"
  },
  {
    "name": "--text-3xl",
    "value": "1.875rem / 2.25rem",
    "resolved": "1.875rem / 2.25rem",
    "base": "1.875rem",
    "category": "text",
    "utility": "text-3xl",
    "lineHeight": "2.25rem"
  },
  {
    "name": "--text-4xl",
    "value": "2.25rem / 2.5rem",
    "resolved": "2.25rem / 2.5rem",
    "base": "2.25rem",
    "category": "text",
    "utility": "text-4xl",
    "lineHeight": "2.5rem"
  },
  {
    "name": "--text-5xl",
    "value": "3rem / 1",
    "resolved": "3rem / 1",
    "base": "3rem",
    "category": "text",
    "utility": "text-5xl",
    "lineHeight": "1"
  },
  {
    "name": "--text-6xl",
    "value": "3.75rem / 1",
    "resolved": "3.75rem / 1",
    "base": "3.75rem",
    "category": "text",
    "utility": "text-6xl",
    "lineHeight": "1"
  },
  {
    "name": "--tracking-label",
    "value": "0.2em",
    "resolved": "0.2em",
    "base": "0.2em",
    "category": "tracking",
    "utility": "tracking-label"
  },
  {
    "name": "--shadow-lime-glow",
    "value": "0 0 15px rgba(223, 255, 0, 0.3)",
    "resolved": "0 0 15px rgba(223, 255, 0, 0.3)",
    "base": "0 0 15px rgba(223, 255, 0, 0.3)",
    "category": "shadow",
    "utility": "shadow-lime-glow"
  },
  {
    "name": "--shadow-lime-glow-lg",
    "value": "0 0 30px rgba(223, 255, 0, 0.4), 0 0 60px rgba(223, 255, 0, 0.1)",
    "resolved": "0 0 30px rgba(223, 255, 0, 0.4), 0 0 60px rgba(223, 255, 0, 0.1)",
    "base": "0 0 30px rgba(223, 255, 0, 0.4), 0 0 60px rgba(223, 255, 0, 0.1)",
    "category": "shadow",
    "utility": "shadow-lime-glow-lg"
  },
  {
    "name": "--shadow-glow",
    "value": "var(--shadow-lime-glow)",
    "resolved": "0 0 15px rgba(223, 255, 0, 0.3)",
    "base": "0 0 15px rgba(223, 255, 0, 0.3)",
    "category": "shadow",
    "utility": "shadow-glow",
    "aliasOf": "--shadow-lime-glow"
  },
  {
    "name": "--animate-scan",
    "value": "scan 4s linear infinite",
    "resolved": "scan 4s linear infinite",
    "base": "scan 4s linear infinite",
    "category": "animate",
    "utility": "animate-scan"
  }
];

export const colorTokens = tokens.filter((t) => t.category === 'color');
export const coreColors = colorTokens.filter((t) => t.subcategory === 'core');
export const semanticColors = colorTokens.filter((t) => t.subcategory === 'semantic');
export const roleColors = colorTokens.filter((t) => t.subcategory === 'role');
export const textTokens = tokens.filter((t) => t.category === 'text');
