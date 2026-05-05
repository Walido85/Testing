
import { Link, useAstroNavigate } from '../utils/navigation';
import { Home, Newspaper, TrendingUp, User, Star, Globe, Sun, Moon, Trophy, Tv, Radio, Activity, X, Plane } from 'lucide-react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNav from './BottomNav';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import { useTranslation } from 'react-i18next';
import i18nInstance from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMarketData } from '../hooks/useMarketData';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sportsService } from '../services/sportsService';
import { fetchNewsFromRss } from '../services/newsService';
import { useLanguage } from '../context/LanguageContext';

export default function Layout({ children }: { children?: React.ReactNode }) {
  const navigate = useAstroNavigate();
  const location = typeof window !== 'undefined' ? window.location : { pathname: '', search: '' };
  const { t, i18n } = useTranslation();
  const { lang, switchLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const { tunisiaStocks, globalIndices } = useMarketData();
  const marketData = [...tunisiaStocks, ...globalIndices].slice(0, 15).map(s => ({
    name: s.name,
    value: s.value,
    change: s.change,
    up: parseFloat(s.change || '0') > 0
  }));
  const [trendingNews, setTrendingNews] = useState<string[]>([]);
  const [sportsTicker, setSportsTicker] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchTickerNews = async () => {
      try {
        const news = await fetchNewsFromRss(undefined, i18n.language);
        if (news.length > 0) {
          setTrendingNews(news.map(item => item.title).slice(0, 5));
        } else {
          setTrendingNews([
            t('Welcome to TuniWave'),
            t('Your portal for Tunisian content'),
            t('Stay updated with the latest news'),
            t('Market data and more')
          ]);
        }
      } catch (e) {
        console.error("Error fetching news for ticker", e);
        setTrendingNews([
          t('Welcome to TuniWave'),
          t('Your portal for Tunisian content'),
          t('Stay updated with the latest news'),
          t('Market data and more')
        ]);
      }
    };
    
    fetchTickerNews();
  }, [i18n.language, t]);

  useEffect(() => {
    const fetchSportsTicker = async () => {
      try {
        const leagues = await sportsService.getLeagues();
        if (leagues.length > 0) {
          const firstLeague = leagues[0].name;
          const result = await sportsService.getMatches(firstLeague, 'results');
          if (result && result.matches) {
            const matches = result.matches.slice(0, 5).map((e: any) => 
              `${e.homeTeam || e.home} ${e.score || (e.homeScore ? `${e.homeScore} - ${e.awayScore}` : 'v')} ${e.awayTeam || e.away}`
            );
            setSportsTicker(matches);
          }
        }
      } catch (e) {
        console.error("Error fetching sports ticker", e);
      }
    };
    fetchSportsTicker();
  }, []);

  const languages = [
    { code: 'en', label: 'EN', fullLabel: 'English', flag: 'https://flagcdn.com/us.svg' },
    { code: 'fr', label: 'FR', fullLabel: 'Français', flag: 'https://flagcdn.com/fr.svg' },
    { code: 'ar', label: 'عر', fullLabel: 'العربية', flag: 'https://flagcdn.com/tn.svg' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const otherLanguages = languages.filter(l => l.code !== i18n.language);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

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

  const changeLanguage = (code: string) => {
    const currentPath = location.pathname;
    const pathParts = currentPath.split("/").filter(Boolean);
    
    if (pathParts.includes('en') || pathParts.includes('fr') || pathParts.includes('ar')) {
      pathParts[0] = code;
    } else {
      pathParts.unshift(code);
    }

    // Logic: If we are on a news article page (/:lang/news/:slug)
    // always redirect to the news list for the new language since individual articles aren't translated.
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

  const contentPadding = "px-4 sm:px-6 lg:px-8";

  return (
    <div className={`flex flex-col font-sans min-h-screen`} style={{ color: 'var(--text-color)', background: 'var(--bg-color)' }}>

      {/* Stock Ticker */}
      <div className="border-b h-8 sm:h-12 hidden md:flex items-center overflow-hidden" style={{ background: 'var(--trending-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center px-3 sm:px-4 border-e h-full flex-shrink-0 z-10" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 me-1.5 sm:me-2 text-[var(--accent-color)]" />
          <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-color)' }}>
            <span className="hidden sm:inline">{t('Tunis Stock Exchange')}</span>
            <span className="sm:hidden">{t('Live')}</span>
          </span>
        </div>
        
        <div className="flex-grow overflow-hidden whitespace-nowrap relative">
          <div className="flex gap-8 sm:gap-12 items-center h-full animate-ticker hover:[animation-play-state:paused] px-4">
            <div className="flex gap-8 sm:gap-12 items-center">
              <div className="flex gap-6 sm:gap-8 items-center">
                {marketData.map((stock, idx) => (
                  <div key={`stock-1-${idx}`} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => navigate(`/${lang}/finance`)}>
                    <span className="text-[10px] sm:text-xs font-black" style={{ color: 'var(--text-color)' }}>{stock.name}</span>
                    <span className="text-[11px] sm:text-[13px] font-bold" style={{ color: 'var(--text-color)' }}>
                      {stock.value}
                    </span>
                    {stock.change !== '0.00' && (
                    <span className={`text-[9px] sm:text-[11px] font-black ${stock.up ? 'text-[var(--success-color)]' : 'text-[var(--accent-color)]'}`}>
                      {stock.up ? '▲' : '▼'} {stock.change}%
                    </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="w-px h-4 bg-[var(--hover-bg)] mx-2"></div>
              <div className="flex gap-6 sm:gap-8 items-center">
                {trendingNews.map((news, idx) => (
                  <span 
                    key={`news-1-${idx}`} 
                    className="text-[11px] sm:text-[13px] font-bold cursor-pointer transition-colors uppercase tracking-tight hover:text-[var(--accent-color)]"
                    style={{ color: 'var(--text-color)' }}
                    onClick={() => navigate(`/${lang}/news`)}
                  >
                    {news}
                  </span>
                ))}
              </div>
              {sportsTicker.length > 0 && (
                <>
                  <div className="w-px h-4 bg-[var(--hover-bg)] mx-2"></div>
                  <div className="flex gap-6 sm:gap-8 items-center">
                    {sportsTicker.map((match, idx) => (
                      <span 
                        key={`sports-1-${idx}`} 
                        className="text-[11px] sm:text-[13px] font-bold cursor-pointer transition-colors uppercase tracking-tight hover:text-[var(--accent-color)]"
                        style={{ color: 'var(--text-color)' }}
                        onClick={() => navigate(`/${lang}/sports`)}
                      >
                        {match}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Seamless loop second set */}
            <div className="flex gap-8 sm:gap-12 items-center">
              <div className="flex gap-6 sm:gap-8 items-center">
                {marketData.map((stock, idx) => (
                  <div key={`stock-2-${idx}`} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => navigate(`/${lang}/finance`)}>
                    <span className="text-[10px] sm:text-xs font-black" style={{ color: 'var(--text-color)' }}>{stock.name}</span>
                    <span className="text-[11px] sm:text-[13px] font-bold" style={{ color: 'var(--text-color)' }}>
                      {stock.value}
                    </span>
                    {stock.change !== '0.00' && (
                    <span className={`text-[9px] sm:text-[11px] font-black ${stock.up ? 'text-[var(--success-color)]' : 'text-[var(--accent-color)]'}`}>
                      {stock.up ? '▲' : '▼'} {stock.change}%
                    </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="w-px h-4 bg-[var(--hover-bg)] mx-2"></div>
              <div className="flex gap-6 sm:gap-8 items-center">
                {trendingNews.map((news, idx) => (
                  <span 
                    key={`news-2-${idx}`} 
                    className="text-[11px] sm:text-[13px] font-bold cursor-pointer transition-colors uppercase tracking-tight hover:text-[var(--accent-color)]"
                    style={{ color: 'var(--text-color)' }}
                    onClick={() => navigate(`/${lang}/news`)}
                  >
                    {news}
                  </span>
                ))}
              </div>
              {sportsTicker.length > 0 && (
                <>
                  <div className="w-px h-4 bg-[var(--hover-bg)] mx-2"></div>
                  <div className="flex gap-6 sm:gap-8 items-center">
                    {sportsTicker.map((match, idx) => (
                      <span 
                        key={`sports-2-${idx}`} 
                        className="text-[11px] sm:text-[13px] font-bold cursor-pointer transition-colors uppercase tracking-tight hover:text-[var(--accent-color)]"
                        style={{ color: 'var(--text-color)' }}
                        onClick={() => navigate(`/${lang}/sports`)}
                      >
                        {match}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-[calc(100vh-300px)]" style={{ background: 'var(--bg-color)' }}>
        <div className={`max-w-7xl lg:max-w-[1400px] mx-auto ${contentPadding} py-4 sm:py-6 pb-20 md:pb-8`}>
          {children}
        </div>
      </main>

    </div>
  );
}
