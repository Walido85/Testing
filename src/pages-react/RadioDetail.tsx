import React, { useState, useEffect, useRef } from "react";

import { Link, useAstroNavigate } from "../utils/navigation";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Station } from "../types";
import { useTranslation } from "react-i18next";
import { usePlayer } from "../context/PlayerContext";
import { Play, Pause, Loader2, Heart, Music, MapPin, Activity, Info, Newspaper, Radio, Sparkles, Gem } from "lucide-react";
import SEO from "../components/SEO";

function timeAgo(timestamp: number | any, t: any, isArabic: boolean) {
  if (!timestamp) return "";
  const timeNum = typeof timestamp === 'number' ? timestamp : (timestamp.seconds ? timestamp.seconds * 1000 : new Date(timestamp).getTime());
  const diff = (Date.now() - timeNum) / 1000;
  if (diff < 60) return isArabic ? "منذ لحظات" : t("Just now");
  if (diff < 3600) return isArabic ? `منذ ${Math.floor(diff / 60)} دقيقة` : `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return isArabic ? `منذ ${Math.floor(diff / 3600)} ساعة` : `${Math.floor(diff / 3600)}h`;
  
  const date = new Date(timeNum);
  return isArabic 
    ? date.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
    : date.toLocaleDateString();
}

export default function RadioDetail({ initialData, slug, lang: propLang }: { initialData?: Station, slug?: string, lang?: string }) {
  const { t, i18n } = useTranslation();
  const lang = propLang || i18n.language;

  const { playRadio, togglePlay, currentStream, isPlaying, favorites, toggleFavorite } = usePlayer();
  const navigate = useAstroNavigate();
  const langPrefix = i18n.language.slice(0, 2).toLowerCase();
  
  const [station, setStation] = useState<Station | null>(initialData || null);

  // Guard against missing slug
  if (!slug) return null;
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [discoverStations, setDiscoverStations] = useState<Station[]>([]);
  const [topStories, setTopStories] = useState<any[]>([]);
  const autoplayedStationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchStation = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "stations"), where("slug", "==", slug));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const stationData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Station;
          setStation(stationData);
        } else {
          setError(t("Station not found"));
        }
      } catch (err) {
        console.error("Error fetching station:", err);
        setError(t("Failed to load station"));
      } finally {
        setLoading(false);
      }
    };
    fetchStation();
  }, [slug, t]);

  useEffect(() => {
    // Autoplay when the station page is opened and it hasn't been autoplayed yet.
    if (station && station.stream_link && autoplayedStationIdRef.current !== station.id) {
      if (currentStream !== station.stream_link) {
        playRadio(station.stream_link, {
          id: station.id,
          name: station.name,
          genre: station.genre,
          logo_url: station.logo_url,
          stream_link: station.stream_link,
          status: station.status || 'active'
        });
      }
      autoplayedStationIdRef.current = station.id;
    }
  }, [station, playRadio]);

  useEffect(() => {
     // Fetch discover stations and news independently
     const fetchDiscover = async () => {
        try {
           const sq = query(collection(db, "stations"), limit(50));
           const sSnap = await getDocs(sq);
           const stations = sSnap.docs.map(d => ({id: d.id, ...d.data()}) as Station);
           const filtered = stations.filter(s => s.slug !== slug);
           // Shuffle and pick 15
           const shuffled = filtered.sort(() => 0.5 - Math.random());
           setDiscoverStations(shuffled.slice(0, 15));
        } catch (e) {
           console.error(e);
        }
     };

     const fetchNews = async () => {
        try {
           const nq = query(collection(db, "rss_articles"), orderBy("pubDate", "desc"), limit(40));
           const nSnap = await getDocs(nq);
           const articles = nSnap.docs.map(d => ({id: d.id, ...d.data()}));
           // Filter by language
           const currentLangMap: any = { ar: 'arabic', fr: 'french', en: 'english' };
           const filtered = articles.filter((a: any) => {
              const lang = (a.language || a.sourceLanguage || 'ar').toLowerCase();
              return lang.startsWith(langPrefix) || lang === currentLangMap[langPrefix];
           });
           
           if (filtered.length >= 4) {
             setTopStories(filtered.slice(0, 4));
           } else {
             // fallback if not enough language-specific news
             setTopStories(articles.slice(0, 4));
           }
        } catch (e) {
           console.error(e);
        }
     };

     fetchDiscover();
     fetchNews();
  }, [langPrefix, slug]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-[var(--accent-color)] animate-spin" /></div>;
  if (error || !station) return <div className="p-8 text-center text-[var(--text-color)]">{error}</div>;

  const description = i18n.language === 'ar' ? station.description_ar : i18n.language === 'fr' ? station.description_fr : station.description_en;
  const isArabic = i18n.language === 'ar';

  return (
    <div className={`w-full pb-4 text-[var(--text-color)]flex flex-col gap-4 ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <SEO 
        title={`${station.name} - TuniWave`} 
        description={description || station.name} 
        canonical={`https://tuniwave.com/${langPrefix}/radio/${slug}`}
      />
      
      <div className="flex flex-col md:flex-row gap-6 items-center bg-[var(--card-bg)]/5 p-6 rounded-[1.5rem] border border-[var(--border-color)]">
        <img loading="lazy" src={station.logo_url || undefined} alt={station.name} className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-2xl shadow-xl" referrerPolicy="no-referrer" />
        <div className="flex-1 space-y-3 text-center md:text-start">
            <h1 className="text-4xl font-black uppercase italic">{station.name}</h1>
            <p className="text-lg opacity-80">{description || station.name}</p>
            
            <button
                onClick={() => {
                  if (currentStream === station.stream_link) {
                    togglePlay();
                  } else {
                    playRadio(station.stream_link, {
                        id: station.id,
                        name: station.name,
                        genre: station.genre,
                        logo_url: station.logo_url,
                        stream_link: station.stream_link,
                        status: station.status || 'active'
                    });
                  }
                }}
                className="px-8 py-4 bg-[var(--accent-color)] text-white rounded-full font-black uppercase italic tracking-widest flex items-center gap-3 mx-auto md:mx-0 hover:scale-105 transition-all shadow-xl"
            >
                {currentStream === station.stream_link && isPlaying ? <Pause className="fill-current"/> : <Play className="fill-current"/>}
                {t("Listen Live")}
            </button>
        </div>
      </div>
      
      {/* New Player Card matching the provided UI exactly */}
      <div className="mt-4 mb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[var(--accent-color)] text-white text-[13px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            LIVE
          </div>
          <h2 className="text-[28px] font-bold text-[var(--text-color)] tracking-tight">{station.name}</h2>
        </div>

        <div className="bg-[var(--card-bg)] text-[var(--text-color)] rounded-[20px] p-6 shadow-sm flex flex-col items-center">
          {/* Waveform svg */}
          <div className="w-full flex items-center justify-between h-[80px] mb-8 gap-[2px]">
            {[15, 25, 10, 35, 20, 50, 40, 60, 35, 80, 55, 90, 65, 45, 75, 40, 100, 60, 30, 85, 70, 45, 95, 75, 55, 35, 80, 65, 45, 90, 70, 50, 85, 60, 40, 75, 55, 35, 80, 65, 45, 95, 75, 50, 90, 60, 40, 75, 55, 30, 85, 65, 45, 80, 50, 35, 75, 60, 40, 20, 15].map((h, i) => (
              <div 
                key={i} 
                className={`w-[3px] bg-[var(--accent-color)] rounded-full transition-all duration-300 ${currentStream === station?.stream_link && isPlaying ? 'animate-pulse' : ''}`} 
                style={{ 
                  height: currentStream === station?.stream_link && isPlaying ? `${Math.max(10, h * (0.6 + Math.random() * 0.4))}%` : `${h}%`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: '1s'
                }}>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between w-full mb-2 px-2">
            <div className="w-10"></div> {/* Spacer for alignment */}
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => {
                  if (currentStream === station.stream_link) {
                    togglePlay();
                  } else {
                    playRadio(station.stream_link, {
                      id: station.id,
                      name: station.name,
                      genre: station.genre,
                      logo_url: station.logo_url,
                      stream_link: station.stream_link,
                      status: station.status || 'active'
                    });
                  }
                }}
                className="w-16 h-16 bg-[var(--accent-color)] hover:opacity-90 rounded-full flex items-center justify-center transition-colors shadow-md">
                {currentStream === station.stream_link && isPlaying ? (
                  <Pause className="w-8 h-8 text-white fill-current" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-current ml-1" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => toggleFavorite(station.id)} className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors w-10 h-10 flex items-center justify-center">
                <Heart className={`w-6 h-6 ${favorites.includes(station.id) ? 'text-[var(--accent-color)] fill-[var(--accent-color)]' : 'text-[var(--text-color)]'}`} />
              </button>
            </div>
          </div>

          <p className="text-[15px] text-[var(--text-color)] font-medium text-center">Now Playing: {station.name}</p>
        </div>
      </div>

      {/* Station Info */}
      <div className="mt-4">
        <h2 className="text-[1.35rem] font-bold text-[var(--text-color)] mb-3 tracking-tight flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--accent-color)]" /> {t("Station Info")}
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[15px] text-[var(--text-color)]">
          <p className="flex items-center gap-1.5 bg-[var(--card-bg)]/5 py-1.5 px-3 rounded-xl border border-[var(--border-color)] transition-colors"><Music className="w-4 h-4 text-[var(--accent-color)]" /> <span className="font-bold">{t("Genre")}:</span> <span className="opacity-80">{station.genre || "N/A"}</span></p>
          <p className="flex items-center gap-1.5 bg-[var(--card-bg)]/5 py-1.5 px-3 rounded-xl border border-[var(--border-color)] transition-colors"><MapPin className="w-4 h-4 text-[var(--accent-color)]" /> <span className="font-bold">{t("Location")}:</span> <span className="opacity-80">{station.country || "Tunisia"}</span></p>
          <p className="flex items-center gap-1.5 bg-[var(--card-bg)]/5 py-1.5 px-3 rounded-xl border border-[var(--border-color)] transition-colors"><Activity className="w-4 h-4 text-[var(--accent-color)]" /> <span className="font-bold">{t("Bitrate")}:</span> <span className="opacity-80">320kbps</span></p>
          <p className="flex items-center gap-1.5 bg-[var(--card-bg)]/5 py-1.5 px-3 rounded-xl border border-[var(--border-color)] transition-colors"><Gem className="w-4 h-4 text-[var(--accent-color)]" /> <span className="font-bold">{t("Quality")}:</span> <span className="opacity-80">Premium</span></p>
        </div>
        {description && (
          <p className="mt-4 text-[15px] text-[var(--text-color)]/80 leading-relaxed font-medium bg-[var(--card-bg)]/5 p-4 rounded-2xl border border-[var(--border-color)]">
            {description}
          </p>
        )}
      </div>

      {/* Top Stories */}
      {topStories.length > 0 && (
          <div className="mt-4 bg-[var(--card-bg)] text-[var(--text-color)] rounded-[20px] p-6 shadow-sm">
            <h2 className="text-[1.35rem] flex items-center gap-2 font-bold mb-5 tracking-tight">
                <Newspaper className="w-5 h-5 text-[var(--accent-color)]" /> {t("Top Stories: While You Listen")}
            </h2>
            <div className="flex flex-col gap-5">
                {topStories.map((news, i) => (
                    <Link to={`/${i18n.language}/news/${news.slug || news.id}`} key={i} className="flex gap-4 items-center group cursor-pointer">
                        <img loading="lazy" 
                           src={news.thumbnail || news.imageUrl || "https://images.unsplash.com/photo-1611273426858-450d8e8eb15b?w=200&fit=crop"} 
                           className="w-[84px] h-[56px] rounded-lg object-cover group-hover:opacity-80 transition-opacity" 
                           alt="" 
                           referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                            <h3 className="font-bold text-[15px] leading-tight mb-1 group-hover:text-[var(--accent-color)] transition-colors line-clamp-2">{news.title}</h3>
                            <p className="text-[13px] opacity-60 font-medium">{news.sourceName || "TuniWave News"} • {timeAgo(news.pubDate, t, isArabic)}</p>
                        </div>
                    </Link>
                ))}
            </div>
          </div>
      )}

      {/* Discover More Radios */}
      {discoverStations.length > 0 && (
          <div className="mt-4 overflow-hidden">
            <h2 className="text-[1.35rem] flex items-center gap-2 font-bold text-[var(--text-color)] mb-5 tracking-tight">
                <Radio className="w-5 h-5 text-[var(--accent-color)]" /> {t("Discover More Radios")}
            </h2>
            <div className="flex overflow-x-auto gap-6 sm:gap-8 pb-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {discoverStations.map((radio) => (
                   <Link to={`/${i18n.language}/radio/${radio.slug}`} key={radio.id} className="flex flex-col items-center gap-2 min-w-[70px] hover:scale-105 transition-transform group">
                       <img loading="lazy" src={radio.logo_url || undefined} alt={radio.name} className="w-[70px] h-[70px] rounded-full object-cover border border-[var(--border-color)] shadow-sm group-hover:border-[var(--accent-color)] transition-colors" referrerPolicy="no-referrer" />
                       <span className="text-[13px] text-[var(--text-color)] font-medium text-center line-clamp-1 opacity-80 group-hover:opacity-100">{radio.name}</span>
                   </Link>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}

