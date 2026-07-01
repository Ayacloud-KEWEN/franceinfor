import 'server-only';

export interface LinkResult {
  url: string;
  ok: boolean;
  status: number | null;
  error?: string;
}

// Lightweight reachability check for reference URLs. Tries HEAD, falls back to
// GET (some gov sites reject HEAD). Treats any < 400 status as reachable.
async function checkOne(url: string): Promise<LinkResult> {
  if (!/^https?:\/\//i.test(url)) return { url, ok: false, status: null, error: 'not_http_url' };
  const attempt = async (method: 'HEAD' | 'GET'): Promise<LinkResult> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'FranceGo-LinkCheck/1.0' },
      });
      return { url, ok: res.status < 400, status: res.status };
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    const head = await attempt('HEAD');
    if (head.ok || (head.status && head.status !== 405 && head.status !== 403)) return head;
    return await attempt('GET');
  } catch (e) {
    return { url, ok: false, status: null, error: (e as Error).name === 'AbortError' ? 'timeout' : 'unreachable' };
  }
}

export async function checkUrls(urls: string[]): Promise<LinkResult[]> {
  const unique = Array.from(new Set(urls.filter(Boolean))).slice(0, 40);
  return Promise.all(unique.map(checkOne));
}
