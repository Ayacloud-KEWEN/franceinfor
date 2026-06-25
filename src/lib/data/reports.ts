// Report Center templates (per spec).
export interface ReportTemplate {
  slug: string;
  name: string;
  description: string;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { slug: 'company', name: 'Company Report', description: 'Full profile, financials, executives, risk.' },
  { slug: 'due-diligence', name: 'Due Diligence Report', description: 'Legal, financial and reputational review.' },
  { slug: 'market-entry', name: 'Market Entry Report', description: 'France GTM strategy, 90-day plan, ROI.' },
  { slug: 'industry', name: 'Industry Report', description: 'Market size, growth, key players, trends.' },
  { slug: 'partner', name: 'Partner Report', description: 'Distributors, integrators, fit scoring.' },
  { slug: 'tender', name: 'Tender Report', description: 'Qualification, win probability, action plan.' },
  { slug: 'credit', name: 'Credit Report', description: 'Financial health & payment risk scoring.' },
  { slug: 'sales', name: 'Sales Opportunity Report', description: 'High-intent buyers and recommended actions.' },
];

export function getTemplate(slug: string) {
  return REPORT_TEMPLATES.find((t) => t.slug === slug);
}
