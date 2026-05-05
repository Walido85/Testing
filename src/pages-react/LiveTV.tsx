import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  Tv,
  Play,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
  Info,
  Heart,
  Share2,
  Search,
  TrendingUp,
  Globe,
  ShieldCheck,
  Trophy,
  Newspaper,
  Clapperboard,
  Music,
  BookOpen,
  Gamepad2,
  Star,
  Radio,
  Sparkles,
  LayoutGrid
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import { usePlayer } from "../context/PlayerContext";

import { useAstroNavigate } from "../utils/navigation";

interface Channel {
  id: string;
  name: string;
  genre: string;
  logo_url: string;
  status: string;
  stream_link: string;
  youtube_link: string;
  use_proxy?: boolean;
  stream_url?: string;
  country?: string;
  description?: string;
  quality?: "HD" | "FHD" | "4K";
  language?: string;
}

const SHAHID_RED = "var(--accent-color)";

import { getCountryCode } from "../lib/countryUtils";

const getFlagUrl = (countryName: string) => {
  const code = getCountryCode(countryName);
  return `https://flagcdn.com/w80/${code}.png`;
};

const CountryFlag = ({
  country,
  className = "w-4 h-4",
}: {
  country: string;
  className?: string;
}) => {
  if (!country) return null;
  return (
    <img
      src={getFlagUrl(country)}
      alt={country}
      className={`${className} object-contain`}
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
};

// Helper to format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

// Enhanced viewer algorithm with time-of-day curve
const getBaseViewerCount = (id: string, genre: string) => {
  const hour = new Date().getHours();
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Base ranges by genre
  let min = 5000,
    max = 20000;
  const g = (genre || "GENERAL").toUpperCase();
  if (g.includes("NEWS")) {
    min = 40000;
    max = 150000;
  } else if (g.includes("SPORT")) {
    min = 30000;
    max = 200000;
  } else if (g.includes("MOVIE") || g.includes("FILM")) {
    min = 15000;
    max = 70000;
  } else if (g.includes("KID") || g.includes("CHILD")) {
    min = 10000;
    max = 40000;
  }

  // Time multiplier: Prime time (19-23) is 1.5x, Late night (2-5) is 0.2x
  let timeMult = 1.0;
  if (hour >= 19 && hour <= 23) timeMult = 1.5 + Math.sin(hour) * 0.2;
  else if (hour >= 2 && hour <= 5) timeMult = 0.2 + Math.random() * 0.1;
  else if (hour >= 6 && hour <= 9) timeMult = 0.6; // Morning

  const base = min + (hash % (max - min));
  return Math.floor(base * timeMult);
};



const HeroVideo = ({
  channel,
  isActive,
  getPlayerUrl,
  getPlayerType,
}: {
  channel: Channel;
  isActive: boolean;
  getPlayerUrl: (c: Channel) => string;
  getPlayerType: (url: string) => string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const rawUrl = getPlayerUrl(channel);
    const type = getPlayerType(rawUrl);

    if (type === "hls") {
      const loadHls = async () => {
        try {
          const HlsModule = await import('hls.js');
          const Hls: any = HlsModule.default || HlsModule;
          
          if (Hls && Hls.isSupported()) {
            if (hlsRef.current) hlsRef.current.destroy();

            const initHls = (useProxy: boolean) => {
              const streamUrl = useProxy
                ? `https://good.tuniwave.workers.dev/proxy?url=${encodeURIComponent(rawUrl)}`
                : rawUrl;

              const hls = new Hls({
                xhrSetup: (xhr: any) => {
                  xhr.withCredentials = false;
                },
                lowLatencyMode: true,
              });

              hls.loadSource(streamUrl);
              hls.attachMedia(videoRef.current!);
              hlsRef.current = hls;

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current?.play().catch(() => {});
              });

              hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
                if (data.fatal && useProxy) {
                  hls.destroy();
                  initHls(false);
                }
              });
            };
            initHls(!!channel.use_proxy);
          }
        } catch (error) {
          console.error("Failed to load hls.js dynamically in hero", error);
        }
      };
      loadHls();
    } else if (type === "native" && videoRef.current) {
      videoRef.current.src = rawUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isActive, channel, getPlayerUrl, getPlayerType]);

  const fallbackImg = channel.logo_url;

  if (getPlayerType(getPlayerUrl(channel)) === "youtube") {
    const videoId = getPlayerUrl(channel).split("v=")[1]?.split("&")[0];
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black">
        <img
          src={fallbackImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110"
        />
        <div className="absolute inset-0 z-10 bg-black/40" />
        {videoId && (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&enablejsapi=1`}
            className="absolute inset-0 w-full h-full object-contain z-10 opacity-80"
            allow="autoplay"
          />
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <img
        src={fallbackImg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 blur-sm transition-transform duration-[20s] ease-linear group-hover:scale-110"
      />
      <div className="absolute inset-0 z-10 bg-black/40" />
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className="w-full h-full object-cover relative z-10 opacity-70 transition-transform duration-[20s] ease-linear group-hover:scale-105"
      />
    </div>
  );
};

const cleanName = (name: string) => {
  return (name || "")
    .replace(/\[.*?\]/g, "") // Strip everything inside [...]
    .replace(/\(.*?\)/g, "") // Strip everything inside (...)
    .trim();
};

const getInitials = (name: string) => {
  return cleanName(name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};


export const getGenreConfig = (genre: string) => {
  const g = (genre || "").toLowerCase();
  if (g.includes("sport") || g.includes("football") || g.includes("رياضة")) return { icon: Trophy, color: "#10b981" }; // Emerald
  if (g.includes("news") || g.includes("info") || g.includes("أخبار")) return { icon: Newspaper, color: "#3b82f6" }; // Blue
  if (g.includes("movie") || g.includes("film") || g.includes("cinema") || g.includes("أفلام")) return { icon: Clapperboard, color: "#a855f7" }; // Purple
  if (g.includes("music") || g.includes("audio") || g.includes("موسيقى")) return { icon: Music, color: "#ec4899" }; // Pink
  if (g.includes("documentary") || g.includes("education") || g.includes("وثائقي")) return { icon: BookOpen, color: "#eab308" }; // Yellow
  if (g.includes("kid") || g.includes("child") || g.includes("cartoon") || g.includes("أطفال")) return { icon: Gamepad2, color: "#f97316" }; // Orange
  if (g.includes("religious") || g.includes("islam") || g.includes("christian") || g.includes("دين")) return { icon: Star, color: "#14b8a6" }; // Teal
  if (g.includes("entertainment") || g.includes("variety") || g.includes("ترفيه")) return { icon: Sparkles, color: "#f43f5e" }; // Rose
  if (g.includes("radio") || g.includes("راديو")) return { icon: Radio, color: "#8b5cf6" }; // Violet
  return { icon: Tv, color: "#6366f1" }; // Indigo
};

export default function LiveTV() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const isArabic = i18n.language === "ar";
  const { closePlayer } = usePlayer();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const setSearchParams = (params: URLSearchParams) => {
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newUrl);
  };
  const navigate = useAstroNavigate();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [isDiscoverExpanded, setIsDiscoverExpanded] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoChannel, setInfoChannel] = useState<Channel | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<string[]>([]);
  const [viewAllGenre, setViewAllGenre] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [viewers, setViewers] = useState<
    Record<
      string,
      { current: number; trend: "up" | "down" | "stable"; trending: boolean }
    >
  >({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    searchParams.get("country"),
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  // Normalize YouTube URLs
  const normalizeYoutubeUrl = useCallback((url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    try {
      if (trimmed.includes("youtube.com/live/")) {
        const videoId = trimmed.split("youtube.com/live/")[1]?.split(/[?#]/)[0];
        return videoId ? `https://www.youtube.com/watch?v=${videoId}` : trimmed;
      }
      if (trimmed.includes("youtu.be/")) {
        const videoId = trimmed.split("youtu.be/")[1]?.split(/[?#]/)[0];
        return videoId ? `https://www.youtube.com/watch?v=${videoId}` : trimmed;
      }
    } catch (e) {
      console.warn("URL normalization failed", e);
    }
    return trimmed;
  }, []);

  const getPlayerUrl = useCallback(
    (channel: Channel) => {
      if (channel.youtube_link?.trim())
        return normalizeYoutubeUrl(channel.youtube_link);
      const stream = channel.stream_link?.trim() || "";
      if (stream.includes("youtube.com") || stream.includes("youtu.be"))
        return normalizeYoutubeUrl(stream);
      return stream;
    },
    [normalizeYoutubeUrl],
  );

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return undefined;
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("youtube.com/live/")) {
      videoId = url.split("youtube.com/live/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("youtube.com/embed/")) {
      return url;
    }
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&enablejsapi=1`
      : url;
  };

  const getPlayerType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    if (url.toLowerCase().endsWith(".m3u8") || url.includes(".m3u8"))
      return "hls";
    return "native";
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsPlayerOpen(true);
    setPlayerError(null);
    setIsBuffering(true);
    setIsSearchFocused(false);
    const params = new URLSearchParams(searchParams);
    params.set("channel", channel.id);
    setSearchParams(params);

    // Add to recently watched
    setRecentlyWatched((prev) => {
      const filtered = prev.filter((id) => id !== channel.id);
      return [channel.id, ...filtered].slice(0, 10);
    });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams);
    if (!val) params.delete("q");
    else params.set("q", val);
    setSearchParams(params);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    const params = new URLSearchParams(searchParams);
    if (filter === "All") params.delete("genre");
    else params.set("genre", filter);
    setSearchParams(params);
    setTimeout(() => {
      const targetId =
        filter === "All" ? null : `category-${filter.replace(/\s+/g, "-")}`;
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
    // Since we don't group by country explicitly (unless we apply the filter), let's scroll to top of list for countries,
    // or if we add country as a group, scroll there.
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

  // Load LocalStorage Data
  useEffect(() => {
    const savedFavs = localStorage.getItem("tv_favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedRecent = localStorage.getItem("tv_recently_watched");
    if (savedRecent) setRecentlyWatched(JSON.parse(savedRecent));
  }, []);

  // Save Favorites & Recently Watched
  useEffect(() => {
    localStorage.setItem("tv_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "tv_recently_watched",
      JSON.stringify(recentlyWatched),
    );
  }, [recentlyWatched]);

  // Update Viewers with Trending logic
  useEffect(() => {
    if (channels.length === 0) return;
    const update = () => {
      setViewers((prev) => {
        const next: Record<
          string,
          {
            current: number;
            trend: "up" | "down" | "stable";
            trending: boolean;
          }
        > = { ...prev };

        // Find top threshold for "Trending"
        const sorted = [...channels]
          .map((c) => getBaseViewerCount(c.id, c.genre))
          .sort((a, b) => b - a);
        const trendingThreshold =
          sorted[Math.floor(channels.length * 0.15)] || 100000;

        channels.forEach((c) => {
          const base = getBaseViewerCount(c.id, c.genre);
          const prevData = prev[c.id];
          const currentBase = prevData ? prevData.current : base;

          const fluctuationPercent = (Math.random() * 6 - 3) / 100;
          let newVal = Math.floor(currentBase * (1 + fluctuationPercent));

          const minBound = base * 0.85;
          const maxBound = base * 1.15;
          if (newVal < minBound) newVal = Math.floor(minBound);
          if (newVal > maxBound) newVal = Math.floor(maxBound);

          let trend: "up" | "down" | "stable" = "stable";
          if (prevData) {
            if (newVal > prevData.current) trend = "up";
            else if (newVal < prevData.current) trend = "down";
          }

          next[c.id] = {
            current: newVal,
            trend,
            trending: newVal >= trendingThreshold,
          };
        });
        return next;
      });
    };
    update();
    const interval = setInterval(update, 8000);
    return () => clearInterval(interval);
  }, [channels]);

  // Fetch Channels
  useEffect(() => {
    let isMounted = true;
    async function loadChannels() {
      try {
        const cachedTvStr = sessionStorage.getItem('tuniwave_tv');
        let shouldFetch = true;
        if (cachedTvStr) {
          try {
            const cachedTv = JSON.parse(cachedTvStr);
            // Use short 2-minute TTL to keep data fresh but save quota
            if (cachedTv.data && Array.isArray(cachedTv.data) && cachedTv.data.length > 0 && 
                cachedTv.timestamp && Date.now() - cachedTv.timestamp < 2 * 60 * 1000) {
              if (isMounted) {
                setChannels(cachedTv.data);
                setLoading(false);
              }
              shouldFetch = false;
            }
          } catch (e) {
            sessionStorage.removeItem('tuniwave_tv');
          }
        }
        
        if (shouldFetch) {
          const q = query(collection(db, "tv"));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => {
            const d = doc.data();
            // Normalization
            let country = (String(d.country || "")).trim() || "Global";
            const cLower = country.toLowerCase();
            
            if (cLower === "fr" || cLower === "fra" || cLower === "france") country = "France";
            else if (cLower === "tn" || cLower === "tun" || cLower === "tunisia" || cLower === "tunisie") country = "Tunisia";
            else if (cLower === "dz" || cLower === "alg" || cLower === "algeria" || cLower === "algérie") country = "Algeria";
            else if (cLower === "ma" || cLower === "mar" || cLower === "morocco" || cLower === "maroc") country = "Morocco";
            else if (cLower === "ly" || cLower === "lib" || cLower === "libya" || cLower === "libye") country = "Libya";
            else if (cLower === "eg" || cLower === "egy" || cLower === "egypt" || cLower === "égypte") country = "Egypt";
            else if (cLower === "it" || cLower === "ita" || cLower === "italy" || cLower === "italie") country = "Italy";
            else if (cLower === "be" || cLower === "bel" || cLower === "belgium" || cLower === "belgique") country = "Belgium";
            else if (cLower === "ch" || cLower === "che" || cLower === "switzerland" || cLower === "suisse") country = "Switzerland";
            else if (cLower === "us" || cLower === "usa" || cLower === "united states" || cLower === "etats-unis") country = "United States";
            else if (cLower === "uk" || cLower === "gb" || cLower === "gbr" || cLower === "united kingdom" || cLower === "royaume-uni") country = "United Kingdom";
            else if (cLower === "de" || cLower === "deu" || cLower === "germany" || cLower === "allemagne") country = "Germany";
            else if (cLower === "es" || cLower === "esp" || cLower === "spain" || cLower === "espagne") country = "Spain";
            else if (cLower === "tr" || cLower === "tur" || cLower === "turkey" || cLower === "turquie") country = "Turkey";
            else if (cLower === "ca" || cLower === "can" || cLower === "canada") country = "Canada";
            else if (cLower === "ae" || cLower === "uae" || cLower === "are" || cLower === "united arab emirates" || cLower === "emirats arabes unis") country = "UAE";
            else if (cLower === "qa" || cLower === "qat" || cLower === "qatar") country = "Qatar";
            else if (cLower === "sa" || cLower === "sau" || cLower === "saudi arabia" || cLower === "arabie saoudite") country = "Saudi Arabia";
            else if (cLower === "kw" || cLower === "kwt" || cLower === "kuwait" || cLower === "koweit") country = "Kuwait";
            else if (cLower === "om" || cLower === "omn" || cLower === "oman") country = "Oman";
            else if (cLower === "jo" || cLower === "jor" || cLower === "jordan" || cLower === "jordanie") country = "Jordan";
            else if (cLower === "lb" || cLower === "lbn" || cLower === "lebanon" || cLower === "liban") country = "Lebanon";
            else if (cLower === "ps" || cLower === "pse" || cLower === "palestine") country = "Palestine";
            else if (cLower === "iq" || cLower === "irq" || cLower === "iraq" || cLower === "irak") country = "Iraq";
            else if (cLower === "sy" || cLower === "syr" || cLower === "syria" || cLower === "syrie") country = "Syria";
            
            return { 
              id: doc.id, 
              ...d, 
              country,
              genre: (String(d.genre || "")).trim() || "General",
              status: (String(d.status || "")).trim()
            } as Channel;
          }).filter(c => {
            // Strict active filter: Only show channels that are actively broadcasting
            // We include synonyms for "active" but explicitly exclude anything that looks inactive.
            const s = c.status.toLowerCase().trim();
            if (s === "inactive" || s === "offline" || s === "hidden" || s === "false" || s === "0") return false;
            return s === "active" || s === "online" || s === "true" || s === "1" || s === "";
          });
          if (isMounted) {
            setChannels(data);
            setLoading(false);
          }
          sessionStorage.setItem('tuniwave_tv', JSON.stringify({ data, timestamp: Date.now() }));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Firestore Error:", err);
          setError(t("Failed to load channels"));
          setLoading(false);
        }
      }
    }
    loadChannels();
    return () => { isMounted = false; };
  }, []); // Remove `t` to prevent double listener

  // Handle Query Param Auto-play (initial load only)
  const hasAutoPlayed = useRef(false);
  useEffect(() => {
    if (loading || channels.length === 0) return;
    const channelId = searchParams.get("channel");
    if (channelId && !hasAutoPlayed.current) {
      const channel = channels.find((c) => c.id === channelId);
      if (channel) {
        handleChannelSelect(channel);
      }
      hasAutoPlayed.current = true;
    }
  }, [loading, channels]);

  // Auto-rotate Hero
  useEffect(() => {
    if (channels.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(channels.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [channels]);

  // Handle HLS initialization
  useEffect(() => {
    if (!selectedChannel || !isPlayerOpen) return;
    closePlayer(); // Stop radio

    const rawUrl = getPlayerUrl(selectedChannel);
    const type = getPlayerType(rawUrl);

    if (type === "hls" && videoRef.current) {
      const loadHls = async () => {
        try {
          const HlsModule = await import('hls.js');
          const Hls: any = HlsModule.default || HlsModule;
          
          if (Hls && Hls.isSupported()) {
            if (hlsRef.current) hlsRef.current.destroy();
            const initHls = (useProxy: boolean) => {
              const streamUrl = useProxy
                ? `https://good.tuniwave.workers.dev/proxy?url=${encodeURIComponent(rawUrl)}`
                : rawUrl;

              const hls = new Hls({
                xhrSetup: (xhr: any) => {
                  xhr.withCredentials = false;
                },
                lowLatencyMode: true,
              });

              hls.loadSource(streamUrl);
              hls.attachMedia(videoRef.current!);
              hlsRef.current = hls;

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current
                  ?.play()
                  .catch((e) => console.warn("HLS Play failed:", e));
              });

              hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
                if (data.fatal) {
                  if (useProxy) {
                    hls.destroy();
                    initHls(false);
                  } else {
                    setPlayerError(`${t("Playback Error")} (${data.type})`);
                  }
                }
              });
            };
            initHls(!!selectedChannel.use_proxy);
          } else if (
            videoRef.current && videoRef.current.canPlayType("application/vnd.apple.mpegurl")
          ) {
            const streamUrl = selectedChannel.use_proxy
              ? `https://good.tuniwave.workers.dev/proxy?url=${encodeURIComponent(rawUrl)}`
              : rawUrl;
            videoRef.current.src = streamUrl;
          }
        } catch (error) {
          console.error("Failed to load hls.js dynamically in main", error);
        }
      };
      loadHls();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel, isPlayerOpen, getPlayerUrl, closePlayer, t]);

  const discoverChannels = useMemo(() => {
    if (!selectedChannel) return [];
    const sameGenre = channels.filter(
      (c) => c.id !== selectedChannel.id && c.genre === selectedChannel.genre,
    );
    const otherGenre = channels.filter(
      (c) => c.id !== selectedChannel.id && c.genre !== selectedChannel.genre,
    );
    return [selectedChannel, ...sameGenre, ...otherGenre].slice(0, 20);
  }, [channels, selectedChannel]);

  useEffect(() => {
    if (isPlayerOpen) {
      const closed = localStorage.getItem("tv_discover_closed");
      if (closed !== "true") {
        setIsDiscoverOpen(true);
      }
    } else {
      setIsDiscoverOpen(false);
      setIsDiscoverExpanded(false);
    }
  }, [isPlayerOpen]);

  const closeDiscover = () => {
    setIsDiscoverOpen(false);
    localStorage.setItem("tv_discover_closed", "true");
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  };

  const handleShare = async (e: React.MouseEvent, channel: Channel) => {
    e.stopPropagation();
    const shareData = {
      title: `TuniWave - ${channel.name}`,
      text: `${t("Watch")} ${channel.name} ${t("live on TuniWave!")}`,
      url: window.location.href + `?channel=${channel.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert(t("Link copied to clipboard!"));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  };

  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const g = c.genre || "General";
      const matchesGenre = activeFilter === "All" || g === activeFilter;
      const matchesSearch =
        activeFilter !== "All" // If a genre is selected, search within it
          ? !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.country || "").toLowerCase().includes(searchQuery.toLowerCase())
          : !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.country || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = !selectedCountry || c.country === selectedCountry;
      return matchesGenre && matchesSearch && matchesCountry;
    });
  }, [channels, searchQuery, selectedCountry, activeFilter]);

  const categories = useMemo(() => {
    const genres = Array.from(
      new Set(channels.map((c) => c.genre || "General")),
    ).sort();
    const countries = Array.from(
      new Set(channels.map((c) => c.country).filter(Boolean)),
    ).sort();
    return { genres, countries };
  }, [channels]);

  const groupedChannels = useMemo(() => {
    const groups: Record<string, Channel[]> = {};

    // 1. Trending Now (Top 15 by current viewers)
    const trendingList = [...channels]
      .sort(
        (a, b) => (viewers[b.id]?.current || 0) - (viewers[a.id]?.current || 0),
      )
      .slice(0, 15);
    if (trendingList.length > 0) groups["Trending Now"] = trendingList;

    // 2. Popular in Tunisia
    const tunisiaChannels = channels.filter((c) =>
      (c.country || "").toUpperCase().includes("TUNISIA"),
    );
    if (tunisiaChannels.length > 0)
      groups["Popular in Tunisia"] = tunisiaChannels;

    // 3. Favorites Row
    const favChannels = channels.filter((c) => favorites.includes(c.id));
    if (favChannels.length > 0) groups["My Favorites"] = favChannels;

    // 4. Recently Watched Row (Up to 15)
    const recentChannels = recentlyWatched
      .map((id) => channels.find((c) => c.id === id))
      .filter((c): c is Channel => !!c)
      .slice(0, 15);
    if (recentChannels.length > 0) groups["Recently Watched"] = recentChannels;

    // 5. Genre Groups
    filteredChannels.forEach((c) => {
      const genre = c.genre || "General";
      if (!groups[genre]) groups[genre] = [];
      groups[genre].push(c);
    });
    return groups;
  }, [
    channels,
    viewers,
    favorites,
    recentlyWatched,
    activeFilter,
    filteredChannels,
  ]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: SHAHID_RED }}
        />
        <p className="text-sm font-black uppercase tracking-widest opacity-50">
          {t("Loading Live TV...")}
        </p>
      </div>
    );
  }

  const heroChannels = channels.slice(0, 5);
  const currentHero = heroChannels[heroIndex];

  return (
    <div className={`flex flex-col pb-12 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 ${isArabic ? "rtl" : "ltr"}`}>
      <SEO
        title={
          selectedChannel
            ? `${cleanName(selectedChannel.name)} Live - ${t("Tunisian Live TV")}`
            : activeFilter !== "All"
              ? `${t(activeFilter)} Channels - ${t("Tunisian Live TV")}`
              : t("Live TV - Watch Tunisian Channels Online")
        }
        description={
          selectedChannel
            ? t(
                "Watch {{channel}} live streaming online. Enjoy high-quality broadcast of Tunisian TV channels.",
                { channel: cleanName(selectedChannel.name) },
              )
            : t(
                "Stream Tunisian TV channels live including El Hiwar El Tounsi, Nessma, Watania, and more for free.",
              )
        }
        canonical={`https://tuniwave.com/${lang}/tv${selectedChannel ? `?channel=${selectedChannel.id}` : activeFilter !== "All" ? `?genre=${activeFilter}` : ""}`}
      />

      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] w-full overflow-hidden sm:rounded-b-[40px] shadow-2xl bg-black group">
          {currentHero && (
            <div
              key={currentHero.id}
              className="absolute inset-0 w-full h-full"
            >
              {/* Context-aware Gradient Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none"
              />
              <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
              
              <HeroVideo
                channel={currentHero}
                isActive={true}
                getPlayerUrl={getPlayerUrl}
                getPlayerType={getPlayerType}
              />

              <div className="absolute inset-0 px-6 sm:px-12 pb-12 flex flex-col justify-end gap-4 max-w-5xl mx-auto z-30 pointer-events-none">
                <div className="flex flex-col gap-4 w-full pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[var(--accent-color)] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {t('Live Now')}
                    </span>
                    <span className="px-3 py-1 rounded-[4px] bg-white/10 backdrop-blur-xl text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-white/90 border border-white/20">
                      {t(currentHero.genre)}
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl">
                    {cleanName(currentHero.name)}
                  </h1>

                  {/* CTA Button */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleChannelSelect(currentHero)}
                      className="px-8 sm:px-10 py-4 bg-[var(--accent-color)] text-white rounded-full font-black uppercase italic tracking-widest flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl active:scale-95"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                      {t("Watch Now")}
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setInfoChannel(currentHero); setIsInfoOpen(true); }}
                      className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 shadow-xl"
                    >
                      <Info className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Hero Progress Dots */}
        <div className="absolute bottom-6 right-6 sm:right-12 z-40 flex gap-2">
          {heroChannels.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${heroIndex === i ? "w-8 bg-white" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">
      {/* Search Bar Container */}
      <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-0">
        <div className="relative group py-2">
          <div className="relative flex items-center h-[60px] bg-[var(--card-bg)] rounded-[20px] shadow-2xl border border-[var(--border-color)] overflow-hidden transition-all group-focus-within:ring-4 group-focus-within:ring-[var(--accent-color)]/20">
            <Search className="absolute left-6 w-5 h-5 text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("Search channels, movies, shows...")}
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-full pl-16 pr-14 bg-transparent text-[var(--text-color)] font-bold outline-none placeholder:text-gray-500"
              style={{ fontSize: "16px" }}
            />
          {searchQuery.length > 0 && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-4 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {(isSearchFocused || searchQuery.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-[var(--card-bg)] rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-[100] flex flex-col max-h-[450px]">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 bg-[var(--card-bg)] z-10">
              <span
                className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70"
                style={{ color: "var(--text-color)" }}
              >
                {t("Instant Results")}
              </span>
              <span className="text-[10px] font-black text-[var(--accent-color)] uppercase">
                {filteredChannels.length} {t("Found")}
              </span>
            </div>
            <div className="overflow-y-auto p-2 hide-scrollbar flex-1">
              {filteredChannels.length > 0 ? (
                filteredChannels.slice(0, 50).map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--accent-color)] group/item text-start overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--card-bg)] p-1.5 shrink-0 shadow-lg border border-[var(--border-color)]">
                      <img
                        src={
                          channel.logo_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || "C")}&background=random&color=fff&size=64`
                        }
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || "C")}&background=random&color=fff&size=64`;
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-black text-sm uppercase italic truncate group-hover/item:text-white"
                        style={{ color: "var(--text-color)" }}
                      >
                        {cleanName(channel.name)}
                      </h4>
                      <div
                        className="flex items-center gap-1.5 opacity-70 group-hover/item:text-white/80"
                        style={{ color: "var(--news-text-secondary)" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                          {t(channel.genre)} • {t(channel.country || "Global")}
                        </p>
                        <CountryFlag
                          country={channel.country || ""}
                          className="w-[14px] h-[9px] shadow-sm rounded-[0.25px]"
                        />
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--hover-bg)] flex items-center justify-center opacity-0 group-hover/item:opacity-100">
                      <Play className="w-3 h-3 text-[var(--accent-color)] fill-current ml-0.5" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <Search
                    className="w-8 h-8 opacity-10"
                    style={{ color: "var(--text-color)" }}
                  />
                  <span
                    className="text-xs font-bold opacity-40"
                    style={{ color: "var(--text-color)" }}
                  >
                    {t("No channels found")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

          {!isSearchFocused && (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                <button
                  onClick={() => handleFilterChange("All")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm ${
                    activeFilter === "All"
                      ? "bg-[var(--text-color)] border-[var(--text-color)] text-[var(--bg-color)]"
                      : "bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--text-color)]/30"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {t("All Genres")}
                </button>
                {categories.genres.map((genre) => {
                  const config = getGenreConfig(genre);
                  const Icon = config.icon;
                  const isActive = activeFilter === genre;
                  return (
                    <button
                      key={genre}
                      onClick={() => handleFilterChange(genre)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm`}
                      style={{
                        backgroundColor: isActive ? config.color : "var(--card-bg)",
                        borderColor: isActive ? config.color : "var(--border-color)",
                        color: isActive ? "#ffffff" : "var(--text-color)",
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: isActive ? "#ffffff" : config.color }} />
                      {t(genre)}
                    </button>
                  );
                })}
              </div>

              {categories.countries.length > 0 && (
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
                        className={`w-5 h-5 ${!selectedCountry ? "text-white" : "text-[var(--text-color)] opacity-50"}`}
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-50 group-hover:text-[var(--text-color)]">
                      {t("Global")}
                    </span>
                  </button>

                  {categories.countries.map((country) => (
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

      {/* Channel Rows */}
      <div
        ref={resultsRef}
        className="space-y-8 py-4 w-full"
      >
        {Object.entries(groupedChannels).map(
          ([genre, genreChannels]) => {
            const config = getGenreConfig(genre);
            const Icon = config.icon;
            return (
            <div
              key={genre}
              id={`category-${genre.replace(/\s+/g, "-")}`}
              className="space-y-3"
            >
                <div className="flex items-center justify-between">
                  <h2
                    className="text-base sm:text-lg font-black uppercase italic tracking-widest flex items-center gap-2"
                    style={{ color: "var(--text-color)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                    {t(genre)}
                  </h2>
                  <button
                    onClick={() => setViewAllGenre(genre)}
                    className="text-xs font-semibold uppercase opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-color)" }}
                  >
                    {t("SEE ALL")}
                  </button>
                </div>

              <div className="relative group/row">
                <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4">
                  {genreChannels.map((channel) => {
                    const isLandscape = genre === "Trending Now" || genre === "Popular in Tunisia" || genre === "Recently Watched" || genre === "My Favorites";
                    return (
                      <div
                        key={`${genre}-${channel.id}`}
                        onClick={() => handleChannelSelect(channel)}
                        className={`flex-shrink-0 relative overflow-hidden group/card snap-start cursor-pointer border shadow-sm transition-all duration-300 hover:shadow-md ${
                          isLandscape
                            ? "w-[240px] sm:w-[280px] aspect-video rounded-[12px] sm:rounded-[16px]"
                            : "w-[120px] sm:w-[140px] aspect-[4/5] rounded-[12px] sm:rounded-[16px]"
                        }`}
                        style={{
                          background: "var(--card-bg)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        {/* Background Logo Container with adaptive color */}
                        <div className="absolute inset-0 z-0 flex items-center justify-center">
                          <img
                            src={channel.logo_url || undefined}
                            alt=""
                            className={`w-full h-full object-contain ${
                              isLandscape ? "p-8 opacity-80" : "p-4 opacity-90"
                            } transition-transform duration-700 group-hover/card:scale-110`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        
                        <div
                          className="absolute inset-0 z-10 bg-gradient-to-t from-black/[0.08] dark:from-black/40 to-transparent"
                        />

                        {/* LIVE badge */}
                        <div className="absolute top-2 left-2 z-30">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {t('Live')}
                          </div>
                        </div>

                        {/* Viewers badge */}
                        <div className="absolute top-2 right-2 z-30">
                          <div className="px-2 py-0.5 bg-black/40 rounded text-[8px] font-black text-white backdrop-blur-sm border border-white/5">
                            {formatNumber(viewers[channel.id]?.current || 0)}
                          </div>
                        </div>

                        {/* Country Flag - Bottom Right rounded without background */}
                        {channel.country && channel.country !== "Global" && (
                          <div className="absolute bottom-2 right-2 z-30 pointer-events-none">
                            <div className="shadow-sm rounded-[2px] w-[18px] h-[12px] overflow-hidden">
                              <img
                                src={getFlagUrl(channel.country)}
                                alt={channel.country}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://flagcdn.com/w160/un.png";
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* See All Grid View Modal */}
      {viewAllGenre && (() => {
        const config = getGenreConfig(viewAllGenre);
        const Icon = config.icon;
        return (
        <div className="fixed inset-0 z-[120] bg-[var(--bg-color)] flex flex-col pt-safe">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewAllGenre(null)}
                className="w-10 h-10 rounded-full bg-[var(--hover-bg)] flex items-center justify-center border border-[var(--border-color)]"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                  <Icon className="w-6 h-6" style={{ color: config.color }} />
                  {t(viewAllGenre)}
                </h2>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  {(groupedChannels[viewAllGenre] || []).length} {t("Channels")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {(groupedChannels[viewAllGenre] || []).map((channel) => {
                const isLandscape = viewAllGenre === "Trending Now" || viewAllGenre === "Popular in Tunisia" || viewAllGenre === "Recently Watched" || viewAllGenre === "My Favorites";
                return (
                  <div
                    key={`seeall-${channel.id}`}
                    onClick={() => {
                      handleChannelSelect(channel);
                      setViewAllGenre(null);
                    }}
                    className={`relative overflow-hidden group/card cursor-pointer border ${
                      isLandscape ? "aspect-video" : "aspect-[4/5]"
                    } rounded-[16px]`}
                    style={{
                      background: "var(--card-bg)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="absolute inset-0 z-0 flex items-center justify-center">
                      <img
                        src={channel.logo_url || undefined}
                        alt=""
                        className={`w-full h-full object-contain ${
                          isLandscape ? "p-8 opacity-80" : "p-4 opacity-90"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/[0.08] dark:from-black/40 to-transparent" />
                    
                    {/* Country Flag - Bottom Right rounded without background */}
                    {channel.country && channel.country !== "Global" && (
                      <div className="absolute bottom-2 right-2 z-30 pointer-events-none">
                        <div className="shadow-sm rounded-[2px] w-[18px] h-[12px] overflow-hidden">
                          <img
                            src={getFlagUrl(channel.country)}
                            alt={channel.country}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://flagcdn.com/w160/un.png";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        );
      })()}
      {isInfoOpen && infoChannel && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            onClick={() => setIsInfoOpen(false)}
            className="absolute inset-0 bg-[#000000]/90"
          />
          <div
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              background: "var(--card-bg)",
            }}
          >
              <div className="relative aspect-video bg-[var(--card-bg)]">
                <img
                  src={infoChannel.logo_url}
                  alt=""
                  className="w-full h-full object-contain p-12"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--card-bg), transparent)",
                  }}
                />
                <button
                  onClick={() => setIsInfoOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--card-bg)]/90 flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--accent-color)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-3xl font-black uppercase italic tracking-tight"
                      style={{ color: "var(--text-color)" }}
                    >
                      {cleanName(infoChannel.name)}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: "var(--news-text-secondary)" }}
                      >
                        {t(infoChannel.genre)}
                      </span>
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ background: "var(--border-color)" }}
                      />
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: "var(--news-text-secondary)" }}
                        >
                          {t(infoChannel.country || "")}
                        </span>
                        <CountryFlag
                          country={infoChannel.country || ""}
                          className="w-[14px] h-[9px] shadow-sm rounded-[0.25px]"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(e, infoChannel.id)}
                    className="w-12 h-12 rounded-full border flex items-center justify-center"
                    style={{
                      borderColor: "var(--border-color)",
                      color: "var(--text-color)",
                    }}
                  >
                    <Heart
                      className={`w-5 h-5 ${favorites.includes(infoChannel.id) ? "fill-[var(--accent-color)] text-[var(--accent-color)]" : ""}`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="rounded-2xl p-4 text-center"
                    style={{ background: "var(--hover-bg)" }}
                  >
                    <TrendingUp className="w-5 h-5 text-[var(--accent-color)] mx-auto mb-2" />
                    <p
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: "var(--news-text-secondary)" }}
                    >
                      {t("Viewers")}
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--text-color)" }}
                    >
                      {formatNumber(viewers[infoChannel.id]?.current || 0)}
                    </p>
                  </div>
                  <div
                    className="rounded-2xl p-4 text-center"
                    style={{ background: "var(--hover-bg)" }}
                  >
                    <ShieldCheck className="w-5 h-5 text-[var(--accent-color)] mx-auto mb-2" />
                    <p
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: "var(--news-text-secondary)" }}
                    >
                      {t("Quality")}
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--text-color)" }}
                    >
                      {t(infoChannel.quality || "HD")}
                    </p>
                  </div>
                  <div
                    className="rounded-2xl p-4 text-center"
                    style={{ background: "var(--hover-bg)" }}
                  >
                    <Globe className="w-5 h-5 text-[var(--accent-color)] mx-auto mb-2" />
                    <p
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: "var(--news-text-secondary)" }}
                    >
                      {t("Language")}
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--text-color)" }}
                    >
                      {t(infoChannel.language || "AR")}
                    </p>
                  </div>
                </div>

                {infoChannel.description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--news-text-secondary)" }}
                  >
                    {infoChannel.description}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setIsInfoOpen(false);
                      handleChannelSelect(infoChannel);
                    }}
                    className="flex-1 py-4 rounded-full font-black uppercase italic flex items-center justify-center gap-3 text-white shadow-xl"
                    style={{ background: "var(--accent-color)" }}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {t("Watch Now")}
                  </button>
                  <button
                    onClick={(e) => handleShare(e, infoChannel)}
                    className="w-14 h-14 rounded-full border flex items-center justify-center"
                    style={{
                      borderColor: "var(--border-color)",
                      color: "var(--text-color)",
                    }}
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Player Overlay */}
      {isPlayerOpen && selectedChannel && (
        <div
          className="fixed inset-0 z-[100] flex flex-col lg:flex-row bg-slate-950"
        >
          {/* Main Video Area */}
          <div className="flex-1 relative flex flex-col min-h-0">
            {/* Player Header - Always Dark Gradient */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg p-1.5 flex items-center justify-center border border-white/20">
                  <img
                    src={selectedChannel.logo_url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2
                    className="font-black uppercase italic leading-none text-white text-sm sm:text-base"
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                  >
                    {cleanName(selectedChannel.name)}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-white/70">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {t(selectedChannel.genre)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {t(selectedChannel.country || "")}
                      </span>
                      <CountryFlag
                        country={selectedChannel.country || ""}
                        className="w-[14px] h-[9px] shadow-sm rounded-[0.25px]"
                      />
                    </div>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1 text-[10px] text-[var(--accent-color)] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
                      {formatNumber(
                        viewers[selectedChannel.id]?.current || 0,
                      )}{" "}
                      {t("watching")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={(e) => handleShare(e, selectedChannel)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setIsPlayerOpen(false)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden shadow-2xl">
              {/* Premium Background Fallback (Ambient Glow) */}
              <div className="absolute inset-0 z-0">
                <img
                  src={selectedChannel.logo_url}
                  alt=""
                  className="w-full h-full object-cover opacity-60 blur-[100px] scale-150"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>

              {getPlayerType(getPlayerUrl(selectedChannel)) === "youtube" ? (
                <iframe
                  key={selectedChannel.id}
                  src={getYouTubeEmbedUrl(getPlayerUrl(selectedChannel))}
                  className="w-full h-full border-0 relative z-10 shadow-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setIsBuffering(false)}
                />
              ) : (
                <video
                  ref={videoRef}
                  key={selectedChannel.id}
                  poster={selectedChannel.logo_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain relative z-10 shadow-2xl"
                  onPlaying={() => setIsBuffering(false)}
                  onCanPlay={() => setIsBuffering(false)}
                  onLoadedData={() => setIsBuffering(false)}
                  onTimeUpdate={(e) => {
                    if (e.currentTarget.currentTime > 0 && isBuffering) {
                      setIsBuffering(false);
                    }
                  }}
                  onWaiting={() => setIsBuffering(true)}
                  onError={() => setPlayerError(t("Playback Error"))}
                />
              )}

              {/* Loading State Overlay */}
              {!playerError && isBuffering && (
                <div
                  className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center bg-black/60"
                >
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-white animate-spin opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={selectedChannel.logo_url}
                        alt=""
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

              {playerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center gap-6 z-20">
                  <AlertCircle className="w-16 h-16 text-[var(--accent-color)]" />
                  <div className="space-y-2">
                    <p className="text-xl font-black uppercase italic">
                      {t("Oops!")}
                    </p>
                    <p className="text-sm opacity-60 max-w-xs mx-auto">
                      {playerError}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      window.open(getPlayerUrl(selectedChannel), "_blank")
                    }
                    className="px-8 py-3 rounded-full font-black uppercase italic text-sm text-white"
                    style={{ background: SHAHID_RED }}
                  >
                    {t("Watch on Source")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Discover More Panel (Mobile Bottom Sheet / Desktop Sidebar) */}
          {isDiscoverOpen && (
            <div
              className={`w-full flex-shrink-0 bg-[var(--bg-color)] border-t border-[var(--border-color)] flex flex-col z-50 ${isDiscoverExpanded ? "h-[85vh]" : "h-[45vh]"} lg:h-full lg:w-[360px] lg:border-t-0 lg:border-l`}
            >
              {/* Mobile Drag Handle */}
              <div
                className="w-full flex justify-center py-4 lg:hidden cursor-pointer touch-none"
                onClick={() => setIsDiscoverExpanded(!isDiscoverExpanded)}
              >
                <div className="w-16 h-1.5 rounded-full bg-[var(--card-bg)]/20" />
              </div>

              {/* Header */}
              <div className="px-4 pb-3 lg:pt-6 flex items-center justify-between border-b border-[var(--border-color)] shrink-0">
                <h3
                  className="font-black uppercase tracking-widest text-[var(--text-color)]"
                >
                  {t("Discover More")}
                </h3>
                <button
                  onClick={closeDiscover}
                  className="p-2 hover:bg-[var(--card-bg)]/10 rounded-full"
                >
                  <X
                    className="w-5 h-5 text-[var(--text-color)]"
                  />
                </button>
              </div>

              {/* Channel List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                {discoverChannels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleChannelSelect(c)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl ${c.id === selectedChannel.id ? "bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20" : "hover:bg-[var(--card-bg)]/5 border border-transparent"}`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-[var(--card-bg)] flex items-center justify-center p-2 shrink-0 shadow-lg">
                      {c.logo_url && !imgErrors[c.id] ? (
                        <img
                          src={c.logo_url}
                          className="w-full h-full object-contain"
                          onError={() =>
                            setImgErrors((prev) => ({
                              ...prev,
                              [c.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <span className="text-[var(--text-color)] font-black text-xl">
                          {getInitials(c.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-start min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-black uppercase italic text-sm truncate ${c.id === selectedChannel.id ? "text-[var(--accent-color)]" : "text-[var(--text-color)]"}`}
                        >
                          {cleanName(c.name)}
                        </h4>
                        {c.id === selectedChannel.id && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)] shrink-0"
                          />
                        )}
                      </div>
                      <div
                        className="flex items-center gap-3 text-[10px] mt-1.5 font-black uppercase tracking-widest opacity-40 text-[var(--text-color)]"
                      >
                        <span className="px-2 py-0.5 rounded bg-[var(--hover-bg)] border border-black/5">
                          {t(c.genre)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3 text-[var(--accent-color)]" />{" "}
                          {formatNumber(viewers[c.id]?.current || 0)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer Button */}
              <div className="p-6 border-t border-[var(--border-color)] shrink-0 bg-gradient-to-t from-black/20 to-transparent">
                <button
                  onClick={() => {
                    setIsPlayerOpen(false);
                    navigate("/tv");
                  }}
                  className="w-full py-4 bg-[var(--accent-color)] text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-xl"
                >
                  {t("Browse All Channels")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
