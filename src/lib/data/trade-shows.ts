// Curated real French B2B trade shows & professional events (Event Intelligence,
// M10). Human-curated verifiable facts — name, host city/venue, sector, the
// month it recurs, and the official website. No fabricated "expected leads" or
// "business value" figures; usefulness comes from real attributes + live news
// buzz (added at runtime in lib/sources/events.ts).

export type EventType = 'Trade Show' | 'Conference' | 'Networking';

export interface TradeShow {
  id: string;
  name: string;
  city: string;
  venue: string | null;
  type: EventType;
  sector: string; // sector key, matched against a user's industry query
  month: number; // 1-12, typical recurring month (for sorting / "next edition")
  cadence: 'annual' | 'biennial';
  url: string; // official site
}

// Ordered roughly by calendar month. All URLs are the official event sites.
export const TRADE_SHOWS: TradeShow[] = [
  { id: 'maison-objet', name: 'Maison&Objet', city: 'Paris', venue: 'Paris Nord Villepinte', type: 'Trade Show', sector: 'Design & Homeware', month: 1, cadence: 'annual', url: 'https://www.maison-objet.com/' },
  { id: 'premiere-vision', name: 'Première Vision', city: 'Paris', venue: 'Paris Nord Villepinte', type: 'Trade Show', sector: 'Fashion & Textile', month: 2, cadence: 'biennial', url: 'https://www.premierevision.com/' },
  { id: 'sia', name: "Salon International de l'Agriculture", city: 'Paris', venue: 'Paris Expo Porte de Versailles', type: 'Trade Show', sector: 'Agriculture & Food', month: 2, cadence: 'annual', url: 'https://www.salon-agriculture.com/' },
  { id: 'global-industrie', name: 'Global Industrie', city: 'Lyon / Paris', venue: 'Eurexpo / Paris Nord', type: 'Trade Show', sector: 'Industry & Manufacturing', month: 3, cadence: 'annual', url: 'https://www.global-industrie.com/' },
  { id: 'foire-de-paris', name: 'Foire de Paris', city: 'Paris', venue: 'Paris Expo Porte de Versailles', type: 'Trade Show', sector: 'Consumer & Home', month: 4, cadence: 'annual', url: 'https://www.foiredeparis.fr/' },
  { id: 'sante-expo', name: 'SantExpo', city: 'Paris', venue: 'Paris Expo Porte de Versailles', type: 'Trade Show', sector: 'Healthcare', month: 5, cadence: 'annual', url: 'https://www.santexpo.com/' },
  { id: 'vivatech', name: 'VivaTech', city: 'Paris', venue: 'Paris Expo Porte de Versailles', type: 'Conference', sector: 'Tech & Startups', month: 6, cadence: 'annual', url: 'https://vivatechnology.com/' },
  { id: 'paris-air-show', name: 'Paris Air Show (Le Bourget)', city: 'Le Bourget', venue: 'Parc des Expositions du Bourget', type: 'Trade Show', sector: 'Aerospace & Defense', month: 6, cadence: 'biennial', url: 'https://www.siae.fr/' },
  { id: 'sido', name: 'SIDO Lyon', city: 'Lyon', venue: 'La Cité Internationale', type: 'Conference', sector: 'IoT / AI / Robotics', month: 9, cadence: 'annual', url: 'https://www.sido-lyon.com/' },
  { id: 'big-data-ai', name: 'Big Data & AI Paris', city: 'Paris', venue: 'Paris Expo Porte de Versailles', type: 'Conference', sector: 'Data & AI', month: 10, cadence: 'annual', url: 'https://www.bigdataaiparis.com/' },
  { id: 'sial', name: 'SIAL Paris', city: 'Paris', venue: 'Paris Nord Villepinte', type: 'Trade Show', sector: 'Agriculture & Food', month: 10, cadence: 'biennial', url: 'https://www.sialparis.com/' },
  { id: 'batimat', name: 'Batimat', city: 'Paris', venue: 'Paris Expo Porte de Versailles', type: 'Trade Show', sector: 'Construction & Building', month: 10, cadence: 'biennial', url: 'https://www.batimat.com/' },
  { id: 'pollutec', name: 'Pollutec', city: 'Lyon', venue: 'Eurexpo Lyon', type: 'Trade Show', sector: 'Environment & Energy', month: 11, cadence: 'annual', url: 'https://www.pollutec.com/' },
  { id: 'fic', name: 'FIC (Forum InCyber)', city: 'Lille', venue: 'Lille Grand Palais', type: 'Conference', sector: 'Cybersecurity', month: 4, cadence: 'annual', url: 'https://www.forum-incyber.com/' },
  { id: 'tech-for-retail', name: 'Tech for Retail', city: 'Paris', venue: 'Paris Expo Porte de Versailles', type: 'Conference', sector: 'Retail & E-commerce', month: 11, cadence: 'annual', url: 'https://www.techforretail.com/' },
];
