// Sector "landing & compliance" checklists for entering the French market.
//
// Content is curated from stable, public French regulatory facts (not LLM-
// generated — compliance must not hallucinate). Sector-agnostic basics (legal
// form, VAT/tax, employment, GDPR) are combined with a sector-specific
// regulation/certification overlay. Informational only — not legal advice.

export interface ChecklistSection {
  id: 'legalForm' | 'tax' | 'employment' | 'sector' | 'gdpr';
  items: string[];
}

export interface SectorCompliance {
  sector: string; // key
  sectorRegulation: string[]; // overlay bullets
  sections: ChecklistSection[];
}

// Sector-agnostic basics, shared by every checklist.
const BASE = {
  legalForm: [
    'SAS / SASU — the most common vehicle for foreign investors: flexible governance, no minimum capital, president can be a foreign national or company.',
    'SARL / EURL — lower-cost, more rigid; suited to small owner-run businesses.',
    'Branch (succursale) vs subsidiary (filiale): a subsidiary is a separate French legal entity (limited liability); a branch is an extension of the foreign parent.',
    'Micro-entreprise is not suitable for scaling or for most foreign-owned operations.',
    'Register via the Guichet unique (INPI) — obtains SIREN/SIRET and Kbis; a French registered office (or domiciliation) is required.',
  ],
  tax: [
    'VAT (TVA): standard rate 20%, reduced 10% / 5.5% / 2.1% for specific goods/services.',
    'An intra-EU VAT number is required for cross-border EU trade; reverse-charge applies on many B2B EU transactions.',
    'Corporate income tax (IS): 25% standard rate (reduced 15% on the first €42,500 of profit for eligible SMEs).',
    'Local business taxes: CFE and CVAE (CET) based on location and value added.',
    'Filing/accounting must follow the French PCG; appointing a French expert-comptable is strongly advised.',
  ],
  employment: [
    'Contracts: CDI (permanent) is the default; CDD (fixed-term) is restricted to defined cases.',
    'Statutory working week is 35 hours; overtime and working-time rules apply. Minimum wage (SMIC) is mandatory.',
    'Employer social contributions (URSSAF) add roughly 25–42% on top of gross salary.',
    'A sector collective bargaining agreement (convention collective) usually applies and sets extra obligations.',
    'Pre-hire declaration (DPAE) to URSSAF before each hire; mandatory employer health cover (mutuelle) and occupational health.',
  ],
  gdpr: [
    'Maintain a record of processing activities (registre des traitements); CNIL is the supervisory authority.',
    'Appoint a DPO where required; run a DPIA for high-risk processing.',
    'Lawful basis + clear privacy notice; valid consent for marketing and non-essential cookies.',
    'Frame transfers of personal data outside the EU (SCCs / adequacy).',
    'Honour data-subject rights (access, deletion, portability) within statutory deadlines.',
  ],
};

// Sector-specific regulation / certification overlays.
const OVERLAYS: Record<string, string[]> = {
  generic: [
    'Check whether your activity is regulated (licence, registration or professional qualification required).',
    'Confirm product/service-specific labelling, safety and consumer-protection rules (DGCCRF).',
  ],
  food: [
    'Food hygiene: HACCP plan mandatory; declaration to the DDPP/préfecture; sanitary approval (agrément sanitaire) for animal-origin products.',
    'Labelling per EU Regulation 1169/2011 (INCO): allergens, origin, nutrition.',
    'DGCCRF oversight on fraud, claims and consumer protection.',
    'Cold-chain, traceability and recall procedures required.',
  ],
  health: [
    'Medical devices: CE marking under EU MDR 2017/745; clinical evaluation and technical file.',
    'ANSM is the competent authority; register operators and certain devices.',
    'Data: health data is sensitive under GDPR — hosting on a certified HDS provider (Hébergeur de Données de Santé).',
    'Reimbursement pathways (CEPS / HAS) for products seeking public coverage.',
  ],
  construction: [
    'Mandatory ten-year liability insurance (assurance décennale) and professional liability.',
    'Qualifications/labels: Qualibat; RGE label required to let clients access energy-renovation aids.',
    'Worksite worker card (carte BTP); compliance with thermal/environmental regulation (RE2020).',
    'Posted-worker (détachement) rules for EU subcontracted labour.',
  ],
  finance: [
    'Authorisation/registration with ACPR (banking, payments, insurance) and/or AMF (investment).',
    'Possible EU passporting of an existing licence into France.',
    'Strong AML/CFT (LCB-FT) program: KYC, monitoring, declarations to TRACFIN.',
    'Consumer-credit, payment-services (DSP2) and MiCA (crypto-assets) regimes as applicable.',
  ],
  cosmetics: [
    'EU Regulation 1223/2009: product information file (PIF) and safety assessment by a qualified assessor.',
    'Notify each product on the EU CPNP portal; designate a Responsible Person established in the EU.',
    'Good Manufacturing Practice (ISO 22716); strict labelling and claims rules.',
  ],
  tech: [
    'Software/SaaS is generally unregulated, but GDPR and the EU AI Act may apply to your processing/products.',
    'Public-sector clients require RGAA accessibility and often SecNumCloud / hosting guarantees.',
    'E-commerce: legal notices (mentions légales), GTC/GTU and 14-day withdrawal right for consumers.',
  ],
  retail: [
    'Consumer law: pre-contractual information, 14-day right of withdrawal (distance selling), guarantees.',
    'Mandatory legal notices (mentions légales) and clear pricing/labelling (DGCCRF).',
    'Packaging EPR (REP) eco-contribution (e.g. CITEO) and waste-sorting obligations.',
  ],
  energy: [
    'Installations may be classified ICPE (environmental authorisation/registration/declaration).',
    'ADEME programmes and France 2030 fund energy/ecological-transition projects.',
    'Sector authorisations (electricity/gas supply, renewable PPAs) and grid-connection rules.',
  ],
};

export const COMPLIANCE_SECTORS = Object.keys(OVERLAYS);

export function getCompliance(sectorKey: string): SectorCompliance {
  const key = OVERLAYS[sectorKey] ? sectorKey : 'generic';
  return {
    sector: key,
    sectorRegulation: OVERLAYS[key],
    sections: [
      { id: 'legalForm', items: BASE.legalForm },
      { id: 'tax', items: BASE.tax },
      { id: 'employment', items: BASE.employment },
      { id: 'sector', items: OVERLAYS[key] },
      { id: 'gdpr', items: BASE.gdpr },
    ],
  };
}
