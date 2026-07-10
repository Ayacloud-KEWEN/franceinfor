import { getLocale, getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Lock, Clock, Sparkles } from 'lucide-react';
import { LeadForm } from '@/components/services/lead-form';
import {
  LANDING_HERO,
  LANDING_PILLARS,
  LANDING_LABELS,
  type Loc,
} from '@/lib/data/landing-package';

// One-stop "soft landing" bundled offer. Framework facts are public; the
// operational deliverables are shown by NAME only (content stays offline) —
// the unlock path is the lead form, which is the moat by design.
export async function LandingPackage() {
  const locale = await getLocale();
  const loc: Loc = locale === 'fr' ? 'fr' : locale === 'zh' ? 'zh' : 'en';
  const t = await getTranslations('services');

  return (
    <Card className="mt-8 overflow-hidden border-accent/30">
      <CardHeader>
        <Badge tone="accent" className="inline-flex items-center gap-1">
          <Sparkles size={12} /> {t('sectionLabel')}
        </Badge>
        <CardTitle className="mt-2 flex items-center gap-2 text-base text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Rocket size={16} />
          </span>
          {LANDING_HERO.title[loc]}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{LANDING_HERO.intro[loc]}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs">
          <Clock size={13} className="text-muted-foreground" />
          <b>{LANDING_HERO.timeline[loc]}</b>
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {LANDING_PILLARS.map((p) => (
            <div key={p.id} className="flex flex-col rounded-lg border border-border p-4">
              <div className="text-sm font-semibold">{p.title[loc]}</div>

              <div className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {LANDING_LABELS.included[loc]}
              </div>
              <ul className="mt-1.5 space-y-1.5">
                {p.teaser.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                    <span>{item[loc]}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 rounded-md border border-dashed border-accent/40 bg-accent/5 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-accent">
                  {LANDING_LABELS.gated[loc]}
                </div>
                <ul className="mt-1.5 space-y-1.5">
                  {p.gated.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lock size={13} className="mt-0.5 shrink-0 text-accent" />
                      <span>{item[loc]}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-muted-foreground">{LANDING_LABELS.gatedNote[loc]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <p className="text-sm text-muted-foreground">{LANDING_HERO.cta[loc]}</p>
          <LeadForm kind="COMPANY" context="LANDING PACK" />
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">{t('disclaimer')}</p>
      </CardContent>
    </Card>
  );
}
