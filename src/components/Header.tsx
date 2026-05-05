import {
  UserCircle,
  ChevronLeft,
  Menu,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";

import { useAstroNavigate } from "../utils/navigation";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useMarketData } from "../hooks/useMarketData";
import { useLanguage } from "../context/LanguageContext";
import { sportsService, parseSportsDate } from "../services/sportsService";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showProfile?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  showLogo?: boolean;
  onMenuToggle?: () => void;
}

export default function Header({
  title,
  showProfile = true,
  showBack = false,
  onBack,
  showLogo = false,
  onMenuToggle,
}: HeaderProps) {
  const navigate = useAstroNavigate();
  const location = typeof window !== 'undefined' ? window.location : { pathname: '', search: '' };
  const { t, i18n } = useTranslation();
  const { lang } = useLanguage();
  const isArabic = i18n.language === "ar";
  const [headerMatches, setHeaderMatches] = useState<any[]>([]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const langRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  const { globalIndices, tunisiaStocks, exchangeRates } = useMarketData();

  useEffect(() => {
    setMounted(true);
  }, []);

  const feedItems = useMemo(() => {
    const items: any[] = [];
    
    // Add Live Matches
    const getMatchTime = (match: any) => {
      if (match.status === "live" || !!match.minute) return match.score || "v";
      if (match.status === "result" || match.time === "FT")
        return match.score || "FT";

      const raw = match.kickoff_utc || match.timestamp_utc;
      if (raw) {
        try {
          const d = parseSportsDate(raw);
          if (d && !isNaN(d.getTime())) {
            const timeZone = (typeof window !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Africa/Tunis';
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false, timeZone });
          }
        } catch (e) {}
      }
      return match.time || "v";
    };

    if (headerMatches && headerMatches.length > 0) {
      headerMatches.slice(0, 10).forEach((m, idx) => {
        const scoreStr = getMatchTime(m);
        const isLive = m.status === "live" || !!m.minute;

        items.push({
          type: "sports",
          id: `sports-${idx}`,
          content: (
            <div className="flex items-center gap-3 cursor-pointer transition-all hover:scale-105" onClick={() => navigate(`/${lang}/sports`)}>
              {isLive && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[var(--accent-color)] rounded-md">
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">{t('Live')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                  <img
                      src={m.home_logo || sportsService.getTeamLogo(m.home) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.home || "T")}&background=random&color=fff&size=64`}
                      alt={m.home}
                      className="w-4 h-4 object-contain"
                  />
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: "var(--text-color)" }}>{m.home}</span>
              </div>
              <span dir="ltr" className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-md ${isLive ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)]" : "bg-[var(--hover-bg)] opacity-80"}`} style={{ color: isLive ? undefined : "var(--text-color)" }}>
                {scoreStr}
              </span>
              <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: "var(--text-color)" }}>{m.away}</span>
                  <img
                      src={m.away_logo || sportsService.getTeamLogo(m.away) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.away || "T")}&background=random&color=fff&size=64`}
                      alt={m.away}
                      className="w-4 h-4 object-contain"
                  />
              </div>
            </div>
          ),
        });
      });
    }

    // Add Market Data
    const marketData = [];
    if (globalIndices.length) marketData.push(...globalIndices.slice(0, 5));
    if (tunisiaStocks.length) marketData.push(...tunisiaStocks.slice(0, 10));
    if (exchangeRates.length) marketData.push(...exchangeRates.slice(0, 5));
    
    marketData.forEach((item, idx) => {
      let name;
      let val;
      let changeStr;
      let isUp;
      
      if ('currency' in item) {
        name = item.currency.substring(0, 3);
        val = item.value;
        changeStr = item.change || '0.00%';
        isUp = parseFloat(item.change || '0') > 0;
      } else if ('acronym' in item) {
        name = item.name;
        val = item.value;
        changeStr = String(item.change || '0.00%');
        isUp = parseFloat(item.change || '0') > 0;
      } else {
        name = item.name || '';
        val = item.value;
        changeStr = String(item.change || '0.00%');
        if (!changeStr.includes('%')) changeStr += '%';
        isUp = parseFloat(item.change || '0') > 0;
      }

      items.push({
        type: "market",
        id: `mkt-${idx}`,
        content: (
          <div dir="ltr" className="flex items-center gap-2 cursor-pointer transition-all hover:scale-105" onClick={() => navigate(`/${lang}/finance`)}>
             <span className="font-bold text-[10px] text-[var(--text-color)] opacity-80 uppercase tracking-widest">{name}</span>
             <span className="font-mono font-bold text-[11px] text-[var(--text-color)]">{val}</span>
             <span className={`font-mono font-bold text-[11px] flex items-center ${isUp ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
                 {isUp ? '↑' : '↓'} {changeStr.replace('-', '')}
             </span>
          </div>
        ),
      });
    });

    return items;
  }, [headerMatches, navigate, lang, t, globalIndices, tunisiaStocks, exchangeRates]);

  const languages = [
    { code: "en", flag: "https://flagcdn.com/us.svg", label: "English" },
    { code: "fr", flag: "https://flagcdn.com/fr.svg", label: "Français" },
    { code: "ar", flag: "https://flagcdn.com/tn.svg", label: "العربية" },
  ];

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    const currentPath = location.pathname;
    const pathParts = currentPath.split("/").filter(Boolean);
    const supportedLangs = ["en", "fr", "ar"];

    if (supportedLangs.includes(pathParts[0])) {
      pathParts[0] = code;
    } else {
      pathParts.unshift(code);
    }

    // If on a news article page (/:lang/news/:slug)
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLangOpen]);

  useEffect(() => {
    // Update document direction when language changes
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    // Fetch live matches or upcoming matches for the ticker
    const fetchHeaderMatches = async () => {
      try {
        let matches: any[] = [];
        try {
          const fetchedLive = await sportsService.getLiveMatches();
          if (fetchedLive?.matches && fetchedLive.matches.length > 0) {
            matches = fetchedLive.matches.map((m: any) => ({
              ...m,
              status: "live",
            }));
          }
        } catch (e) {
          console.warn("Could not fetch live matches", e);
        }
        setHeaderMatches(matches);
      } catch (e) {
        console.warn("Could not handle header matches", e);
      }
    };
    fetchHeaderMatches();
  }, []);

  return (
    <div className="sticky top-0 z-[100] w-full bg-[var(--header-bg)] backdrop-blur-md shadow-sm border-b border-[var(--border-color)]">
      {/* Main Header */}
      <header className="h-16 flex items-center justify-between px-4 relative z-30">
        <div className="flex items-center h-full">
          {showBack ? (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="me-4 transition-colors"
              style={{ color: "var(--text-color)" }}
              aria-label={t("Go back")}
            >
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </button>
          ) : (
            <div
              className="me-4 cursor-pointer flex items-center gap-2 group"
              onClick={() => navigate(`/${lang}/`)}
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-[var(--accent-color)] rounded-lg rotate-12 group-hover:rotate-0 transition-transform duration-300 shadow-lg" />
                <TrendingUp className="relative w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span
                  className="font-black text-xl lg:text-2xl tracking-tighter uppercase"
                  style={{ color: "var(--text-color)" }}
                >
                  Tuni<span className="text-[var(--accent-color)]">Wave</span>
                </span>
                <span
                  className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40"
                  style={{ color: "var(--text-color)" }}
                >
                  {t('Premium Media Hub')}
                </span>
              </div>
            </div>
          )}

          {title && !showLogo && (
            <div
              className="px-4 border-s hidden md:block"
              style={{ borderColor: "var(--border-color)" }}
            >
              <span
                className="font-black text-sm lg:text-[13px] uppercase tracking-wider"
                style={{ color: "var(--accent-color)" }}
              >
                {title}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-[var(--hover-bg)] transition-colors"
            style={{
              color: "var(--text-color)",
            }}
            title={isDarkMode ? t("Light Mode") : t("Dark Mode")}
            aria-label={isDarkMode ? t("Enable Light Mode") : t("Enable Dark Mode")}
          >
            {mounted ? (
              isDarkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              className="flex items-center gap-2 p-2 rounded-full hover:bg-[var(--hover-bg)] transition-colors"
              onClick={() => {
                setIsLangOpen(!isLangOpen);
              }}
              aria-label={t("Select Language")}
            >
              <div className="w-5 h-3.5 bg-[var(--hover-bg)] rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={currentLang.flag}
                  alt={currentLang.label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-widest hidden sm:block"
                style={{ color: "var(--text-color)" }}
              >
                {currentLang.label}
              </span>
            </button>

            {isLangOpen && (
              <div
                className={`absolute top-[max(100%,_2rem)] ${isArabic ? "left-0" : "right-0"} rounded-xl shadow-2xl z-[9999] overflow-hidden min-w-[140px] bg-[var(--card-bg)] border border-[var(--border-color)] animate-in fade-in zoom-in duration-150`}
              >
                {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--hover-bg)] transition-colors text-start`}
                      style={{
                        background:
                          i18n.language === lang.code
                            ? "var(--trending-bg)"
                            : "transparent",
                      }}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <div className="w-6 h-4 bg-[var(--hover-bg)] rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={lang.flag}
                          alt={lang.label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: "var(--text-color)" }}
                      >
                        {lang.label}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {showProfile && (
            <button
              className="hover:opacity-80 transition-opacity flex items-center justify-center"
              style={{ color: "var(--text-color)" }}
              onClick={() => navigate(`/${lang}/profile`)}
              aria-label={t("Profile")}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL || undefined}
                  alt={user.displayName || "Profile"}
                  className="w-6 h-6 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserCircle className="w-6 h-6" />
              )}
            </button>
          )}

          <button
            onClick={() => {
              onMenuToggle();
            }}
            className="transition-colors hover:text-[var(--accent-color)] p-1"
            style={{ color: "var(--text-color)" }}
            aria-label={t("Toggle Menu")}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Trending & Market Bar */}
      <div className="h-10 flex items-center overflow-hidden bg-[var(--trending-bg)]">
        <div className="flex items-center px-4 border-e border-[var(--border-color)] h-full flex-shrink-0 z-10 bg-[var(--header-bg)]">
          <TrendingUp
            className="w-3 h-3 me-2"
            style={{ color: "var(--accent-color)" }}
          />
          <span
            className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: "var(--text-color)" }}
          >
            {t("Live Feed")}
          </span>
        </div>

        <div className="flex-grow overflow-hidden whitespace-nowrap relative">
          <div className={`flex gap-12 items-center h-full ${i18n.language === 'ar' ? 'animate-marquee-rtl' : 'animate-marquee'} hover:[animation-play-state:paused] px-4 w-max`}>
            {feedItems.length > 0 ? (
              <>
                {/* First Set */}
                <div className="flex gap-12 items-center">
                  {feedItems.map((item, idx) => (
                    <div
                      key={`feed-1-${item.id}-${idx}`}
                      className="flex items-center"
                    >
                      {item.content}
                    </div>
                  ))}
                </div>

                {/* Second Set (for seamless loop) */}
                <div className="flex gap-12 items-center">
                  {feedItems.map((item, idx) => (
                    <div
                      key={`feed-2-${item.id}-${idx}`}
                      className="flex items-center"
                    >
                      {item.content}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex gap-12 items-center opacity-50 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-32 bg-[var(--text-color)]/20 rounded"
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
