interface HeroContent {
  badge: string;
  heading: string;
  headingAccent: string;
  description: string;
  image: {
    src: string;
    alt: string;
    badge: {
      label: string;
    };
  };
}

export const heroContent: HeroContent = {
  badge: 'RESEARCH_OBJECTIVE',
  heading: 'A PAGE BUILT IN THIS',
  headingAccent: ' SYSTEM',
  description:
    'An end-to-end composition rather than a component gallery — the same primitives assembled the way a real page assembles them.',
  image: {
    // Seeded so the placeholder is deterministic across loads and machines.
    // Swap for real artwork; update `alt` to describe it when you do.
    src: 'https://picsum.photos/seed/thl-hero/1200/800',
    alt: 'Placeholder photograph standing in for the hero image',
    badge: {
      label: 'IMG_SRC_LOADED'
    }
  }
};
