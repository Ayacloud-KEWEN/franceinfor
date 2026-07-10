import { getLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Landmark, ShieldCheck } from 'lucide-react';
import {
  PAYMENT_TERMS_SECTION,
  CREDIT_AGENCIES_SECTION,
  type KnowledgeSection,
  type Loc,
} from '@/lib/data/payment-credit';

function SectionCard({ section, loc, icon }: { section: KnowledgeSection; loc: Loc; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          {icon} {section.title[loc]}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{section.intro[loc]}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {section.blocks.map((block) => (
          <div key={block.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="mb-2 text-sm font-semibold">{block.title[loc]}</div>
            <ul className="space-y-1.5">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <span>{item[loc]}</span>
                </li>
              ))}
            </ul>
            {block.links && block.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {block.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {l.label} <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export async function CreditKnowledge() {
  const locale = await getLocale();
  const loc: Loc = locale === 'fr' ? 'fr' : locale === 'zh' ? 'zh' : 'en';

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <SectionCard section={PAYMENT_TERMS_SECTION} loc={loc} icon={<Landmark size={16} />} />
      <SectionCard section={CREDIT_AGENCIES_SECTION} loc={loc} icon={<ShieldCheck size={16} />} />
    </div>
  );
}
