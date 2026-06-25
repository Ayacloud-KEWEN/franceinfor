'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, ScorePill } from '@/components/ui/badge';
import { Search, Loader2, Building2, Users, GitBranch } from 'lucide-react';

interface DM { name: string; role: string | null; influence: number; buyingIntent: number; relationship: number }
interface Profile {
  company: { name: string; siren: string; city: string | null; establishments: number | null };
  decisionMakers: DM[];
  parents: { name: string; siren: string | null }[];
}

export function NetworkExplorer() {
  const t = useTranslations('network');
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/network/search?q=${encodeURIComponent(input)}`);
      const json = await res.json();
      setProfile(res.ok ? json.profile : null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('searchPlaceholder')} className="max-w-xl" />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />} {t('search')}
        </Button>
      </form>

      {searched && !profile && <p className="text-sm text-muted-foreground">{t('noResults')}</p>}

      {profile && (
        <>
          <p className="text-xs text-muted-foreground">{t('liveNote')}</p>
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Decision makers (real executives) */}
            <div className="lg:col-span-2">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Users size={15} /> {t('decisionMakers')} — {profile.company.name}
              </h2>
              <Card className="overflow-hidden">
                {profile.decisionMakers.length === 0 ? (
                  <CardContent className="py-4 text-sm text-muted-foreground">—</CardContent>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">{t('contact')}</th>
                        <th className="px-4 py-2.5 font-medium">{t('influence')}</th>
                        <th className="px-4 py-2.5 font-medium">{t('buyingIntent')}</th>
                        <th className="px-4 py-2.5 font-medium">{t('relationship')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.decisionMakers.map((d, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="font-medium">{d.name}</div>
                            <div className="text-xs text-muted-foreground">{d.role || '—'}</div>
                          </td>
                          <td className="px-4 py-3"><ScorePill score={d.influence} /></td>
                          <td className="px-4 py-3"><ScorePill score={d.buyingIntent} /></td>
                          <td className="px-4 py-3"><ScorePill score={d.relationship} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>

            {/* Corporate structure (real) */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-foreground">{t('relationshipGraph')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {profile.parents.length > 0 && (
                    <div>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">{t('parents')}</div>
                      <div className="space-y-1.5">
                        {profile.parents.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-md bg-primary/5 px-2.5 py-1.5">
                            <Building2 size={14} className="text-primary" />
                            <span className="text-xs">{p.name}{p.siren ? ` · ${p.siren}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-accent">
                    <div className="text-xs font-semibold">{profile.company.name}</div>
                    <div className="text-[11px]">SIREN {profile.company.siren}{profile.company.city ? ` · ${profile.company.city}` : ''}</div>
                  </div>

                  {profile.company.establishments != null && (
                    <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-muted-foreground">
                      <GitBranch size={14} />
                      <span className="text-xs">{profile.company.establishments} {t('establishments')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
