export interface Service {
  slug: string;
  title: string;
  icon: 'code' | 'ai' | 'cloud' | 'bank';
  summary: string;
  description: string;
  capabilities: string[];
}

export const services = {
  software: {
    slug: 'software-product-engineering',
    title: 'Software & Product Engineering',
    icon: 'code',
    summary: 'Design and develop sophisticated software products and platforms.',
    description:
      'We design and develop sophisticated software products, from early-stage concepts to enterprise-grade platforms. Our expertise spans architecture, backend and frontend engineering, APIs, distributed systems and cloud-native applications.',
    capabilities: [
      'Product architecture',
      'SaaS platforms',
      'Full-stack development',
      'Systems integration',
    ],
  },
  ai: {
    slug: 'ai-intelligent-automation',
    title: 'AI & Intelligent Systems',
    icon: 'ai',
    summary:
      'Turn emerging AI capabilities into reliable systems that help organisations analyse information, make decisions and operate.',
    description:
      'We combine applied research with software engineering to turn emerging AI capabilities into reliable solutions. Our approach considers AI from the outset—alongside data, business rules, system integration and human oversight—to improve how organisations analyse information, make decisions and operate.',
    capabilities: [
      'Agent frameworks',
      'Intelligent workflows',
      'Knowledge integration',
      'AI-native engineering',
    ],
  },
  cloud: {
    slug: 'cloud-platform-modernisation',
    title: 'Cloud & Platform Modernisation',
    icon: 'cloud',
    summary:
      'Modernise applications and platforms to improve performance, resilience and scalability.',
    description:
      'We help organisations modernise existing applications, improve system architecture and establish secure, scalable foundations for future growth.',
    capabilities: [
      'Cloud architecture',
      'Legacy modernisation',
      'DevSecOps',
      'Operational resilience',
    ],
  },
  financial: {
    slug: 'financial-technology-engineering',
    title: 'Financial Technology Engineering',
    icon: 'bank',
    summary:
      'Apply deep banking and payments experience to build secure, scalable financial solutions.',
    description:
      'We combine practical banking, payments and Open Banking experience with modern software engineering to build secure and reliable financial systems.',
    capabilities: ['Open Banking', 'Payments', 'Digital banking', 'Financial integrations'],
  },
} satisfies Record<string, Service>;

// Lead with financial technology; keep the remaining services in their relative order.
export const homeServices = [services.financial, services.software, services.ai, services.cloud];
export const overviewServices = [
  services.financial,
  services.software,
  services.ai,
  services.cloud,
];
