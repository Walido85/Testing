import { useEffect } from 'react';

export const LanguageRoot = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const saved = localStorage.getItem('i18nextLng');
        const browserLang = navigator.language ? navigator.language.split('-')[0] : 'ar';
        const supportedLangs = ['ar', 'fr', 'en'];
        
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const hasLangPrefix = supportedLangs.includes(pathParts[0]);
        
        if (!hasLangPrefix) {
            const lang = (saved && supportedLangs.includes(saved)) ? saved : (supportedLangs.includes(browserLang) ? browserLang : 'ar');
            const targetPath = `/${lang}${window.location.pathname === '/' ? '' : window.location.pathname}${window.location.search}${window.location.hash}`;
            window.location.replace(targetPath);
        }
    }, []);

    return null;
};
