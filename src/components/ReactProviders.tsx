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
  
  // Prefer the `url` prop (authoritative, set by Astro at render time).
  // Only fall back to window.location when no prop is provided (e.g. StandalonePlayer).
  const initialUrl = url 
    ? normalize(url) 
    : (typeof window !== 'undefined' ? normalize(window.location.pathname) + window.location.search : '/');

  // Determine initial language from URL synchronously
  // This prevents hydration mismatches where the server renders one language
  // and the client renders another before the useEffect fires.
  const getLangFromUrl = (urlStr: string) => {
    if (!urlStr) return null;
    const parts = urlStr.split('/').filter(Boolean);
    const lang = parts[0];
    return ['en', 'fr', 'ar'].includes(lang) ? lang : null;
  };

  const urlLang = lang || getLangFromUrl(initialUrl);
  if (urlLang && i18n.language !== urlLang) {
    i18n.changeLanguage(urlLang);
  }

  // Still keep useEffect in case of client-side routing changes without unmounting ReactProviders
  React.useEffect(() => {
    if (urlLang && i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang);
    }
  }, [urlLang, i18n.language]);

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
