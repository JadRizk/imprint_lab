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
  heading: 'ARCHITECTING FULL-STACK',
  headingAccent: ' EQUILIBRIUM',
  description:
    'Investigating the intersection of robust backend infrastructure and fluid user interfaces. Field notes from a career in code.',
  image: {
    src: 'https://picsum.photos/1200/800',
    alt: 'Technical schematic of a full-stack architecture',
    badge: {
      label: 'IMG_SRC_LOADED'
    }
  }
};
