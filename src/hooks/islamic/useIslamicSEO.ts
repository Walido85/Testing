import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PrayerTimings, HijriDate, PrayerMeta } from './usePrayerTimes';

export interface IslamicSEOProps {
  timings?: PrayerTimings | null;
  hijri?: HijriDate | null;
  meta?: PrayerMeta | null;
  city?: string;
  country?: string;
}

export function useIslamicSEO({ timings, hijri, meta, city = '', country = '' }: IslamicSEOProps = {}) {
  const { i18n } = useTranslation();
  const lang = (i18n.language ? i18n.language.slice(0, 2).toLowerCase() : 'en');

  useEffect(() => {
    if (!timings || !hijri) return;

    const location = [city, country].filter(Boolean).join(', ') || meta?.timezone || 'Your Location';
    const hijriStr = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
    const prayerList = `Fajr ${timings.Fajr} · Dhuhr ${timings.Dhuhr} · Asr ${timings.Asr} · Maghrib ${timings.Maghrib} · Isha ${timings.Isha}`;

    // Title
    document.title = `Prayer Times ${location} | ${hijriStr} | TuniWave`;

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', `https://tuniwave.com/${lang}/islamiyat`);

    // Meta tags
    setMeta('description', `Islamic prayer times for ${location}. ${prayerList}. Hijri date: ${hijriStr}.`);
    setMeta('keywords', `prayer times ${location}, salah times, ${hijri.month.en}, hijri ${hijri.year}, adhan, islamic calendar, qibla`);

    // Open Graph
    setMeta('og:title', `Prayer Times — ${location}`, 'property');
    setMeta('og:description', `${prayerList} | ${hijriStr}`, 'property');
    setMeta('og:type', 'website', 'property');

    // Twitter Card
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', `Prayer Times — ${location}`);
    setMeta('twitter:description', `${prayerList} | ${hijriStr}`);

    // JSON-LD
    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Islamic Prayer Times — ${location}`,
      description: `Daily prayer times for ${location}. ${prayerList}.`,
      keywords: `prayer times, salah, adhan, hijri calendar, ${location}`,
      inLanguage: ['en', 'ar'],
    });

    // If there are Islamic holidays today, add them
    if (hijri.holidays && hijri.holidays.length > 0) {
      const holiday = hijri.holidays.join(', ');
      document.title = `${holiday} | Prayer Times ${location} | TuniWave`;
    }
  }, [timings, hijri, meta, city, country]);
}

function setMeta(name: string, content: string, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setJsonLd(data: any) {
  const id = 'islamic-jsonld';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    (el as HTMLScriptElement).type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}
