// Curated real French business-ecosystem directory for Opportunity Discovery
// (M2). These are verifiable, well-known French organisations with official
// sites — used for the sector-agnostic categories (investors, accelerators,
// business associations, public buyers) where a live company-registry query
// isn't the right tool. Company-specific categories (customers, distributors,
// integrators) are pulled live from the registry instead.

export interface DirectoryEntry {
  name: string;
  reason: string; // short real descriptor (role / specialty)
  url: string;
}

export const ECOSYSTEM_DIRECTORY: Record<string, DirectoryEntry[]> = {
  Investors: [
    { name: 'Bpifrance', reason: 'Public investment bank · equity & loans', url: 'https://www.bpifrance.fr/' },
    { name: 'Partech', reason: 'VC · seed to growth', url: 'https://partechpartners.com/' },
    { name: 'Eurazeo', reason: 'Private equity & venture', url: 'https://www.eurazeo.com/' },
    { name: 'Alven', reason: 'VC · software & consumer', url: 'https://www.alven.co/' },
    { name: 'Elaia', reason: 'VC · deep tech & B2B', url: 'https://www.elaia.com/' },
    { name: 'Ventech', reason: 'VC · early stage', url: 'https://www.ventechvc.com/' },
    { name: 'Serena', reason: 'VC · tech', url: 'https://www.serena.vc/' },
    { name: 'XAnge', reason: 'VC · impact & tech', url: 'https://www.xange.vc/' },
  ],
  Accelerators: [
    { name: 'Station F', reason: 'World’s largest startup campus (Paris)', url: 'https://stationf.co/' },
    { name: 'Bpifrance Le Hub', reason: 'Corporate–startup accelerator', url: 'https://lehub.bpifrance.fr/' },
    { name: 'Wilco', reason: 'Startup accelerator (Île-de-France)', url: 'https://www.wilco-startup.com/' },
    { name: '50 Partners', reason: 'Founder-led accelerator', url: 'https://50partners.fr/' },
    { name: 'Agoranov', reason: 'Deep-tech incubator (Paris)', url: 'https://www.agoranov.com/' },
    { name: 'Euratechnologies', reason: 'Tech incubator (Lille)', url: 'https://www.euratechnologies.com/' },
    { name: 'La French Tech', reason: 'National startup network', url: 'https://lafrenchtech.gouv.fr/' },
  ],
  Associations: [
    { name: 'France Digitale', reason: 'Startup & investor association', url: 'https://francedigitale.org/' },
    { name: 'Numeum', reason: 'Digital & IT industry union', url: 'https://numeum.fr/' },
    { name: 'MEDEF', reason: 'Main employers’ federation', url: 'https://www.medef.com/' },
    { name: 'CPME', reason: 'SME employers’ confederation', url: 'https://www.cpme.fr/' },
    { name: 'CCI France', reason: 'Chambers of commerce network', url: 'https://www.cci.fr/' },
    { name: 'Business France', reason: 'National agency for foreign investment', url: 'https://www.businessfrance.fr/' },
    { name: 'Systematic Paris-Region', reason: 'Deep-tech competitiveness cluster', url: 'https://www.systematic-paris-region.org/' },
    { name: 'Cap Digital', reason: 'Digital innovation cluster', url: 'https://www.capdigital.com/' },
  ],
  'Public Buyers': [
    { name: 'UGAP', reason: 'Central public purchasing body', url: 'https://www.ugap.fr/' },
    { name: 'Région Île-de-France', reason: 'Regional government procurement', url: 'https://www.iledefrance.fr/' },
    { name: 'Ville de Paris', reason: 'City of Paris procurement', url: 'https://www.paris.fr/' },
    { name: 'AP-HP', reason: 'Paris public hospitals group', url: 'https://www.aphp.fr/' },
    { name: 'Ministère des Armées', reason: 'Defense procurement', url: 'https://www.defense.gouv.fr/' },
    { name: 'CNRS', reason: 'National research organisation', url: 'https://www.cnrs.fr/' },
    { name: 'SNCF', reason: 'National railway operator', url: 'https://www.sncf.com/' },
    { name: 'RATP', reason: 'Paris transport operator', url: 'https://www.ratp.fr/' },
  ],
};
