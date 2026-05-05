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
  const navigate = useAstroNavigate();
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Always start with a consistent value — never read window during render.
  const [lang, setLang] = useState<Language>(initialLang || 'ar');

  useEffect(() => {
    setMounted(true);
    const activeLang = initialLang || lang;
    if (lang !== activeLang) setLang(activeLang);
    if (i18n.language !== activeLang) i18n.changeLanguage(activeLang);
    document.documentElement.lang = activeLang;
    document.documentElement.dir = activeLang === 'ar' ? 'rtl' : 'ltr';
  }, [initialLang]);

  const switchLanguage = (newLang: Language) => {
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/');
    if (['ar', 'fr', 'en'].includes(pathParts[1])) {
      pathParts[1] = newLang;
      navigate(pathParts.join('/'));
    } else {
      navigate(`/${newLang}${pathname}`);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext) || { lang: 'ar', switchLanguage: () => {}, mounted: false };