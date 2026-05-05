import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { Link } from '../utils/navigation';
import { ShieldCheck } from 'lucide-react';

export default function CookieConsent() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!localStorage.getItem('cookieConsent')) {
          setIsVisible(true);
        }
      } catch(e) {
        setIsVisible(true);
      }
    }, 2500); // Delay showing cookie consent to improve initial page load performance
    return () => clearTimeout(timer);
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const rejectNonEssential = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 bg-[var(--bg-color)] border-t border-[var(--border-color)] shadow-2xl backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 mt-1">
            <ShieldCheck className="w-8 h-8 text-[var(--accent-color)]" />
          </div>
          <div className="text-[var(--text-color)] opacity-80 text-xs sm:text-sm">
            <p className="font-bold mb-1 text-[var(--text-color)] opacity-100">{t('We value your privacy')}</p>
            <p className="leading-relaxed">
              {t('We use essential cookies to make TuniWave work and analyze traffic for a better experience. By selecting "Accept all" you agree to all cookies. You can choose to "Reject non-essential".')}{' '}
              <Link to={`/${lang}/privacy`} className="underline hover:text-[var(--accent-color)]">{t('See our Privacy Policy.')}</Link>
            </p>
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
          <button 
            onClick={acceptAll}
            className="flex-1 sm:flex-none px-6 py-2 bg-[var(--accent-color)] text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-opacity-90 transition-all"
          >
            {t('Accept all')}
          </button>
          <button 
            onClick={rejectNonEssential}
            className="flex-1 sm:flex-none px-6 py-2 bg-transparent border border-[var(--border-color)] text-[var(--text-color)] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--card-bg)] shadow-inner transition-all"
          >
            {t('Reject non-essential')}
          </button>
        </div>
      </div>
    </div>
  );
}
