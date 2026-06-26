// Business Playbook Library (Knowledge OS — Layer 3).
//
// A Playbook is a structured, modular workflow (not a document): an ordered set
// of tasks, each referencing the authority, permits, documents, cost, timeline,
// dependencies, risks and official references. Content is curated from real,
// public French facts (not LLM-generated). Versioned in git — the knowledge
// asset travels with the repo and migrates trivially.

export interface PlaybookRef {
  label: string;
  url: string;
}

export interface PlaybookTask {
  id: string;
  name: string;
  description: string;
  authority?: string; // managed / issued by
  permit?: string;
  documents?: string[];
  cost?: string;
  timeline?: string;
  dependsOn?: string[]; // task ids
  risks?: string[];
  references?: PlaybookRef[];
}

export interface Playbook {
  slug: string;
  title: string;
  sector: string; // matching tag
  summary: string;
  applicableTo: string[];
  prerequisites: string[];
  tasks: PlaybookTask[];
  risks: string[];
  estCost: string;
  estTimeline: string;
  references: PlaybookRef[];
  version: string;
  updated: string; // ISO date
  keywords: string[]; // for query matching
}

const DATA_CENTER: Playbook = {
  slug: 'france-data-center',
  title: 'Setting up a data center in France',
  sector: 'infrastructure',
  summary:
    'End-to-end workflow to build and operate a data center in France — from incorporation and site selection through grid connection, environmental authorisation, connectivity, GDPR/sovereignty and operational certification.',
  applicableTo: ['Cloud / hosting providers', 'Hyperscalers & colocation', 'Industrial / IT operators'],
  prerequisites: [
    'Target capacity (IT load in MW) and growth plan',
    'Budget and financing secured (capex is power- and land-driven)',
    'Region shortlist (power availability, fiber, land, local incentives)',
  ],
  tasks: [
    {
      id: 'incorporation',
      name: 'Company registration',
      description: 'Incorporate a French operating entity (typically SAS/SASU) to hold the project, sign contracts and employ staff.',
      authority: 'INPI — Guichet unique',
      documents: ['Statuts (articles)', 'Proof of registered office', 'Beneficial-owner declaration'],
      cost: '~€200–2,000 (legal + publication)',
      timeline: '1–3 weeks',
      references: [{ label: 'Guichet unique (INPI)', url: 'https://formalites.entreprises.gouv.fr/' }],
    },
    {
      id: 'site',
      name: 'Site & land selection',
      description: 'Secure industrial land with access to high-capacity power and diverse fiber. Verify the local urbanism plan (PLU) zoning allows the use and check flood/industrial risk.',
      authority: 'Commune / Mairie (PLU)',
      documents: ['PLU zoning extract', 'Land title / option', 'Géorisques site report'],
      cost: 'Highly variable (land + studies)',
      timeline: '1–6 months',
      dependsOn: ['incorporation'],
      risks: ['Zoning not compatible', 'Insufficient nearby grid capacity', 'Flood/Seveso constraints'],
      references: [
        { label: 'Géorisques (site risks)', url: 'https://www.georisques.gouv.fr/' },
        { label: 'Service-public — urbanisme', url: 'https://entreprendre.service-public.fr/' },
      ],
    },
    {
      id: 'power',
      name: 'Electricity grid connection',
      description: 'Request a connection sized to IT + cooling load. Loads up to ~12 MVA connect via Enedis (distribution); large loads connect to the RTE transmission grid. Grid studies and capacity reservation are the long-pole of the whole project.',
      authority: 'Enedis (distribution) / RTE (transmission)',
      cost: '€M-scale; depends on capacity & distance to substation',
      timeline: '12–36 months for large connections',
      dependsOn: ['site'],
      risks: ['Grid capacity unavailable in the area', 'Long lead time', 'Reinforcement costs'],
      references: [
        { label: 'Enedis — raccordement', url: 'https://www.enedis.fr/raccordement' },
        { label: 'RTE France', url: 'https://www.rte-france.com/' },
      ],
    },
    {
      id: 'environmental',
      name: 'Environmental authorisation (ICPE)',
      description: 'Data centers are usually classified ICPE (cooling equipment, refrigerant gases, and standby fuel/generators above thresholds), requiring declaration, registration or full environmental authorisation — possibly with an impact assessment.',
      authority: 'DREAL / Préfecture',
      permit: 'ICPE declaration / registration / authorisation environnementale',
      documents: ['ICPE classification note', 'Impact / hazard study (if authorisation)', 'Public consultation file (if required)'],
      cost: 'Studies €tens–hundreds k',
      timeline: '3–18 months depending on regime',
      dependsOn: ['site'],
      risks: ['Authorisation regime triggers impact study + public enquiry', 'Refrigerant / generator thresholds'],
      references: [
        { label: 'ICPE — Géorisques / installations classées', url: 'https://www.georisques.gouv.fr/' },
        { label: 'Service-public — ICPE', url: 'https://entreprendre.service-public.fr/vosdroits/F33414' },
      ],
    },
    {
      id: 'permit',
      name: 'Construction permit (permis de construire)',
      description: 'Obtain the building permit for the shell, electrical rooms and generator yard. Large projects may need additional approvals (highway access, ERP rules where applicable).',
      authority: 'Mairie (commune)',
      permit: 'Permis de construire',
      documents: ['Architectural file', 'Site & access plans', 'Thermal / environmental compliance (RE2020 where applicable)'],
      cost: 'Design & filing fees',
      timeline: '2–6 months instruction',
      dependsOn: ['site', 'environmental'],
      references: [{ label: 'Permis de construire — service-public', url: 'https://entreprendre.service-public.fr/vosdroits/F22276' }],
    },
    {
      id: 'fiber',
      name: 'Fiber connectivity',
      description: 'Contract diverse dark-fiber/transit from multiple carriers with redundant physical paths to carrier hotels / IXPs (e.g. France-IX). Connectivity diversity is a design requirement, not an afterthought.',
      cost: 'Recurring; build-out if greenfield',
      timeline: '1–9 months (longer if civil works)',
      dependsOn: ['site'],
      risks: ['Single physical path = SPOF', 'Long civil works for last-mile'],
      references: [{ label: 'France-IX', url: 'https://www.franceix.net/' }],
    },
    {
      id: 'gdpr',
      name: 'GDPR, data sovereignty & security',
      description: 'Frame data residency and processing under GDPR (CNIL). For sensitive workloads, target SecNumCloud (ANSSI) and, for health data, HDS hosting certification. Define physical and logical security.',
      authority: 'CNIL / ANSSI',
      documents: ['Record of processing', 'Security policy', 'Certifications roadmap'],
      timeline: 'Parallel; certification 6–18 months',
      references: [
        { label: 'CNIL', url: 'https://www.cnil.fr/' },
        { label: 'SecNumCloud (ANSSI)', url: 'https://cyber.gouv.fr/secnumcloud' },
      ],
    },
    {
      id: 'operations',
      name: 'Operational readiness & certification',
      description: 'Stand up operations: staffing, maintenance contracts, insurance, and target certifications — ISO 27001 (security), ISO 50001 / EU Code of Conduct for Data Centres (energy), and Uptime Institute Tier where required by clients.',
      cost: 'Opex + certification fees',
      timeline: 'Before go-live',
      dependsOn: ['power', 'permit', 'fiber', 'gdpr'],
      references: [{ label: 'EU Code of Conduct for Data Centres', url: 'https://joint-research-centre.ec.europa.eu/energy-efficiency/energy-efficiency-products-and-labelling/code-conduct-ict/code-conduct-data-centres-energy-efficiency_en' }],
    },
  ],
  risks: [
    'Grid connection lead time and capacity is the dominant schedule & cost risk — engage Enedis/RTE first.',
    'ICPE authorisation regime can add an impact study + public enquiry.',
    'Power price and PUE drive operating economics.',
  ],
  estCost: 'Capex dominated by power & building; €M-scale per MW of IT load.',
  estTimeline: '18–48 months greenfield (grid connection is the long pole).',
  references: [
    { label: 'Guichet unique (INPI)', url: 'https://formalites.entreprises.gouv.fr/' },
    { label: 'Enedis — raccordement', url: 'https://www.enedis.fr/raccordement' },
    { label: 'ICPE — service-public', url: 'https://entreprendre.service-public.fr/vosdroits/F33414' },
    { label: 'CNIL', url: 'https://www.cnil.fr/' },
  ],
  version: '1.0',
  updated: '2026-06-26',
  keywords: ['data center', 'datacenter', 'data centre', 'centre de données', 'datacentre', 'hosting', 'cloud', 'serveurs', 'colocation', 'infrastructure'],
};

export const PLAYBOOKS: Playbook[] = [DATA_CENTER];

export function getPlaybook(slug: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.slug === slug);
}

// Lightweight query matcher: rank playbooks by keyword/title overlap with the
// user's question. Returns the best match (or null) plus a score.
export function matchPlaybook(query: string): { playbook: Playbook; score: number } | null {
  const q = query.toLowerCase();
  let best: { playbook: Playbook; score: number } | null = null;
  for (const p of PLAYBOOKS) {
    let score = 0;
    for (const kw of p.keywords) if (q.includes(kw)) score += 3;
    for (const w of p.title.toLowerCase().split(/\W+/)) if (w.length > 3 && q.includes(w)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { playbook: p, score };
  }
  return best;
}
