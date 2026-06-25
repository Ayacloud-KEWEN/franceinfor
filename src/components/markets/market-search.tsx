'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function MarketSearch({ initial = '' }: { initial?: string }) {
  const t = useTranslations('markets');
  const router = useRouter();
  const [q, setQ] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/markets/search?q=${encodeURIComponent(term)}`);
      }}
      className="mb-5 flex gap-2"
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('searchIndustry')}
        className="max-w-xl"
      />
      <Button type="submit">
        <Search size={16} /> {t('searchBtn')}
      </Button>
    </form>
  );
}
