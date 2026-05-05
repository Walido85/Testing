import React, { useState, useEffect, useMemo, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  Radio as RadioIcon,
  AlertCircle,
  Play,
  Pause,
  Search,
  Heart,
  Sparkles,
  Clock,
  Globe,
  Loader2,
  X,
  Music, Guitar, Headphones, Mic2, Tv, Globe2, BoomBox, RadioReceiver, 
  Disc, Mic, Music4, Flame
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import { usePlayer } from "../context/PlayerContext";

import { useAstroNavigate } from "../utils/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getStationListeners } from "../lib/radioUtils";
import { LiveListenerCount } from "../components/LiveListenerCount";

import { getCountryCode } from "../lib/countryUtils";

export const GENRE_METADATA: Record<string, { icon: React.ElementType }> = {
  "Pop & News": { icon: Headphones },
  "Global News & Talk": { icon: Globe2 },
  "Electronic & Dance": { icon: Disc },
  "Pop": { icon: Flame },
  "Hip Hop": { icon: BoomBox },
  "News": { icon: Tv },
  "Talk": { icon: Mic },
  "Rock": { icon: Guitar },
  "Classical": { icon: Music4 },
  "Jazz": { icon: Music },
  "Sports": { icon: Mic2 },
  "Cultural": { icon: RadioReceiver },
  "Local": { icon: RadioIcon },
  "Stations for You": { icon: Sparkles },
  "Recently Played": { icon: Clock },
};

const getFlagUrl = (countryName: string) => {
  const code = getCountryCode(countryName);
  return `https://flagcdn.com/w160/${code}.png`;
};

interface Station {
  id: string;
  name: string;
  genre: string;
  logo_url: string;
  status: string;
  stream_link: string;
  youtube_link?: string;
  country?: string;
  slug?: string;
}

const Visualizer = () => (
  <div className="flex items-end gap-[2px] h-4">
    {[0.2, 0.4, 0.1, 0.5, 0.3].map((delay, i) => (
      <motion.div
        key={i}
        className="w-[3px] bg-[var(--card-bg)] rounded-full opacity-90"
        animate={{ height: ["3px", "16px", "6px", "14px", "3px"] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      />
    ))}
  </div>
);

const StationCard = ({
  station,
  isActive,
  isPlaying,
  onSelect,
  onQuickPlay,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  station: Station;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: (s: Station) => void;
  onQuickPlay: (e: React.MouseEvent, s: Station) => void;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) => {
  const baseListeners = useMemo(
    () => getStationListeners(station.id),
    [station.id],
  );
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group relative flex flex-col gap-3"
    >
      <div
        className={`relative aspect-square w-full rounded-[24px] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500 cursor-pointer`}
        onClick={() => onSelect(station)}
      >
        <div className={`absolute inset-0 rounded-[24px] pointer-events-none transition-all duration-300 z-50 ${isActive ? "ring-[3px] ring-[var(--accent-color)] ring-inset" : "ring-1 ring-[var(--border-color)] ring-inset"}`} />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-color)]/5 via-transparent to-[var(--text-color)]/5" />

        <div className="absolute top-0 right-0 z-20 flex">
          {station.country && station.country !== "Global" && (
            <div className="bg-[var(--accent-color)] rounded-bl-[16px] px-2.5 py-1.5 shadow-lg flex items-center justify-center">
              <img
                src={getFlagUrl(station.country)}
                alt={station.country}
                className="w-4 h-3 object-cover rounded-[2px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://flagcdn.com/w40/un.png";
                }}
              />
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(station.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md shadow-xl transition-all ${isFavorite ? "bg-[var(--accent-color)] text-white" : "bg-[var(--card-bg)]/40 text-[var(--text-color)] hover:bg-[var(--accent-color)] hover:scale-110"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-[1.05] transition-transform duration-700">
          {station.logo_url ? (
            <img
              src={station.logo_url}
              alt={station.name}
              className={`w-full h-full object-cover ${isActive && isPlaying ? "animate-pulse" : ""}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--accent-color)] font-black text-6xl uppercase opacity-20">
              {station.name.charAt(0)}
            </div>
          )}
        </div>

        <div
          className={`absolute inset-0 bg-[var(--card-bg)]/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          onClick={(e) => onQuickPlay(e, station)}
        >
          <div
            className={`w-16 h-16 rounded-full bg-[var(--card-bg)]/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-[var(--border-color)] transform transition-all duration-500 ${isActive ? "scale-100" : "scale-90 group-hover:scale-100 hover:scale-110 hover:bg-[var(--accent-color)] hover:border-[var(--accent-color)] group/playbtn"}`}
          >
            {isActive && isPlaying ? (
              <Pause className="w-6 h-6 text-[var(--text-color)] group-hover/playbtn:text-[var(--text-color)] fill-current" />
            ) : (
              <Play className="w-6 h-6 text-[var(--text-color)] group-hover/playbtn:text-[var(--text-color)] fill-current ml-1" />
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 z-10 pointer-events-none" />

        {isActive && isPlaying && (
          <div className="absolute top-3 left-3 bg-[var(--card-bg)]/40 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl z-20">
            <Visualizer />
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[14px] truncate leading-tight text-[var(--text-color)] drop-shadow-md shrink-0 max-w-[65%]">
              {station.name}
            </h3>
            <span className="w-1 h-1 rounded-full bg-[var(--card-bg)]/40 shrink-0 shadow-sm" />
            <p className="text-[12px] font-medium text-[var(--text-color)] opacity-80 truncate drop-shadow-md min-w-0">
              {t(station.genre)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 opacity-90">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
            <span className="text-[11px] font-medium text-[var(--text-color)] opacity-80 drop-shadow-md">Live:</span>
            <LiveListenerCount
              stationId={station.id}
              baseCount={baseListeners}
              className="!bg-transparent !border-0 !p-0 !gap-0 text-[11px] font-medium text-[var(--text-color)] opacity-80 drop-shadow-md"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?auto=format&fit=crop&w=1920&q=80"
];

export default function RadioPortal({ initialData }: { initialData?: Station[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useAstroNavigate();
  const isArabic = i18n.language === "ar";
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const setSearchParams = (params: URLSearchParams) => {
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newUrl);
  };
  const urlStationId = searchParams.get("station");

  const {
    playRadio,
    currentStream,
    isPlaying,
    favorites = [],
    toggleFavorite,
    recentlyPlayed = [],
  } = usePlayer();

  const [stations, setStations] = useState<Station[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(
    searchParams.get("genre"),
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    searchParams.get("country"),
  );
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams);
    if (!val) params.delete("q");
    else params.set("q", val);
    setSearchParams(params);
  };

  const handleStationSelect = (station: Station) => {
    navigate(`/${lang}/radio/${station.slug || station.id}`);
  };

  const handleQuickPlay = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation();
    const info: Station = {
      id: station.id,
      name: station.name,
      genre: station.genre,
      logo_url: station.logo_url || "",
      stream_link: station.stream_link,
      status: station.status,
    };
    playRadio(station.stream_link, info);
  };

  const handleGenreSelect = (genre: string | null) => {
    setSelectedGenre(genre);
    const params = new URLSearchParams(searchParams);
    if (!genre) params.delete("genre");
    else params.set("genre", genre);
    setSearchParams(params);
    setTimeout(() => {
      const targetId = !genre ? null : `category-${genre.replace(/\s+/g, "-")}`;
      const el = targetId
        ? document.getElementById(targetId)
        : resultsRef.current;
      if (el) {
        const yOffset = -140;
        const top =
          el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 100);
  };

  const handleCountrySelect = (country: string | null) => {
    setSelectedCountry(country);
    const params = new URLSearchParams(searchParams);
    if (!country) params.delete("country");
    else params.set("country", country);
    setSearchParams(params);
    setTimeout(() => {
      if (resultsRef.current) {
        const yOffset = -140;
        const top =
          resultsRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 100);
  };

  const handleSurpriseMe = () => {
    if (stations.length === 0) return;
    const randomStation = stations[Math.floor(Math.random() * stations.length)];
    handleStationSelect(randomStation);
  };

  // Auto-play from URL on initial load only
  const hasAutoPlayed = useRef(false);
  useEffect(() => {
    if (
      !loading &&
      stations.length > 0 &&
      urlStationId &&
      !hasAutoPlayed.current
    ) {
      const station = stations.find(
        (s) =>
          s.id === urlStationId ||
          s.name.toLowerCase() === urlStationId.toLowerCase(),
      );
      if (station && currentStream !== station.stream_link) {
        handleStationSelect(station);
      }
      hasAutoPlayed.current = true;
    }
  }, [loading, stations, urlStationId]);

  useEffect(() => {
    let isMounted = true;
    async function loadStations() {
      try {
        const cachedStationsStr = sessionStorage.getItem('tuniwave_all_stations');
        let shouldFetch = true;
        
        if (cachedStationsStr) {
          const cachedSt = JSON.parse(cachedStationsStr);
          if (cachedSt.timestamp && Date.now() - cachedSt.timestamp < 30 * 60 * 1000) {
            if (isMounted) {
              setStations(cachedSt.data);
              setLoading(false);
            }
            shouldFetch = false;
          }
        }
        
        if (shouldFetch) {
          const q = query(
            collection(db, "stations"),
            where("status", "==", "active"),
          );
          const snapshot = await getDocs(q);
          const stationData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Station,
          );
          if (isMounted) {
            setStations(stationData);
            setLoading(false);
          }
          sessionStorage.setItem('tuniwave_all_stations', JSON.stringify({ data: stationData, timestamp: Date.now() }));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Firestore Error:", err);
          setError(t("Failed to load stations"));
          setLoading(false);
        }
      }
    }
    loadStations();
    return () => { isMounted = false; };
  }, []); // Remove `t` to prevent double listener from i18n re-rendering

  const genres = useMemo(() => {
    if (!stations) return [];
    const allGenres = stations.map((s) => s.genre);
    return Array.from(new Set(allGenres)).filter(Boolean).sort();
  }, [stations]);

  const countries = useMemo(() => {
    if (!stations) return [];
    const allCountries = stations.map((s) => s.country);
    return Array.from(new Set(allCountries)).filter(Boolean).sort();
  }, [stations]);

  const favoriteStations = useMemo(() => {
    return stations.filter((s) => favorites?.includes(s.id));
  }, [stations, favorites]);

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (!s.stream_link) return false;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = !selectedCountry || s.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [stations, searchQuery, selectedCountry]);

  const groupedStations = useMemo(() => {
    const groups: Record<string, Station[]> = {};

    if (favoriteStations.length > 0)
      groups["Stations for You"] = favoriteStations;

    if (Array.isArray(recentlyPlayed)) {
      const recentStations = recentlyPlayed
        .map((info) => stations.find((s) => s.id === info.id))
        .filter((s): s is Station => !!s);
      if (recentStations.length > 0) groups["Recently Played"] = recentStations;
    }

    filteredStations.forEach((s) => {
      if (!groups[s.genre]) groups[s.genre] = [];
      groups[s.genre].push(s);
    });
    return groups;
  }, [filteredStations, stations, favoriteStations, recentlyPlayed]);

  const [heroIndex, setHeroIndex] = useState(0);
  const heroStations = useMemo(() => stations.slice(0, 5), [stations]);

  useEffect(() => {
    if (heroStations.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroStations.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroStations]);

  const featuredStation = heroStations[heroIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[var(--accent-color)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <AlertCircle className="w-12 h-12 text-[var(--accent-color)]" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col pb-4 -mx-4 sm:-mx-8 -mt-8 bg-transparent ${isArabic ? "rtl" : "ltr"}`}
    >
      <SEO
        title={
          selectedGenre
            ? `${t(selectedGenre)} Radio - ${t("Tunisian Radio Portal")}`
            : t("Tunisian Radio Portal - Live Streaming")
        }
        description={
          selectedGenre
            ? t(
                "Listen to the best {{genre}} radio stations from Tunisia live.",
                { genre: t(selectedGenre) },
              )
            : t(
                "Listen to all your favorite Tunisian radio stations in one place.",
              )
        }
        canonical={`https://tuniwave.com/${lang}/radio${selectedGenre ? `?genre=${selectedGenre}` : ""}`}
      />

      <section className="relative h-[400px] w-full overflow-hidden sm:rounded-b-[40px] shadow-2xl">
        <AnimatePresence mode="wait">
          {featuredStation && (
            <motion.div
              key={featuredStation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[4000ms] scale-105 hover:scale-100"
                style={{ backgroundImage: `url(${BACKGROUND_IMAGES[heroIndex % BACKGROUND_IMAGES.length]})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-black/20 z-10" />

              <div className="absolute inset-0 px-6 sm:px-12 pb-12 flex flex-col justify-end gap-4 max-w-5xl mx-auto">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <span className="px-3 py-1 rounded-full bg-[var(--accent-color)] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--card-bg)] animate-pulse" />
                    {t("Featured Station")}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[var(--card-bg)]/10 backdrop-blur-xl text-[11px] font-bold tracking-wide text-[var(--text-color)] border border-[var(--border-color)]">
                    {t(featuredStation.genre)}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic text-white drop-shadow-2xl"
                >
                  {featuredStation.name}
                </motion.h2>

                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={() => handleStationSelect(featuredStation)}
                    className="px-10 py-5 bg-[var(--accent-color)] text-white rounded-full font-black uppercase italic tracking-widest flex items-center gap-3 hover:scale-110 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)] transition-all shadow-2xl"
                  >
                    {currentStream === featuredStation.stream_link &&
                    isPlaying ? (
                      <>
                        <Pause className="w-6 h-6 fill-current" /> {t("Pause")}
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 fill-current" />{" "}
                        {t("Listen Now")}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSurpriseMe}
                    className="w-16 h-16 bg-[var(--card-bg)]/10 backdrop-blur-3xl rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] hover:text-[var(--text-color)] transition-all hover:scale-110 group/magic border border-[var(--border-color)]"
                  >
                    <Sparkles className="w-7 h-7 group-hover/magic:rotate-12 transition-transform text-[var(--text-color)]" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 right-6 sm:right-12 z-30 flex gap-2">
          {heroStations.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${heroIndex === i ? "w-8 bg-[var(--accent-color)]" : "w-2 bg-[var(--card-bg)]/20"}`}
            />
          ))}
        </div>
      </section>

      <div
        className={`relative z-40 py-4 px-4 sm:px-8 transition-all duration-300 backdrop-blur-xl ${isSearchFocused ? "bg-[var(--card-bg)]/90 shadow-lg" : "bg-[var(--card-bg)]/90"}`}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="relative flex-1 w-full group flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity text-[var(--accent-color)]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("Search stations...")}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-[var(--card-bg)]/5 backdrop-blur-2xl rounded-2xl border-2 border-[var(--border-color)] focus:border-[var(--accent-color)] focus:bg-[var(--card-bg)]/10 focus:ring-8 focus:ring-[var(--accent-color)]/5 transition-all font-bold text-[16px] outline-none shadow-sm text-[var(--text-color)]"
              />
              {searchQuery.length > 0 && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--card-bg)]/10 rounded-full transition-all text-[var(--text-color)]/40 hover:text-[var(--text-color)]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {(isSearchFocused || searchQuery.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-[var(--card-bg)] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-[var(--border-color)] overflow-hidden z-[100] flex flex-col max-h-[450px]"
                >
                  <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between relative bg-[var(--card-bg)] z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 text-[var(--text-color)]">
                      {t("Instant Results")}
                    </span>
                    <span className="text-[10px] font-black text-[var(--accent-color)] uppercase">
                      {filteredStations.length} {t("Found")}
                    </span>
                  </div>
                  <div className="overflow-y-auto p-2 hide-scrollbar flex-1">
                    {filteredStations.length > 0 ? (
                      filteredStations.slice(0, 20).map((station) => (
                        <button
                          key={station.id}
                          onClick={() => handleStationSelect(station)}
                          className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--accent-color)] group/item transition-all text-start"
                        >
                          <div className="w-12 h-12 rounded-xl bg-[var(--card-bg)] p-1.5 shrink-0 shadow-lg group-hover/item:scale-110 transition-transform">
                            <img
                              src={
                                station.logo_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name || "R")}&background=random&color=fff&size=64`
                              }
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name || "R")}&background=random&color=fff&size=64`;
                              }}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm uppercase italic truncate group-hover/item:text-[var(--text-color)] text-[var(--text-color)]">
                              {station.name}
                            </h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover/item:text-[var(--text-color)] opacity-80 text-[var(--text-color)]">
                              {t(station.genre)} •{" "}
                              {t(station.country || "Global")}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[var(--card-bg)]/10 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-10 text-center flex flex-col items-center gap-3">
                        <Search className="w-8 h-8 opacity-10 text-[var(--text-color)]" />
                        <span className="text-xs font-bold opacity-40 text-[var(--text-color)]">
                          {t("No stations found")}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isSearchFocused && (
            <div className="flex flex-col gap-4 w-full overflow-hidden">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 px-1">
                <button
                  onClick={() => handleGenreSelect(null)}
                  className={`px-4 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    !selectedGenre
                      ? "bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30"
                      : "bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] hover:bg-[var(--hover-bg)]"
                  }`}
                >
                  {t("All Genres")}
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`px-4 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedGenre === genre
                        ? "bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30"
                        : "bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    {t(genre)}
                  </button>
                ))}
              </div>

              {/* Premium Country Flags Row */}
              {countries.length > 0 && (
                <div className="flex items-center gap-5 overflow-x-auto hide-scrollbar pb-4 px-2 border-t border-[var(--border-color)] pt-4 mt-1">
                  <button
                    onClick={() => handleCountrySelect(null)}
                    className={`group flex flex-col items-center gap-2 shrink-0 transition-all ${!selectedCountry ? "scale-110" : "opacity-70 hover:opacity-100"}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-xl ${
                        !selectedCountry
                          ? "bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color)] border-white shadow-[var(--accent-color)]/40"
                          : "bg-[var(--card-bg)]/10 border-transparent"
                      }`}
                    >
                      <Globe
                        className={`w-5 h-5 ${!selectedCountry ? "text-[var(--text-color)]" : "text-[var(--text-color)] opacity-50"}`}
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-50 group-hover:text-[var(--text-color)]">
                      {t("Global")}
                    </span>
                  </button>

                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className={`group flex flex-col items-center gap-2 shrink-0 transition-all ${selectedCountry === country ? "scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all shadow-2xl relative ${
                          selectedCountry === country
                            ? "border-[var(--accent-color)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={getFlagUrl(country)}
                          alt={country}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://flagcdn.com/w160/un.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-70 group-hover:text-[var(--text-color)]">
                        {t(country)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div ref={resultsRef} className="space-y-12 mt-8 w-full">
        {Object.entries(groupedStations).map(([genre, genreStations]) => (
          <motion.section
            key={genre}
            id={`category-${genre.replace(/\s+/g, "-")}`}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between px-6 sm:px-12 gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-[var(--text-color)]">
                  {React.createElement(GENRE_METADATA[genre]?.icon || RadioReceiver, {
                    className: `w-6 h-6 ${genre === "Stations for You" ? "text-[var(--accent-color)]" : "text-[var(--text-color)] opacity-60"}`,
                  })}
                  {t(genre)}
                </h3>
              </div>
              {genreStations.length > 5 && (
                <button className="text-[11px] font-black uppercase tracking-widest text-[var(--accent-color)] hover:underline opacity-80 transition-opacity mb-1 shrink-0">
                  {t("See All")}
                </button>
              )}
            </div>

            <div className="relative group/row">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth pb-8 px-4 sm:px-8">
                {genreStations.map((station, index) => (
                  <div
                    key={`${genre}-${station.id}`}
                    className="flex-shrink-0 w-[160px] sm:w-[200px] lg:w-[220px] snap-start"
                  >
                    <StationCard
                      station={station}
                      isActive={currentStream === station.stream_link}
                      isPlaying={isPlaying}
                      onSelect={handleStationSelect}
                      onQuickPlay={handleQuickPlay}
                      index={index}
                      isFavorite={favorites.includes(station.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ))}
      </div>

      {!loading && filteredStations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40">
          <RadioIcon className="w-16 h-16" />
          <p className="text-lg font-semibold">{t("No stations found")}</p>
        </div>
      )}
    </div>
  );
}
