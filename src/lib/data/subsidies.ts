// Curated catalogue of real, well-known French business support programmes
// (grants, loans, tax credits, guarantees, equity). These are public, stable
// facts; the live Aides-territoires API (see lib/sources/aides.ts) can layer on
// thousands more local aids when AIDES_API_TOKEN is configured.

export type AidType = 'GRANT' | 'LOAN' | 'TAX_CREDIT' | 'GUARANTEE' | 'EQUITY' | 'ADVISORY';

export interface Subsidy {
  id: string;
  name: string;
  provider: string; // Bpifrance / État / France 2030 / ADEME / Région / CCI …
  type: AidType;
  amount: string; // human-readable range
  description: string;
  url: string;
  // Matching tags (all lowercase, free of accents for simple matching).
  stages: string[]; // idea | startup | growth | sme | established | any
  needs: string[]; // innovation | rd | hiring | export | digital | transition | investment | financing
  sectors: string[]; // 'any' or specific sectors (deeptech, industry, greentech, tech…)
  regions: string[]; // 'national' or specific regions
}

// "any"/"national" act as wildcards in matching.
export const SUBSIDIES: Subsidy[] = [
  {
    id: 'france-2030',
    name: 'France 2030',
    provider: 'France 2030 / État',
    type: 'GRANT',
    amount: '€100k – €several M',
    description: 'National investment plan funding breakthrough innovation, deeptech, industrial reindustrialisation and ecological transition via calls for projects (AAP).',
    url: 'https://www.gouvernement.fr/france-2030',
    stages: ['startup', 'growth', 'sme', 'established'],
    needs: ['innovation', 'rd', 'investment', 'transition'],
    sectors: ['deeptech', 'industry', 'greentech', 'health', 'energy', 'tech'],
    regions: ['national'],
  },
  {
    id: 'bourse-french-tech',
    name: 'Bourse French Tech',
    provider: 'Bpifrance',
    type: 'GRANT',
    amount: 'up to €30k (up to €90k deeptech)',
    description: 'Grant for very early-stage innovative startups to fund feasibility, prototyping and market validation.',
    url: 'https://www.bpifrance.fr/catalogue-offres/aides-aux-projets-dinnovation/bourse-french-tech',
    stages: ['idea', 'startup'],
    needs: ['innovation', 'rd'],
    sectors: ['tech', 'deeptech', 'any'],
    regions: ['national'],
  },
  {
    id: 'cir',
    name: 'Crédit d’Impôt Recherche (CIR)',
    provider: 'État',
    type: 'TAX_CREDIT',
    amount: '30% of eligible R&D spend',
    description: 'Tax credit covering 30% of R&D expenditure (up to €100M, 5% beyond). Open to companies of all sizes carrying out research.',
    url: 'https://www.entreprises.gouv.fr/fr/aides/credit-d-impot-recherche-cir',
    stages: ['startup', 'growth', 'sme', 'established'],
    needs: ['rd', 'innovation'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'cii',
    name: 'Crédit d’Impôt Innovation (CII)',
    provider: 'État',
    type: 'TAX_CREDIT',
    amount: '20% of eligible innovation spend (cap €400k)',
    description: 'Tax credit for SMEs on the design/prototyping of new innovative products, complementary to the CIR.',
    url: 'https://www.entreprises.gouv.fr/fr/aides/credit-d-impot-innovation-cii',
    stages: ['startup', 'growth', 'sme'],
    needs: ['innovation'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'jei',
    name: 'Jeune Entreprise Innovante (JEI)',
    provider: 'État',
    type: 'TAX_CREDIT',
    amount: 'Social charge & tax exemptions',
    description: 'Status for R&D-intensive SMEs under 8 years old: exemption from employer social contributions on R&D staff and local tax reliefs.',
    url: 'https://www.entreprises.gouv.fr/fr/aides/statut-jeune-entreprise-innovante-jei',
    stages: ['startup', 'growth'],
    needs: ['rd', 'innovation', 'hiring'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'pret-innovation',
    name: 'Prêt Innovation Bpifrance',
    provider: 'Bpifrance',
    type: 'LOAN',
    amount: '€50k – €5M',
    description: 'Unsecured loan to finance the launch and scale-up of an innovation, without personal guarantee.',
    url: 'https://www.bpifrance.fr/catalogue-offres/financement/pret-innovation',
    stages: ['growth', 'sme'],
    needs: ['innovation', 'financing'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'garantie-bpifrance',
    name: 'Garantie Bpifrance',
    provider: 'Bpifrance',
    type: 'GUARANTEE',
    amount: 'Up to 60% of a bank loan',
    description: 'Public guarantee that de-risks bank financing for creation, growth and working-capital needs of SMEs.',
    url: 'https://www.bpifrance.fr/catalogue-offres/garantie',
    stages: ['startup', 'growth', 'sme', 'established'],
    needs: ['financing', 'investment'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'pret-honneur',
    name: 'Prêt d’Honneur (Initiative France / Réseau Entreprendre)',
    provider: 'Initiative France / Réseau Entreprendre',
    type: 'LOAN',
    amount: '€3k – €50k, 0% interest',
    description: 'Interest-free personal loan to the founder, strengthening equity to unlock bank financing.',
    url: 'https://www.initiative-france.fr/',
    stages: ['idea', 'startup'],
    needs: ['financing'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'i-lab-i-nov',
    name: 'Concours i-Lab / i-Nov',
    provider: 'Bpifrance / État',
    type: 'GRANT',
    amount: 'up to €600k',
    description: 'National innovation competitions funding deeptech and breakthrough projects (i-Lab for creation, i-Nov within France 2030).',
    url: 'https://www.bpifrance.fr/catalogue-offres/aides-aux-projets-dinnovation',
    stages: ['idea', 'startup', 'growth'],
    needs: ['innovation', 'rd'],
    sectors: ['deeptech', 'tech', 'health', 'greentech'],
    regions: ['national'],
  },
  {
    id: 'ademe',
    name: 'Aides ADEME (transition écologique)',
    provider: 'ADEME',
    type: 'GRANT',
    amount: 'Varies (Fonds Chaleur, décarbonation…)',
    description: 'Grants for energy efficiency, decarbonisation, circular economy and ecological transition projects.',
    url: 'https://agirpourlatransition.ademe.fr/entreprises/',
    stages: ['sme', 'established', 'growth'],
    needs: ['transition', 'investment'],
    sectors: ['industry', 'greentech', 'energy', 'any'],
    regions: ['national'],
  },
  {
    id: 'france-num',
    name: 'France Num — Diagnostic & accompagnement',
    provider: 'État / France Num',
    type: 'ADVISORY',
    amount: 'Free diagnostic + subsidised support',
    description: 'Digital transformation diagnostic and subsidised advisory for small businesses going digital.',
    url: 'https://www.francenum.gouv.fr/',
    stages: ['sme', 'established'],
    needs: ['digital'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'assurance-prospection',
    name: 'Assurance Prospection Bpifrance',
    provider: 'Bpifrance / État',
    type: 'GRANT',
    amount: 'Advance + cover of export prospecting costs',
    description: 'Insurance that advances and covers part of the costs of prospecting foreign markets (export support).',
    url: 'https://www.bpifrance.fr/catalogue-offres/financement-international/assurance-prospection',
    stages: ['growth', 'sme', 'established'],
    needs: ['export'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'aide-embauche-alternance',
    name: 'Aides à l’embauche en alternance',
    provider: 'État',
    type: 'GRANT',
    amount: 'up to €6k per apprentice (1st year)',
    description: 'Hiring subsidy for taking on apprentices / work-study contracts.',
    url: 'https://www.alternance.emploi.gouv.fr/',
    stages: ['startup', 'growth', 'sme', 'established'],
    needs: ['hiring'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'aides-cci',
    name: 'Les Aides — CCI France',
    provider: 'CCI France',
    type: 'ADVISORY',
    amount: 'Directory of 2,000+ aids',
    description: 'CCI directory and advisory to identify national, regional and local aids relevant to your project.',
    url: 'https://les-aides.fr/',
    stages: ['idea', 'startup', 'growth', 'sme', 'established'],
    needs: ['financing', 'innovation', 'investment'],
    sectors: ['any'],
    regions: ['national'],
  },
  {
    id: 'region-investment',
    name: 'Aides régionales à l’investissement (ex. PM’up, Région)',
    provider: 'Conseils régionaux',
    type: 'GRANT',
    amount: 'Varies by region (often €10k – €200k)',
    description: 'Regional grants co-funding investment, growth and job creation for SMEs (each Région runs its own schemes).',
    url: 'https://www.les-aides.fr/aides/',
    stages: ['growth', 'sme', 'established'],
    needs: ['investment', 'hiring'],
    sectors: ['any'],
    regions: ['national'],
  },
];

export interface FundingProfile {
  sector: string;
  stage: string; // idea | startup | growth | sme | established | ''
  region: string;
  need: string; // innovation | rd | hiring | export | digital | transition | investment | financing | ''
}

export interface MatchedSubsidy extends Subsidy {
  score: number;
  reasons: string[];
}

// Score each programme 0–100 against the profile. Pure, deterministic — used
// directly (mock) and to rank live API results.
export function matchSubsidies(profile: FundingProfile): MatchedSubsidy[] {
  const sector = profile.sector.toLowerCase().trim();
  const stage = profile.stage.toLowerCase().trim();
  const region = profile.region.toLowerCase().trim();
  const need = profile.need.toLowerCase().trim();

  const scored = SUBSIDIES.map((s) => {
    let score = 40; // baseline relevance for nationally-available programmes
    const reasons: string[] = [];

    if (need && (s.needs.includes(need) || s.needs.includes('any'))) {
      score += 25;
      reasons.push(`need:${need}`);
    }
    if (stage && (s.stages.includes(stage) || s.stages.includes('any'))) {
      score += 20;
      reasons.push(`stage:${stage}`);
    }
    if (sector && s.sectors.some((x) => x === 'any' || x.includes(sector) || sector.includes(x))) {
      score += 12;
      reasons.push(`sector:${sector}`);
    }
    if (!region || s.regions.includes('national')) {
      score += 3;
    }
    // Penalise clear mismatches so an irrelevant programme ranks lower.
    if (need && !s.needs.includes(need) && !s.needs.includes('any')) score -= 12;
    if (stage && !s.stages.includes(stage) && !s.stages.includes('any')) score -= 8;

    return { ...s, score: Math.max(5, Math.min(100, score)), reasons };
  });

  return scored.sort((a, b) => b.score - a.score);
}
