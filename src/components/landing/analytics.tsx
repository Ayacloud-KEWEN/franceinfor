'use client';

import { useEffect } from 'react';
import { CONSENT_KEY } from './cookie-consent';

// Loads Google Analytics (GA4) only after the user grants cookie consent.
// No tracking happens before consent — GDPR-friendly. Configure the measurement
// id via NEXT_PUBLIC_GA_ID.
export function Analytics({ gaId }: { gaId?: string }) {
  useEffect(() => {
    if (!gaId) return;
    let loaded = false;

    function load() {
      if (loaded) return;
      try {
        if (localStorage.getItem(CONSENT_KEY) !== 'granted') return;
      } catch {
        return;
      }
      loaded = true;

      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);

      const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
      w.dataLayer = w.dataLayer || [];
      w.gtag = function gtag() { w.dataLayer.push(arguments); };
      w.gtag('js', new Date());
      w.gtag('config', gaId, { anonymize_ip: true });
    }

    load(); // already consented in a previous visit?
    const onConsent = (e: Event) => {
      if ((e as CustomEvent).detail === 'granted') load();
    };
    window.addEventListener('fg-consent', onConsent);
    return () => window.removeEventListener('fg-consent', onConsent);
  }, [gaId]);

  return null;
}
