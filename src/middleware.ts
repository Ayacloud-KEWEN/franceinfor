import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Old domains that should permanently redirect to the primary domain.
const PRIMARY_HOST = 'francego.fr';
const REDIRECT_HOSTS = new Set([
  'infr.europeanaialliance.org',
  'www.infr.europeanaialliance.org',
  'www.francego.fr',
]);

export default function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  if (REDIRECT_HOSTS.has(host)) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${PRIMARY_HOST}`);
    return NextResponse.redirect(url, 301);
  }
  return intlMiddleware(req);
}

export const config = {
  // Match all paths except API, static files, and Next internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
