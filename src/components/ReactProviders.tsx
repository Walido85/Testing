import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { PlayerProvider } from '../context/PlayerContext';
import { LocationProvider } from '../context/LocationContext';
import { LanguageProvider } from '../context/LanguageContext';
import i18n from '../i18n';

interface Props {
  children: React.ReactNode;
  url?: string;
  lang?: string;
}

export default function ReactProviders({ children, url, lang }: Props) {
  // Normalize URL to avoid trailing slash mismatches during hydration
  const normalize = (path: string) => path === '/' ? path : path.replace(/\/$/, '');
  
  // Use url prop (set by Astro) as the authoritative source.
  // Always use a consistent value for SSR/hydration — never read window during render.
  const initialUrl = url ? normalize(url) : '/';

  const getLangFromUrl = (urlStr: string) => {
    if (!urlStr) return null;
    const parts = urlStr.split('/').filter(Boolean);
    const l = parts[0];
    return ['en', 'fr', 'ar'].includes(l) ? l : null;
  };

  const urlLang = lang || getLangFromUrl(initialUrl) || 'ar';
  if (i18n.language !== urlLang) {
    i18n.changeLanguage(urlLang);
  }

  React.useEffect(() => {
    if (i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang);
    }
  }, [urlLang]);

  return (
    <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <PlayerProvider>
                <LanguageProvider initialLang={urlLang as any}>
                  {children}
                </LanguageProvider>
              </PlayerProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
    </HelmetProvider>
  );
}
