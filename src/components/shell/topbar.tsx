'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Moon, Sun, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar';
import { logoutAction } from '@/app/actions/auth';

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh', label: '中文' },
];

export function Topbar({ userName, isAdmin }: { userName: string; isAdmin?: boolean }) {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 print:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <Menu size={20} />
        </Button>

        <div className="hidden text-sm text-muted-foreground sm:block">
          {userName}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={locale}
            onChange={(e) => router.replace(pathname, { locale: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            aria-label="Language"
          >
            {locales.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Theme"
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="block h-4 w-4 dark:hidden" />
          </Button>

          <form action={logoutAction.bind(null, locale)}>
            <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
              <LogOut size={18} />
            </Button>
          </form>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} isAdmin={isAdmin} />
          </div>
        </div>
      )}
    </>
  );
}
