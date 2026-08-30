export const ASSET_PROTECTION_INTELLIGENCE = {
  brand: 'ELIMFILTERS',
  platform: 'Asset Protection Intelligence',
  mantra: ['Safety', 'Reliability', 'Efficiency'] as const,
  positioning:
    'A global asset-protection platform combining engineered filtration, technical intelligence, governed knowledge and product data.',
  systems: {
    hermes: {
      name: 'HERMES',
      role: 'Intelligence engine',
      responsibility:
        'Continuously discovers, compares, validates and routes new external technical evidence into governed review workflows.',
      mayWriteCanonicalKnowledge: false,
      mayAuthorizeSku: false,
    },
    obsidian: {
      name: 'Obsidian Knowledge Vault',
      role: 'Structured second brain',
      responsibility:
        'Organizes reviewed institutional knowledge, relationships, operating context and long-lived technical memory.',
      mayWriteCanonicalKnowledge: true,
      mayAuthorizeSku: false,
    },
    knowledgeCenter: {
      name: 'Knowledge Center',
      role: 'Public knowledge surface',
      responsibility:
        'Publishes approved technical knowledge for customers, distributors, engineers and AI discovery surfaces.',
    },
    catalogue: {
      name: 'World Catalogue',
      role: 'Product authority',
      responsibility:
        'Authorizes ELIMFILTERS SKU, applications, dimensions, technologies, OEM references and product identity data.',
      mayAuthorizeSku: true,
    },
    partSearch: {
      name: 'Part Search',
      role: 'Product intelligence interface',
      responsibility:
        'Turns governed catalogue data into fast part, OEM, vehicle and equipment discovery without inventing product authority.',
    },
    bots: {
      name: 'Conversation Orchestrator',
      role: 'Customer interaction layer',
      responsibility:
        'Combines approved knowledge, validated catalogue evidence and conversation state into safe channel responses.',
    },
    web: {
      name: 'ELIMFILTERS Web Platform',
      role: 'Global brand and discovery layer',
      responsibility:
        'Presents the company, technologies, industries, knowledge and commercial network as one coherent platform.',
    },
  },
  authority: {
    sku: 'World Catalogue / PostgreSQL',
    technicalEvidence: 'Approved Knowledge / Obsidian-equivalent records',
    discovery: 'HERMES',
    customerResponse: 'Conversation Orchestrator',
  },
  flows: {
    knowledge:
      'Web sources -> HERMES discovery -> evidence review -> Obsidian/Knowledge authority -> Knowledge Center/Bots/Web',
    product:
      'Factory + product engineering -> World Catalogue -> Part Search/Bots/Product pages',
    diagnostic:
      'Customer symptom -> Orchestrator -> approved knowledge + catalogue authority -> governed response -> unresolved gap to HERMES',
  },
} as const;

export type AssetProtectionIntelligenceArchitecture = typeof ASSET_PROTECTION_INTELLIGENCE;
