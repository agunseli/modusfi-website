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
    summary:
      'Design and develop sophisticated software products and platforms. We connect product discovery and architecture with hands-on delivery, integrating new capabilities with existing systems and supporting the software as it moves into use.',
    description:
      'We design and develop sophisticated software products, from early-stage concepts to enterprise-grade platforms. Our expertise spans architecture, backend and frontend engineering, APIs, distributed systems and cloud-native applications. We connect product discovery and architecture with hands-on delivery, integrating new capabilities with existing systems and supporting the software as it moves into use.',
    capabilities: [
      'Product architecture',
      'SaaS platforms',
      'Full-stack development',
      'Systems integration',
    ],
  },
  ai: {
    slug: 'ai-intelligent-systems',
    title: 'AI & Intelligent Systems',
    icon: 'ai',
    summary:
      'We combine applied research with deep engineering expertise to push the boundaries of what intelligent systems can do. Our approach is AI-native at the core, and turns emerging technologies into reliable solutions that improve how organisations analyse information, make decisions and operate.',
    description:
      'We combine applied research with deep engineering expertise to push the boundaries of what intelligent systems can do. Our approach is AI-native at the core, and turns emerging technologies into reliable solutions that improve how organisations analyse information, make decisions and operate.',
    capabilities: ['Agentic Frameworks', 'Intelligent workflows', 'AI-Native'],
  },
  cloud: {
    slug: 'cloud-platform-modernisation',
    title: 'Cloud & Platform Modernisation',
    icon: 'cloud',
    summary:
      'Modernise applications and platforms to improve performance, resilience and scalability. We plan staged migrations around existing dependencies and operational needs, with deployment automation, monitoring and recovery arrangements built into the platform so teams can manage change with confidence.',
    description:
      'We help organisations modernise existing applications, improve system architecture and establish secure, scalable foundations for future growth. We plan staged migrations around existing dependencies and operational needs, with deployment automation, monitoring and recovery arrangements built into the platform so teams can manage change with confidence.',
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
      'Apply deep banking and payments experience to build secure, scalable financial solutions. Our focus is Open Banking, covering payment initiation, account information and the consent journeys and bank integrations that connect these capabilities to customer-facing products and business systems.',
    description:
      'We combine practical banking, payments and Open Banking experience with modern software engineering to build secure and reliable financial systems. Our focus is Open Banking, covering payment initiation, account information and the consent journeys and bank integrations that connect these capabilities to customer-facing products and business systems.',
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
