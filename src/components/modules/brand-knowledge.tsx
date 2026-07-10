import { getLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Scale, Gavel } from 'lucide-react';
import {
  BRAND_LAW_SECTION,
  BRAND_CASES,
  BRAND_CASES_TITLE,
  BRAND_CASES_INTRO,
  type Loc,
} from '@/lib/data/brand-knowledge';

export async function BrandKnowledge() {
  const locale = await getLocale();
  const loc: Loc = locale === 'fr' ? 'fr' : locale === 'zh' ? 'zh' : 'en';

  return (
    <div className="mt-6 space-y-6">
      {/* A. Law & registration process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Scale size={16} /> {BRAND_LAW_SECTION.title[loc]}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{BRAND_LAW_SECTION.intro[loc]}</p>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          {BRAND_LAW_SECTION.blocks.map((block) => (
            <div key={block.id}>
              <div className="mb-2 text-sm font-semibold">{block.title[loc]}</div>
              <ul className="space-y-1.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                    <span>{item[loc]}</span>
                  </li>
                ))}
              </ul>
              {block.links && (
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

      {/* B. Case studies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Gavel size={16} /> {BRAND_CASES_TITLE[loc]}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{BRAND_CASES_INTRO[loc]}</p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {BRAND_CASES.map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold">{c.name}</div>
                <Badge tone={c.tone === 'positive' ? 'accent' : 'muted'} className="shrink-0">
                  {c.tone === 'positive' ? '🟢' : '🔴'}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.summary[loc]}</p>
              <p className="mt-2 text-sm leading-relaxed">
                <span className="font-medium">💡 </span>
                {c.lesson[loc]}
              </p>
              <a
                href={c.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {c.link.label} <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
