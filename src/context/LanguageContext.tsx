import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAstroNavigate } from '../utils/navigation';
import { useTranslation } from 'react-i18next';

type Language = 'ar' | 'fr' | 'en';

interface LanguageContextType {
  lang: Language;
  switchLanguage: (newLang: Language) => void;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLang?: Language }> = ({ children, initialLang }) => {
  const location = typeof window !== 'undefined' ? window.location : { pathname: '' };
  const navigate = useAstroNavigate();
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const [lang, setLang] = useState<Language>(() => {
    if (initialLang) return initialLang;
    const parts = location.pathname.split('/');
    const p1 = parts[1];
    if (p1 === 'ar' || p1 === 'fr' || p1 === 'en') return p1 as Language;
    return 'ar';
  });

  useEffect(() => {
    setMounted(true);
    const parts = location.pathname.split('/');
    const p1 = parts[1];
    if (p1 === 'ar' || p1 === 'fr' || p1 === 'en') {
      const detected = p1 as Language;
      setLang(detected);
      if (i18n.language !== detected) {
        i18n.changeLanguage(detected);
      }
      document.documentElement.lang = detected;
      document.documentElement.dir = detected === 'ar' ? 'rtl' : 'ltr';
    }
  }, [location.pathname, i18n]);

  const switchLanguage = (newLang: Language) => {
    const pathParts = location.pathname.split('/');
    if (['ar', 'fr', 'en'].includes(pathParts[1])) {
      pathParts[1] = newLang;
      navigate(pathParts.join('/'));
    } else {
      navigate(`/${newLang}${location.pathname}`);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext) || { lang: 'ar', switchLanguage: () => {}, mounted: false };
