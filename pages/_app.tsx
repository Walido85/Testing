import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { PlayerProvider } from '../src/context/PlayerContext';
import { LocationProvider } from '../src/context/LocationContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import BottomNav from '../src/components/BottomNav';
import PersistentPlayer from '../src/components/PersistentPlayer';
import CookieConsent from '../src/components/CookieConsent';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';
import { Link } from '../src/utils/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Newspaper, TrendingUp, Trophy, Tv, Radio,
  Plane, Moon, Star, User, Sun, Globe, TrendingUp as TrendingUpIcon, X
} from 'lucide-react';
import i18n from '../src/i18n';
import '../src/index.css';

const LANGS = ['ar', 'fr', 'en'] as const;
type Lang = typeof LANGS[number];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const lang = (router.query.lang as Lang) || (pageProps.lang as Lang) || 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (typeof window !== 'undefined' && i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <PlayerProvider>
            <LanguageProvider initialLang={lang}>
              <div className="flex flex-col min-h-screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="md:hidden sticky top-0 z-[100]">
                  <Header showLogo onMenuToggle={() => setIsMobileMenuOpen(true)} />
                </div>
                <DesktopHeader lang={lang} />
                <main className="flex-1" style={{ background: 'var(--bg-color)' }}>
                  <div className="max-w-7xl lg:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-8">
                    <Component {...pageProps} />
                  </div>
                </main>
                <Footer />
                <BottomNav />
                <PersistentPlayer />
                <CookieConsent />
                <MobileDrawer lang={lang} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
              </div>
            </LanguageProvider>
          </PlayerProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ── Mobile slide-out drawer ──────────────────────────────────────────────────
function MobileDrawer({ lang, isOpen, onClose }: { lang: string; isOpen: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const navItems = [
    { path: `/${lang}/`, icon: Home, label: t('Home') },
    { path: `/${lang}/news`, icon: Newspaper, label: t('News') },
    { path: `/${lang}/finance`, icon: TrendingUp, label: t('Finance') },
    { path: `/${lang}/sports`, icon: Trophy, label: t('Sports') },
    { path: `/${lang}/tv`, icon: Tv, label: t('Live TV') },
    { path: `/${lang}/radio`, icon: Radio, label: t('Radio') },
    { path: 'https://vols.tuniwave.com', icon: Plane, label: t('Vols'), isExternal: true },
    { path: `/${lang}/islamiyat`, icon: Moon, label: t('Islamiyat') },
    { path: `/${lang}/horoscope`, icon: Star, label: t('Horoscope') },
  ];

  const isArabic = i18n.language === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] md:hidden"
          />
          <motion.div
            initial={{ x: isArabic ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 w-[80%] max-w-[320px] z-[201] flex flex-col shadow-2xl md:hidden ${isArabic ? 'right-0' : 'left-0'}`}
            style={{ background: 'var(--header-bg)' }}
          >
            {/* Drawer header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <Link to={`/${lang}/`} onClick={onClose} className="flex items-center gap-2 group">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[var(--accent-color)] rounded-lg rotate-12 shadow-lg" />
                  <TrendingUpIcon className="relative w-6 h-6 text-white" />
                </div>
                <span className="font-black text-2xl tracking-tighter" style={{ color: 'var(--text-color)' }}>
                  Tuni<span className="text-[var(--accent-color)]">Wave</span>
                </span>
              </Link>
              <button onClick={onClose} className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-color)' }} />
              </button>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = !item.isExternal && (
                  router.asPath === item.path ||
                  router.asPath === item.path + '/' ||
                  (item.path !== `/${lang}/` && router.asPath.startsWith(item.path))
                );
                const cls = `flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wide ${isActive ? 'bg-[var(--accent-color)] text-white shadow-md' : 'hover:bg-[var(--hover-bg)]'}`;
                const style = { color: isActive ? 'white' : 'var(--text-color)' };
                const content = <><item.icon className="w-5 h-5 shrink-0" /><span>{item.label}</span></>;
                if (item.isExternal) return <a key={item.path} href={item.path} className={cls} style={style} onClick={onClose}>{content}</a>;
                return <Link key={item.path} to={item.path} className={cls} style={style} onClick={onClose}>{content}</Link>;
              })}
            </div>

            {/* Footer: dark mode + profile */}
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--hover-bg)] transition-colors font-bold text-sm"
                style={{ color: 'var(--text-color)' }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{isDarkMode ? t('Light Mode') : t('Dark Mode')}</span>
              </button>
              <Link
                to={`/${lang}/profile`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border hover:bg-[var(--hover-bg)] transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
              >
                {user?.photoURL
                  ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                  : <User className="w-8 h-8 p-1.5 bg-[var(--hover-bg)] rounded-full" />}
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-tight">{user?.displayName || t('My Account')}</span>
                  <span className="text-[9px] opacity-40 uppercase font-bold">{user ? t('Manage Profile') : t('Login / Sign Up')}</span>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Desktop sticky header ────────────────────────────────────────────────────
function DesktopHeader({ lang }: { lang: string }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'EN', fullLabel: 'English', flag: 'https://flagcdn.com/us.svg' },
    { code: 'fr', label: 'FR', fullLabel: 'Français', flag: 'https://flagcdn.com/fr.svg' },
    { code: 'ar', label: 'عر', fullLabel: 'العربية', flag: 'https://flagcdn.com/tn.svg' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const otherLanguages = languages.filter(l => l.code !== i18n.language);

  const navItems = [
    { path: `/${lang}/`, icon: Home, label: t('Home') },
    { path: `/${lang}/news`, icon: Newspaper, label: t('News') },
    { path: `/${lang}/finance`, icon: TrendingUp, label: t('Finance') },
    { path: `/${lang}/sports`, icon: Trophy, label: t('Sports') },
    { path: `/${lang}/tv`, icon: Tv, label: t('Live TV') },
    { path: `/${lang}/radio`, icon: Radio, label: t('Radio') },
    { path: 'https://vols.tuniwave.com', icon: Plane, label: t('Vols'), isExternal: true },
    { path: `/${lang}/islamiyat`, icon: Moon, label: t('Islamiyat') },
    { path: `/${lang}/horoscope`, icon: Star, label: t('Horoscope') },
  ];

  useEffect(() => {
    if (!isLangOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isLangOpen]);

  const changeLanguage = (code: string) => {
    const parts = router.asPath.split('/').filter(Boolean);
    if (['ar', 'fr', 'en'].includes(parts[0])) parts[0] = code;
    else parts.unshift(code);
    if (parts[1] === 'news' && parts.length > 2) { router.push(`/${code}/news`); setIsLangOpen(false); return; }
    router.push('/' + parts.join('/'));
    setIsLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-[100] border-b hidden md:block" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <Link to={`/${lang}/`} className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-[var(--accent-color)] rounded-xl rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-xl" />
            <TrendingUpIcon className="relative w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-3xl lg:text-4xl tracking-tighter leading-none" style={{ color: 'var(--text-color)' }}>
              Tuni<span className="text-[var(--accent-color)]">Wave</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2.5 hover:bg-[var(--hover-bg)] rounded-full transition-colors" style={{ color: 'var(--text-color)' }}>
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          <div className="relative" ref={langRef}>
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-1.5 p-2.5 hover:bg-[var(--hover-bg)] rounded-full transition-colors">
              <img src={currentLang.flag} alt={currentLang.fullLabel} className="w-6 h-4 object-cover rounded-sm" />
              <Globe className="w-5 h-5 text-[var(--news-text-secondary)]" />
            </button>
            {isLangOpen && (
              <div className="absolute top-[calc(100%+0.5rem)] right-0 rounded-xl shadow-2xl py-2 min-w-[140px] z-[9999] bg-[var(--card-bg)] border border-[var(--border-color)]">
                {otherLanguages.map(l => (
                  <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[var(--hover-bg)] transition-colors" style={{ color: 'var(--text-color)' }}>
                    <img src={l.flag} alt={l.fullLabel} className="w-5 h-3.5 object-cover rounded-sm" />
                    {l.fullLabel}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to={`/${lang}/profile`} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[var(--hover-bg)] transition-colors">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              : <User className="w-5 h-5" style={{ color: 'var(--text-color)' }} />}
            <span className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{user ? (user.displayName || t('Profile')) : t('Login')}</span>
          </Link>
        </div>
      </div>

      <nav className="border-t" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-12 overflow-x-auto whitespace-nowrap">
          {navItems.map(item => {
            const isActive = !item.isExternal && (
              router.asPath === item.path ||
              router.asPath === item.path + '/' ||
              (item.path !== `/${lang}/` && router.asPath.startsWith(item.path))
            );
            const cls = `text-base font-bold transition-colors h-full flex items-center border-b-[3px] px-1 ${isActive ? 'text-[var(--accent-color)] border-[var(--accent-color)]' : 'border-transparent opacity-80 hover:opacity-100 hover:text-[var(--accent-color)]'}`;
            if (item.isExternal) return <a key={item.path} href={item.path} className={cls} style={{ color: 'var(--text-color)' }}>{item.label}</a>;
            return <Link key={item.path} to={item.path} className={cls} style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-color)' }}>{item.label}</Link>;
          })}
        </div>
      </nav>
    </header>
  );
}
