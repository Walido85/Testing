
import React, { useState, useEffect, useRef } from 'react';
import ReactProviders from './ReactProviders';
import Header from './Header';
import BottomNav from './BottomNav';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, Newspaper, TrendingUp, Trophy, Tv, Radio, Plane, Moon, Star, User, TrendingUp as TrendingUpIcon, Sun, Globe } from 'lucide-react';
import { Link, useAstroNavigate } from '../utils/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { useIsClient } from '../hooks/useIsClient';

function NavigationContent({ url }: { url?: string }) {
  const isClient = useIsClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useAstroNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const initialLocation = { pathname: url || '', search: '' };
  const [clientLocation, setClientLocation] = useState<{ pathname: string, search: string }>(initialLocation);
  
  useEffect(() => {
    setClientLocation({ pathname: window.location.pathname, search: window.location.search });
    const handleUrlChange = () => {
      setClientLocation({ pathname: window.location.pathname, search: window.location.search });
    };
    
    document.addEventListener('astro:page-load', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      document.removeEventListener('astro:page-load', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: 'en', label: 'EN', fullLabel: 'English', flag: 'https://flagcdn.com/us.svg' },
    { code: 'fr', label: 'FR', fullLabel: 'Français', flag: 'https://flagcdn.com/fr.svg' },
    { code: 'ar', label: 'عر', fullLabel: 'العربية', flag: 'https://flagcdn.com/tn.svg' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const otherLanguages = languages.filter(l => l.code !== i18n.language);

  const changeLanguage = (code: string) => {
    const location = clientLocation;
    const currentPath = location.pathname;
    const pathParts = currentPath.split("/").filter(Boolean);

    if (pathParts.includes('en') || pathParts.includes('fr') || pathParts.includes('ar')) {
      pathParts[0] = code;
    } else {
      pathParts.unshift(code);
    }

    if (pathParts[1] === "news" && pathParts.length > 2) {
      navigate(`/${code}/news`);
      setIsLangOpen(false);
      return;
    }

    const newPath = "/" + pathParts.join("/") + location.search;
    navigate(newPath);
    setIsLangOpen(false);
  };

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
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    if (isLangOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden sticky top-0 z-[100]">
        <Header showLogo onMenuToggle={() => setIsMenuOpen(true)} />
      </div>

      {/* ===== DESKTOP HEADER ===== */}
      <header className="sticky top-0 z-[100] border-b hidden md:block" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Link to={`/${lang}/`} className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[var(--accent-color)] rounded-xl rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-xl" />
                <TrendingUpIcon className="relative w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-3xl lg:text-4xl tracking-tighter leading-none" style={{ color: 'var(--text-color)' }}>
                  Tuni<span className="text-[var(--accent-color)]">Wave</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-30 mt-1" style={{ color: 'var(--text-color)' }}>
                  {t('Premium Media Hub')}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 hover:bg-[var(--hover-bg)] rounded-full transition-colors"
              style={{ color: 'var(--text-color)' }}
              title={isDarkMode ? t('Light Mode') : t('Dark Mode')}
            >
              {mounted ? (isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />) : <div className="w-6 h-6" />}
            </button>

            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                }}
                className="flex items-center gap-1.5 p-2.5 hover:bg-[var(--hover-bg)] rounded-full transition-colors"
              >
                <div className="w-6 h-4 bg-[var(--hover-bg)] rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img loading="lazy"
                    src={currentLang.flag}
                    alt={currentLang.fullLabel}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <Globe className="w-5 h-5 text-[var(--news-text-secondary)]" />
              </button>

              {isLangOpen && (
                <div className={`absolute top-[max(100%,_2rem)] rounded-xl shadow-2xl py-2 min-w-[140px] z-[9999] bg-[var(--card-bg)] border border-[var(--border-color)] animate-in fade-in zoom-in duration-150 ${i18n.language === 'ar' ? 'left-0' : 'right-0'}`}>
                  {otherLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[var(--hover-bg)] transition-colors"
                      style={{ color: 'var(--text-color)' }}
                    >
                      <div className="w-5 h-3.5 bg-[var(--hover-bg)] rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                        <img loading="lazy"
                          src={lang.flag}
                          alt={lang.fullLabel}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span>{lang.fullLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to={`/${lang}/profile`} className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-[var(--hover-bg)] transition-colors">
              {user?.photoURL ? (
                <img loading="lazy" src={user.photoURL || undefined} alt={user.displayName || 'Profile'} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-5 h-5" style={{ color: 'var(--text-color)' }} />
              )}
              <span className="text-sm lg:text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>
                {user ? (user.displayName || t('Profile')) : t('Login')}
              </span>
            </Link>
          </div>
        </div>

        <nav className="border-t" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 lg:gap-10 h-12 overflow-x-auto hide-scrollbar whitespace-nowrap border-b border-[var(--accent-color)]/40">
            {navItems.map((item: any) => {
              const location = clientLocation;
              const isHomePath = item.path === `/${lang}` || item.path === `/${lang}/`;
              const isActive = isClient && !item.isExternal && (
                location.pathname === item.path ||
                location.pathname === item.path + '/' ||
                (!isHomePath && location.pathname.startsWith(item.path))
              );

              const className = `text-base font-bold transition-colors h-full flex items-center border-b-[3px] px-1 ${isActive
                  ? 'text-[var(--accent-color)] border-[var(--accent-color)]'
                  : 'border-transparent hover:text-[var(--accent-color)] focus:text-[var(--accent-color)] opacity-80 hover:opacity-100 focus:opacity-100'
                }`;

              const style = {
                color: isActive ? 'var(--accent-color)' : 'var(--text-color)'
              };

              if (item.isExternal) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={className}
                    style={style}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={className}
                  style={style}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ===== PREMIUM MENU DRAWER ===== */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 w-[80%] max-w-[320px] z-[101] flex flex-col shadow-2xl ${i18n.language === 'ar' ? 'right-0' : 'left-0'}`}
              style={{ background: 'var(--header-bg)' }}
            >
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2 group" onClick={() => { navigate(`/${lang}`); setIsMenuOpen(false); }}>
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[var(--accent-color)] rounded-lg rotate-12 shadow-lg" />
                    <TrendingUpIcon className="relative w-6 h-6 text-white" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter uppercase" style={{ color: 'var(--text-color)' }}>
                    Tuni<span className="text-[var(--accent-color)]">Wave</span>
                  </span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors">
                  <X className="w-6 h-6" style={{ color: 'var(--text-color)' }} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map((item: any) => {
                  const location = clientLocation;
                  const isHomePath = item.path === `/${lang}` || item.path === `/${lang}/`;
                  const isActive = isClient && !item.isExternal && (
                    location.pathname === item.path ||
                    location.pathname === item.path + '/' ||
                    (!isHomePath && location.pathname.startsWith(item.path))
                  );

                  const content = (
                    <>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} style={{ color: isActive ? 'white' : 'var(--accent-color)' }} />
                      <span className="font-bold text-sm uppercase tracking-wider">{item.label}</span>
                    </>
                  );

                  const className = `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive
                      ? 'bg-[var(--accent-color)] text-white shadow-lg'
                      : 'hover:bg-[var(--hover-bg)]'
                    }`;

                  const style = {
                    color: isActive ? 'white' : 'var(--text-color)'
                  };

                  if (item.isExternal) {
                    return (
                      <a
                        key={item.path}
                        href={item.path}
                        className={className}
                        style={style}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={className}
                      style={style}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>

              <div className="p-6 border-t space-y-4" style={{ borderColor: 'var(--border-color)' }}>
                <Link
                  to={`/${lang}/profile`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:bg-[var(--hover-bg)] transition-colors"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                >
                  {user?.photoURL ? (
                    <img loading="lazy" src={user.photoURL || undefined} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-8 h-8 p-1.5 bg-[var(--hover-bg)] rounded-full" />
                  )}
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

      <BottomNav location={clientLocation} />
      <Footer />
      <CookieConsent />
    </>
  );
}

export default function NavigationIsland({ lang, url, params }: { lang?: string, url?: string, params?: any }) {
  return (
    <ReactProviders url={url} lang={params?.lang || lang}>
      <NavigationContent url={url} />
    </ReactProviders>
  );
}
