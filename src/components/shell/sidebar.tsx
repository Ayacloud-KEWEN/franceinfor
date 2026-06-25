'use client';

import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe2,
  Building2,
  Tag,
  ShieldCheck,
  Newspaper,
  Gavel,
  Target,
  Flame,
  CalendarDays,
  Network,
  FileText,
  Bot,
  Settings,
  ShieldAlert,
  Bookmark,
} from 'lucide-react';

type Item = { href: string; key: string; Icon: typeof LayoutDashboard };

const groups: { group: string; items: Item[] }[] = [
  {
    group: 'overview',
    items: [
      { href: '/dashboard', key: 'dashboard', Icon: LayoutDashboard },
      { href: '/watchlist', key: 'watchlist', Icon: Bookmark },
    ],
  },
  {
    group: 'intelligence',
    items: [
      { href: '/markets', key: 'markets', Icon: Globe2 },
      { href: '/companies', key: 'companies', Icon: Building2 },
      { href: '/brands', key: 'brands', Icon: Tag },
      { href: '/credit', key: 'credit', Icon: ShieldCheck },
      { href: '/news', key: 'news', Icon: Newspaper },
    ],
  },
  {
    group: 'opportunities',
    items: [
      { href: '/opportunities', key: 'opportunities', Icon: Gavel },
      { href: '/discover', key: 'discover', Icon: Target },
      { href: '/intent', key: 'intent', Icon: Flame },
      { href: '/events', key: 'events', Icon: CalendarDays },
    ],
  },
  {
    group: 'engage',
    items: [
      { href: '/network', key: 'network', Icon: Network },
      { href: '/copilot', key: 'copilot', Icon: Bot },
      { href: '/reports', key: 'reports', Icon: FileText },
      { href: '/settings', key: 'settings', Icon: Settings },
    ],
  },
];

export function Sidebar({ onNavigate, isAdmin }: { onNavigate?: () => void; isAdmin?: boolean }) {
  const t = useTranslations('nav');
  const tg = useTranslations('navGroup');
  const tb = useTranslations('brand');
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-64 flex-col overflow-y-auto border-r border-border bg-card">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          F
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">{tb('short')}</div>
          <div className="text-[11px] text-muted-foreground">France Market Entry</div>
        </div>
      </div>

      <div className="flex-1 space-y-4 px-3 py-2">
        {groups.map(({ group, items }) => (
          <div key={group}>
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {tg(group)}
            </div>
            <div className="space-y-0.5">
              {items.map(({ href, key, Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon size={17} className="shrink-0" />
                    {t(key)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div>
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {tg('admin')}
            </div>
            <Link
              href="/admin"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/admin' || pathname.startsWith('/admin/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <ShieldAlert size={17} className="shrink-0" />
              {t('admin')}
            </Link>
          </div>
        )}
      </div>

      <div className="px-5 py-4 text-[11px] text-muted-foreground">v0.1 · Foundation build</div>
    </nav>
  );
}
