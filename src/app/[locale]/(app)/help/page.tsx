import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { getHelp, type Loc } from '@/lib/data/help';
import { ArrowRight } from 'lucide-react';

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, groups] = await Promise.all([getTranslations('help'), Promise.resolve(getHelp(locale as Loc))]);

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Table of contents */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {groups.flatMap((g) =>
              g.sections.map((sec) => (
                <a key={sec.id} href={`#${sec.id}`} className="truncate text-sm text-primary hover:underline">
                  {sec.title}
                </a>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.group}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</h2>
            <div className="space-y-4">
              {g.sections.map((sec) => (
                <Card key={sec.id} id={sec.id} className="scroll-mt-20">
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base text-foreground">
                      {sec.title}
                      {sec.href && (
                        <Link href={sec.href} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          {t('openModule')} <ArrowRight size={12} />
                        </Link>
                      )}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{sec.intro}</p>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {sec.steps.map((step, i) => (
                        <li key={i} className="flex gap-2.5 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
