import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getArticleImage } from '../services/newsService';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import { ChevronRight, Play, Plane, Radio, Crown, ChevronLeft, Globe2, MoonStar, Sun, Sunrise, Sunset, Moon, CloudSun } from 'lucide-react';


import { Link } from '../utils/navigation';
import { getCountryCode } from '../lib/countryUtils';
import { useGeolocation, usePrayerTimes } from '../hooks/islamic';
import { useLocation as useAppLocation } from '../context/LocationContext';
import { LazyLoad } from '../components/LazyLoad';

import { TodayTV } from '../components/TodayTV';
import { HomeSportsWidget } from '../components/HomeSportsWidget';

const getFlagUrl = (countryName?: string) => {
  const code = getCountryCode(countryName || '');
  return `https://flagcdn.com/w80/${code}.png`;
};


const NewsSkeleton = () => (
  <div className="bg-[var(--card-bg)] rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.15)] h-full flex flex-col animate-pulse">
    <div className="h-[220px] sm:h-[280px] lg:h-[320px] w-full bg-[var(--card-bg)]" />
    <div className="px-3 pb-5 pt-4 space-y-3">
      <div className="h-6 bg-[var(--card-bg)] rounded w-3/4" />
      <div className="h-4 bg-[var(--card-bg)] rounded w-1/2" />
      <div className="flex gap-2.5 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[125px] sm:w-[145px] shrink-0 space-y-2">
            <div className="h-[65px] sm:h-[80px] w-full bg-[var(--card-bg)] rounded" />
            <div className="h-3 bg-[var(--card-bg)] rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CarouselSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-[var(--hover-bg)] rounded w-1/4" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[150px] sm:w-[170px] shrink-0 space-y-3">
          <div className="h-[250px] sm:h-[280px] w-full bg-[var(--hover-bg)] rounded" />
          <div className="h-4 bg-[var(--hover-bg)] rounded w-full" />
        </div>
      ))}
    </div>
  </div>
);

export default function Home({ initialData }: { initialData?: { topNews: any[], tvChannels: any[] } }) {
  const { t, i18n } = useTranslation();
  const { lang } = useLanguage();
  const isArabic = i18n.language === 'ar';
  
  const [topNews, setTopNews] = useState<any[]>(initialData?.topNews || []);
  const [loading, setLoading] = useState(!initialData);
  const [tvChannels, setTvChannels] = useState<any[]>(initialData?.tvChannels || []);
  const [radioStations, setRadioStations] = useState<any[]>([]);
  const randomRadioStations = useMemo(() => {
    return [...radioStations].sort(() => 0.5 - Math.random());
  }, [radioStations]);

  const { location } = useAppLocation();
  const geo = useGeolocation();
  
  const lat = geo.lat ?? (location.latitude || 36.8065);
  const lng = geo.lng ?? (location.longitude || 10.1815);
  
  const prayerState = usePrayerTimes(lat, lng);
  const prayerTimings = prayerState.timings || { Fajr: '04:15', Dhuhr: '12:30', Asr: '16:15', Maghrib: '19:45', Isha: '21:15' };

  const [weatherData, setWeatherData] = useState<any>(null);
  
  const getWeatherIcon = (code: number) => {
      if (code === 0) return '☀️'; // Clear
      if (code === 1 || code === 2) return '⛅'; // Partly cloudy
      if (code === 3) return '☁️'; // Overcast
      if (code >= 45 && code <= 48) return '🌫️'; // Fog
      if (code >= 51 && code <= 67) return '🌧️'; // Rain/Drizzle
      if (code >= 71 && code <= 86) return '❄️'; // Snow
      if (code >= 95) return '⛈️'; // Thunderstorm
      return '🌤️';
  }

  const getWeatherDesc = (code: number) => {
      if (code === 0) return 'Clear';
      if (code <= 2) return 'Partial Cloud';
      if (code === 3) return 'Cloudy';
      if (code <= 48) return 'Fog';
      if (code <= 67) return 'Rain';
      if (code <= 86) return 'Snow';
      if (code >= 95) return 'Storm';
      return 'Clear';
  }

  useEffect(() => {
     async function fetchWeather() {
        try {
           const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
           const data = await res.json();
           setWeatherData(data);
        } catch(e: any) {}
     }
     fetchWeather();
  }, [lat, lng]);

  useEffect(() => {
    // Only reset news if we don't have initial data or if it's outdated
    if (!initialData?.topNews?.length) {
      setTopNews([]);
    }

    async function loadData() {
      const loadSecondaryData = async () => {
        try {
          const cachedTvStr = sessionStorage.getItem('tuniwave_tv');
          let shouldFetchTv = true;
          if (cachedTvStr) {
            const cachedTv = JSON.parse(cachedTvStr);
            if (cachedTv.timestamp && Date.now() - cachedTv.timestamp < 30 * 60 * 1000) {
              setTvChannels(cachedTv.data);
              shouldFetchTv = false;
            } else if (Array.isArray(cachedTv)) {
              setTvChannels(cachedTv); // Old format backward compat
            }
          }
          
          if (shouldFetchTv) {
            const tvQuery = query(collection(db, 'tv'), where('status', '==', 'active'), limit(30));
            const tvSnapshot = await getDocs(tvQuery);
            const tvData = tvSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Randomize and take 10 for the home page display
            const randomTv = [...tvData].sort(() => 0.5 - Math.random()).slice(0, 10);
            
            setTvChannels(randomTv);
            sessionStorage.setItem('tuniwave_tv', JSON.stringify({ data: randomTv, timestamp: Date.now() }));
          }
        } catch (err) {
          console.error('TV fetch error:', err);
        }

        try {
          const cachedRadioStr = sessionStorage.getItem('tuniwave_radio');
          let shouldFetchRadio = true;
          if (cachedRadioStr) {
            const cachedRadio = JSON.parse(cachedRadioStr);
            if (cachedRadio.timestamp && Date.now() - cachedRadio.timestamp < 30 * 60 * 1000) {
              setRadioStations(cachedRadio.data);
              shouldFetchRadio = false;
            } else if (Array.isArray(cachedRadio)) {
              setRadioStations(cachedRadio);
            }
          }
          
          if (shouldFetchRadio) {
            const radioQuery = query(collection(db, 'stations'), where('status', '==', 'active'), limit(12));
            const radioSnapshot = await getDocs(radioQuery);
            const radioData = radioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRadioStations(radioData);
            sessionStorage.setItem('tuniwave_radio', JSON.stringify({ data: radioData, timestamp: Date.now() }));
          }
        } catch (err) {
          console.error('Radio fetch error:', err);
        }
      };

      (async () => {
        // Load from cache first for instant render
        const currentLang = i18n.language.slice(0, 2).toLowerCase();
        let shouldFetchNews = true;
        try {
          const cachedNewsStr = sessionStorage.getItem(`tuniwave_top_news_${currentLang}`);
          if (cachedNewsStr) {
            const cachedNews = JSON.parse(cachedNewsStr);
            if (cachedNews.timestamp && Date.now() - cachedNews.timestamp < 15 * 60 * 1000) {
              setTopNews(cachedNews.data);
              setLoading(false);
              shouldFetchNews = false;
            } else if (Array.isArray(cachedNews)) {
              setTopNews(cachedNews);
              setLoading(false);
            }
          }
        } catch (e: any) {}
        
        // Always trigger secondary data load, it has its own cache logic now
        loadSecondaryData();
        
        if (!shouldFetchNews) return;

        try {
          const currentLangMap = i18n.language.slice(0, 2).toLowerCase();
          const sourcesCacheKey = `tuniwave_rss_sources_v1_${currentLangMap}`;
          const cachedSourcesStr = sessionStorage.getItem(sourcesCacheKey);
          let activeSourceIds: string[] = [];
          let sourceLanguageMap = new Map<string, string>();
          
          if (cachedSourcesStr) {
             const cached = JSON.parse(cachedSourcesStr);
             if (Date.now() - cached.timestamp < 60 * 60 * 1000) {
                 activeSourceIds = cached.data.activeSourceIds;
                 sourceLanguageMap = new Map(JSON.parse(cached.data.sourceLanguageMap || '[]'));
             }
          }

          if (activeSourceIds.length === 0) {
              const sourcesQuery = query(collection(db, 'rss'), where('status', '==', 'active'));
              const sourcesSnapshot = await getDocs(sourcesQuery);
              sourceLanguageMap = new Map<string, string>();
              sourcesSnapshot.docs.forEach(doc => {
                const data = doc.data();
                sourceLanguageMap.set(doc.id, data.language || data.Language || 'ar');
              });
              
              const currentLang = i18n.language.slice(0, 2).toLowerCase();
              activeSourceIds = Array.from(sourceLanguageMap.entries())
                .filter(([_, lang]) => {
                  const l = (lang || '').toLowerCase();
                  if (!l) return currentLang === 'ar';
                  return l.startsWith(currentLang) || 
                         (currentLang === 'ar' && (l.startsWith('ar') || l.startsWith('arabic'))) || 
                         (currentLang === 'en' && (l.startsWith('en') || l.startsWith('english'))) || 
                         (currentLang === 'fr' && (l.startsWith('fr') || l.startsWith('french')));
                })
                .map(([id]) => id);
              
              sessionStorage.setItem(sourcesCacheKey, JSON.stringify({
                  data: {
                      activeSourceIds,
                      sourceLanguageMap: JSON.stringify(Array.from(sourceLanguageMap.entries())),
                      sourceGenreMap: '[]'
                  },
                  timestamp: Date.now()
              }));
          }
          
          if (activeSourceIds.length > 0) {
             // Fetch recent articles to avoid composite index requirements
             const newsQuery = query(
               collection(db, 'rss_articles'),
               orderBy('pubDate', 'desc'),
               limit(100)
             );
             
             const snapshots = await getDocs(newsQuery);
             const allArticles: any[] = [];
             const activeSourceIdsSet = new Set(activeSourceIds);
             
             snapshots.forEach(doc => {
               const data = doc.data();
               if (activeSourceIdsSet.has(data.sourceId)) {
                 const pubDate = data.pubDate 
                   ? (typeof data.pubDate === 'number' ? data.pubDate : (data.pubDate.seconds ? data.pubDate.seconds * 1000 : new Date(data.pubDate).getTime())) 
                   : 0;
                 allArticles.push({
                   id: doc.id,
                   ...data,
                   imageUrl: getArticleImage(data),
                   thumbnail: getArticleImage(data),
                   pubDate: isNaN(pubDate) ? 0 : pubDate,
                   language: sourceLanguageMap.get(data.sourceId) || data.sourceLanguage || data.language || data.Language || 'ar',
                 });
               }
             });
             
             const finalArticles = allArticles.sort((a, b) => b.pubDate - a.pubDate);
             
             setTopNews(finalArticles);
             try {
               sessionStorage.setItem(`tuniwave_top_news_${currentLang}`, JSON.stringify({ data: finalArticles.slice(0, 30), timestamp: Date.now() }));
             } catch (e: any) {}
             return finalArticles;
          } else {
             setTopNews([]);
             return [];
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
        return [];
      })();

    }
    loadData();
  }, [i18n.language, initialData?.topNews?.length]);

  const breakingNews = topNews[0];

  return (
    <div 
      className={`flex flex-col h-full font-sans ${isArabic ? 'rtl' : 'ltr'} relative overflow-hidden`} 
      dir={isArabic ? 'rtl' : 'ltr'} 
      style={{ background: 'var(--bg-color)' }}
    >
      {/* Premium Cinematic Aurora Background */}
      <div className="absolute top-0 left-0 w-full h-[120vh] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-color)]/10 blur-[140px] animate-pulse duration-1000"></div>
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] rounded-full bg-[var(--accent-color)]/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-[var(--accent-color)]/5 blur-[150px]"></div>
      </div>
      
      <div className="relative z-10 w-full flex flex-col h-full">
      <SEO 
        title={t('TuniWave - Radio, TV & News Tunisia')}
        description={t('Listen to Tunisian radio, watch live TV, and get the latest sports and news updates in real-time.')}
        canonical={`https://tuniwave.com/${lang}`}
        preloadImage={topNews && topNews.length > 0 ? (topNews[0].imageUrl || topNews[0].thumbnail || "/regenerated_image_1777493176999.png") : undefined}
      />
      
      {/* Premium Hot Red Vols Reservation Banner */}
      <div className="w-full pb-3 mt-1 sm:mt-0 xl:px-0">
        <a 
          href="https://vols.tuniwave.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="rounded-none sm:rounded-[16px] overflow-hidden relative shadow-[0_4px_24px_rgba(229,9,20,0.35)] h-[76px] sm:h-[84px] bg-gradient-to-r from-red-600 via-[#ff3b30] to-red-500 text-white flex items-center px-5 sm:px-6 justify-between transition-transform duration-300 hover:scale-[1.005] hover:shadow-[0_8px_32px_rgba(229,9,20,0.4)] active:scale-[0.99] group shrink-0 w-full mx-auto"
        >
          {/* Animated Background Overlay */}
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none transform translate-x-32 group-hover:-translate-x-full duration-1000 transition-transform hidden sm:block"></div>
          <div className="absolute -top-20 -right-10 w-48 h-48 bg-white opacity-10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-4 w-full justify-between z-10 relative">
            <div className="flex items-center gap-3 sm:gap-5 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/25 sm:bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/40 shadow-inner backdrop-blur-md transition-colors group-hover:bg-white/30">
                <Plane className="w-7 h-7 sm:w-8 sm:h-8 text-white transform rotate-[-45deg] drop-shadow-md rtl:rotate-[135deg]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <div className="font-black text-[17px] sm:text-xl leading-tight tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                  {t('Vols Reservation')} 
                  <span className="hidden sm:flex bg-red-900/60 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shadow-sm border border-red-300/30">Premium</span>
                </div>
                <div className="text-[12px] sm:text-[14px] text-white/95 leading-tight mt-0.5 font-medium drop-shadow-sm">{t('Book Your Flight Now & Save Big!')}</div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="hidden sm:flex items-center justify-center bg-white text-red-600 font-bold uppercase text-[12px] px-6 py-2.5 rounded-lg shadow-md group-hover:bg-red-50 transition-colors tracking-wide whitespace-nowrap">
              {t('Book Now')}
            </div>
            {/* Mobile Arrow */}
            <div className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white backdrop-blur-sm">
              <ChevronRight className={`w-5 h-5 rtl:rotate-180`} />
            </div>
          </div>
        </a>
      </div>

      <div className="w-full pb-1 flex flex-col gap-1.5 lg:grid lg:grid-cols-12 xl:gap-2">
        {/* === CENTER MAIN FEED COLUMN === */}
        <div className="lg:col-span-6 flex flex-col gap-1.5 order-1 lg:order-2">
          {/* AdSense Placement Simulator */}
          <div className="w-full flex flex-col items-center shrink-0 my-1">
            <span className="text-[10px] text-[var(--text-color)]/40 uppercase tracking-widest mb-1.5 font-medium">{t('Advertisement')}</span>
            <div className="w-[320px] sm:w-[728px] max-w-full bg-[#f8f9fa] dark:bg-[#1a1a1a] shadow-sm border border-[#dadce0] dark:border-[#333] h-[50px] sm:h-[90px] flex items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
               {/* AdChoices Corner */}
               <div className="absolute top-0 right-0 bg-[#ffffff] dark:bg-[#000000] flex items-center shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="px-1 border-r border-[#dadce0] dark:border-[#333] cursor-pointer" title="AdChoices">
                    <svg viewBox="0 0 10 10" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 .5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm.5 7H4.5v-3h1v3zm-.5-4.5A.75.75 0 1 1 5 1.5a.75.75 0 0 1 0 1.5z" fill="#00A1F1"></path>
                    </svg>
                  </div>
                  <div className="px-1 cursor-pointer" title="Close Ad">
                    <svg viewBox="0 0 10 10" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.5 1.5L1.5 8.5M1.5 1.5l7 7" stroke="#5F6368" strokeWidth="1.2" strokeLinecap="round"></path>
                    </svg>
                  </div>
               </div>
               
               {/* Internal fake content for real feel */}
               <div className="flex flex-col items-center justify-center pt-2">
                 <span className="text-[#9aa0a6] dark:text-[#5f6368] text-[11px] font-medium hidden sm:block">Responsive Display Ad Placeholder (728x90)</span>
                 <span className="text-[#9aa0a6] dark:text-[#5f6368] text-[10px] font-medium sm:hidden">Display Ad (320x50)</span>
                 <img loading="lazy" src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_92x30dp.png" alt="Google" className="h-[14px] mt-1.5 opacity-20 grayscale hidden sm:block" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               </div>
            </div>
          </div>

          {/* Customized Al Jazeera News Widget */}
           {(loading && !topNews.length) ? (
             <NewsSkeleton />
           ) : topNews.length > 0 && (
           <div className="bg-[var(--card-bg)] rounded-[16px] border border-[var(--border-color)] backdrop-blur-xl overflow-hidden font-sans relative shadow-2xl h-fit flex flex-col">
             <Link to={`/${lang}/news/${breakingNews.slug || breakingNews.id}`} className="relative h-[220px] sm:h-[280px] lg:h-[450px] xl:h-[500px] w-full block group shrink-0">
             <img 
              src={topNews[0].imageUrl || topNews[0].thumbnail || "/regenerated_image_1777493176999.png"}
              alt={topNews[0].title}
              width="800"
              height="500"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
              fetchPriority="high"
              loading="eager"
              onError={(e) => {
                e.currentTarget.onerror = null; // prevents looping
                e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
            
            <div className="absolute top-4 left-4 z-10 flex flex-col items-center pointer-events-none">
                <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-12 lg:h-12 text-white/90 backdrop-blur-md bg-black/20 rounded-full p-1.5 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <svg viewBox="0 0 100 100" fill="white">
                     <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 85C30.7 85 15 69.3 15 50S30.7 15 50 15s35 15.7 35 35-15.7 35-35 35z" opacity="0.4"/>
                     <path d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" />
                     <path d="M50 35c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z" />
                  </svg>
                </div>
                <span className="text-white text-[7px] sm:text-[9px] font-[800] tracking-[0.1em] mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">ALJAZEERA</span>
            </div>

            <div className="absolute bottom-0 left-0 w-full pt-20 pb-4 px-4 lg:pb-6 lg:px-6 z-10 pointer-events-none bg-gradient-to-t from-black/80 to-transparent">
              <div className="inline-flex items-center gap-2 bg-[var(--accent-color)]/90 backdrop-blur-md border border-[var(--border-color)] text-white text-[10px] lg:text-[12px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 shadow-[0_4px_12px_rgba(var(--accent-color-rgb),0.4)]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>BREAKING
              </div>
              <h2 className="text-white font-[800] text-[20px] sm:text-[28px] lg:text-[34px] xl:text-[42px] leading-[1.15] tracking-tight mb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] line-clamp-3">
                {topNews[0].title}
              </h2>
            </div>
          </Link>

          <div className="relative px-3 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3">
             <button aria-label={t('Scroll left')} onClick={() => { const c = document.getElementById('aljazeera-carousel'); if (c) c.scrollBy({ left: isArabic ? 200 : -200, behavior: 'smooth' }); }} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 text-[var(--text-color)]/70 hover:text-[var(--text-color)] bg-[var(--card-bg)] p-0.5 rounded">
               {isArabic ? <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} /> : <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />}
             </button>
             <div id="aljazeera-carousel" className="flex gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden px-3">
                {topNews.slice(1, 6).map((news, i) => (
                  <Link to={`/${lang}/news/${news.slug || news.id}`} key={i} className="w-[125px] sm:w-[145px] lg:w-[160px] shrink-0 flex flex-col cursor-pointer group">
                    <div className="h-[65px] sm:h-[80px] lg:h-[90px] w-full rounded-md overflow-hidden mb-2 relative">
                       <img loading="lazy" width="160" height="90" decoding="async" src={news.imageUrl || news.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80"} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={news.title} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80"; }} />
                    </div>
                    <h3 className="text-[var(--text-color)]/90 text-[12px] sm:text-[13px] font-semibold leading-[1.3] group-hover:text-[var(--text-color)] line-clamp-2">
                      {news.title}
                    </h3>
                  </Link>
                ))}
             </div>
             <button aria-label={t('Scroll right')} onClick={() => { const c = document.getElementById('aljazeera-carousel'); if (c) c.scrollBy({ left: isArabic ? -200 : 200, behavior: 'smooth' }); }} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 text-[var(--text-color)]/70 hover:text-[var(--text-color)] bg-[var(--card-bg)] p-0.5 rounded">
               {isArabic ? <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} /> : <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />}
             </button>
          </div>
        </div>
        )}
        {/* Video News Carousel */}
        <div className="bg-[var(--card-bg)] rounded-[16px] border border-[var(--border-color)] shadow-sm backdrop-blur-xl relative overflow-hidden flex flex-col text-[var(--text-color)] w-full mb-4">
        {(loading && topNews.length < 8) ? (
          <div className="p-4"><CarouselSkeleton /></div>
        ) : topNews.length > 7 && (
          <div className="flex flex-col">
            <div className="h-[4px] w-full bg-[var(--accent-color)]" />
            <div className="p-4">
              <div className="pb-3 border-b border-[var(--border-color)] flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-[14px] h-[14px] bg-[var(--accent-color)] shrink-0 rounded-[2px] shadow-[0_0_8px_rgba(var(--accent-color-rgb),0.5)]"></div>
                  <h2 className="text-[17px] lg:text-[19px] font-black text-[var(--text-color)] tracking-tight flex items-center gap-2">
                    {t('Video News')}
                    <span className="bg-red-600 text-[10px] px-1.5 py-0.5 rounded-sm animate-pulse uppercase tracking-wider text-white">{t('Live')}</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button aria-label={t('Scroll left')} onClick={() => {
                    const c = document.getElementById('video-news-carousel');
                    if (c) c.scrollBy({ left: isArabic ? 200 : -200, behavior: 'smooth' });
                  }} className="bg-[var(--hover-bg)] hover:bg-[var(--accent-color)]/20 p-1.5 rounded-full transition-colors text-[var(--text-color)]">
                    {isArabic ? <ChevronRight className="w-4 h-4" strokeWidth={3} /> : <ChevronLeft className="w-4 h-4" strokeWidth={3} />}
                  </button>
                  <button aria-label={t('Scroll right')} onClick={() => {
                    const c = document.getElementById('video-news-carousel');
                    if (c) c.scrollBy({ left: isArabic ? -200 : 200, behavior: 'smooth' });
                  }} className="bg-[var(--hover-bg)] hover:bg-[var(--accent-color)]/20 p-1.5 rounded-full transition-colors text-[var(--text-color)]">
                    {isArabic ? <ChevronLeft className="w-4 h-4" strokeWidth={2.5} /> : <ChevronRight className="w-4 h-4" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            
            <div id="video-news-carousel" className="flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden pt-2">
              {topNews.slice(7, 12).map((news, i) => {
                const words = news.title.split(' ');
                const titleLines = [];
                const shortWords = words.slice(0, 8);
                
                for (let j = 0; j < shortWords.length; j += 3) {
                  const line = shortWords.slice(j, j + 3).join(' ');
                  if (line) titleLines.push(line);
                }
                
                if (words.length > 8 && titleLines.length > 0) {
                  titleLines[titleLines.length - 1] += '...';
                }
                
                const lines = titleLines.slice(0, 3);
                
                return (
                  <Link to={`/${lang}/news/${news.slug || news.id}`} key={`video-${i}`} className="w-[160px] shrink-0 flex flex-col font-sans group">
                    <div className="relative h-[240px] w-full mb-3 overflow-hidden rounded-[4px] bg-black/40 shadow-lg border border-[var(--border-color)]/30">
                       <img 
                         src={news.imageUrl || news.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=300&q=80"} 
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                         alt={news.title} 
                         referrerPolicy="no-referrer"
                         onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=300&q=80"; }}
                       />
                       
                       <div className="absolute top-2 right-2 w-7 h-7 bg-[var(--accent-color)] flex items-center justify-center rounded-sm z-10 shadow-lg border border-white/20">
                         <Play className="w-4 h-4 text-white fill-current" />
                       </div>
                       
                       <div className="absolute bottom-4 right-2 left-2 flex flex-col items-start gap-[4px] z-10 pointer-events-none" dir={isArabic ? 'rtl' : 'ltr'}>
                         {lines.map((line, idx) => (
                           <span key={idx} className="bg-black/80 text-white font-black text-[11px] px-2 py-[3px] w-fit max-w-[98%] whitespace-nowrap overflow-hidden leading-tight shadow-xl border-l-[3px] border-red-600">{line}</span>
                         ))}
                       </div>
                       
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
                    </div>
                    
                    <h3 className={`font-bold text-[13px] leading-[1.3] text-[var(--text-color)] group-hover:text-[var(--accent-color)] line-clamp-2 text-start ps-1 transition-colors duration-300`} dir={isArabic ? 'rtl' : 'ltr'}>
                      {news.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* === CENTER SPORTS WIDGET === */}
        <HomeSportsWidget />
        
      </div>

      {/* === LEFT SIDEBAR COLUMN === */}
      <div className="lg:col-span-3 flex flex-col gap-1.5 order-2 lg:order-1">
        <LazyLoad rootMargin="300px" minHeight="300px">
          <TodayTV channels={tvChannels} />
        </LazyLoad>
        
        {/* Top News */}
        <div className="bg-[var(--card-bg)] rounded-[16px] p-3 shadow-none border border-[var(--border-color)] backdrop-blur-xl relative overflow-hidden text-[var(--text-color)]">
          <h2 className="font-semibold uppercase tracking-[0.2em] text-[11px] lg:text-[12px] text-[var(--text-color)]/70 mb-3 flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-[var(--accent-color)] " /> {t('Top News')}</h2>
          <div className="flex flex-col gap-2">
            {topNews.slice(12, 17).map((news, i) => (
              <Link to={`/${lang}/news/${news.slug || news.id}`} key={i} className="bg-[var(--card-bg)] rounded-[12px] border border-[var(--border-color)] p-2 flex justify-between items-center gap-2.5 shadow-sm hover:border-[var(--accent-color)] transition-colors">
                <span className="text-[12px] font-[600] text-[var(--text-color)] leading-[1.35] line-clamp-2">
                  {news.title}
                </span>
                <img loading="lazy" width="64" height="64" decoding="async" src={news.imageUrl || news.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=150&q=80"} alt={news.title} className="w-[44px] h-[44px] lg:w-[64px] lg:h-[64px] rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=150&q=80"; }} />
              </Link>
            ))}
            {topNews.length < 12 && Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-[var(--hover-bg)] animate-pulse rounded-[10px] h-[60px]"></div>
            ))}
          </div>
        </div>

          {/* Global Radio */}
          <div className="bg-[var(--card-bg)] rounded-[16px] p-3 shadow-none border border-[var(--border-color)] backdrop-blur-xl relative overflow-hidden text-[var(--text-color)] group shrink-0 h-fit">
            <div className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-105">
              <img loading="lazy" src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80" alt="Global Radio" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/60 to-[var(--accent-color)]/40 backdrop-blur-[2px]"></div>
            </div>
            <div className="flex justify-between items-end mb-5 relative z-10">
              <h2 className="font-semibold uppercase tracking-[0.2em] text-[11px] lg:text-[12px] text-white/90 flex items-center gap-1.5 drop-shadow-md"><Radio className="w-5 h-5 text-white animate-pulse" /> {t('Global Radio')}</h2>
              <span className="text-[11px] text-white/60 font-medium flex items-center gap-1 drop-shadow-md"><Crown className="w-3.5 h-3.5 text-[var(--accent-color)]" /> {t('100+ Premium Stations')}</span>
            </div>
            <div className="relative group/carousel z-10 -mt-2">
              <button aria-label={t('Scroll left')} onClick={(e) => { e.preventDefault(); const c = document.getElementById('global-radio-carousel'); if (c) c.scrollBy({ left: isArabic ? 200 : -200, behavior: 'smooth' }); }} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 text-[var(--text-color)]/70 hover:text-[var(--text-color)] bg-[var(--card-bg)]/80 hover:bg-[var(--card-bg)] border border-[var(--border-color)] p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-sm">
                {isArabic ? <ChevronRight className="w-4 h-4" strokeWidth={2.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />}
              </button>
              <div id="global-radio-carousel" className="flex gap-4 overflow-x-auto pb-4 pt-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {randomRadioStations.length > 0 ? (
                randomRadioStations.map((radio, i) => (
                  <Link 
                    to={`/${lang}/radio/${radio.slug || radio.id}`} 
                    key={i} 
                    className="flex-shrink-0 relative group touch-pan-x" 
                    title={radio.name}
                  >
                    <div className="w-[62px] h-[62px] bg-[var(--card-bg)] rounded-full overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.3)] border-2 border-[var(--border-color)] transition-all duration-300 group-hover:scale-110 flex items-center justify-center will-change-transform">
                      {radio.logo_url ? (
                        <img loading="lazy" src={radio.logo_url} alt={radio.name} className="w-full h-full object-contain p-0.5 transition-transform group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full bg-[var(--card-bg)] flex items-center justify-center">
                          <span className="font-black text-[11px] text-[var(--text-color)] leading-[1] text-center px-1 truncate uppercase">{radio.name.slice(0, 3)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-lg z-20 overflow-hidden pointer-events-none">
                      <img loading="lazy" src={getFlagUrl(radio.country)} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-[var(--text-color)]/70 text-sm py-2 mx-auto">{t('Loading Radio...')}</div>
              )}
              </div>
              <button aria-label={t('Scroll right')} onClick={(e) => { e.preventDefault(); const c = document.getElementById('global-radio-carousel'); if (c) c.scrollBy({ left: isArabic ? -200 : 200, behavior: 'smooth' }); }} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 text-[var(--text-color)]/70 hover:text-[var(--text-color)] bg-[var(--card-bg)]/80 hover:bg-[var(--card-bg)] border border-[var(--border-color)] p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-sm">
                {isArabic ? <ChevronLeft className="w-4 h-4" strokeWidth={2.5} /> : <ChevronRight className="w-4 h-4" strokeWidth={2.5} />}
              </button>
            </div>
          </div>
      </div>

      {/* === RIGHT SIDEBAR COLUMN === */}
      <div className="lg:col-span-3 flex flex-col gap-1.5 order-3">
          
          {/* Premium Weather */}
          <div className="bg-[var(--card-bg)] rounded-[16px] shadow-none border border-[var(--border-color)] backdrop-blur-xl relative overflow-hidden h-fit group transition-all duration-300 hover:shadow-md mb-2">
             <div className="relative h-[160px] rounded-[16px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 dark:from-sky-900 dark:to-blue-950"></div>
                <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
                <div className="relative z-20 p-4 pb-2">
                  <h2 className="font-semibold uppercase tracking-[0.2em] text-[11px] lg:text-[12px] text-white/90 flex items-center gap-1.5 drop-shadow-md"><Sun className="w-5 h-5 text-amber-300" /> {t('Premium Weather')}</h2>
                </div>
                {weatherData && weatherData.current_weather ? (
                  <>
                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center" dir="ltr">
                       <div className="text-white text-5xl font-black drop-shadow-lg tracking-tighter">{Math.round(weatherData.current_weather.temperature)}°C</div>
                       <div className="text-white text-sm font-bold drop-shadow text-right leading-tight">
                         <div>{t(getWeatherDesc(weatherData.current_weather.weathercode))}</div>
                         <div className="text-white/80 font-medium text-xs mt-0.5">{location.city || t('Tunis')}</div>
                       </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end border-t border-white/20 pt-3" dir="ltr">
                       {weatherData.daily.time.slice(0, 5).map((timeStr: string, i: number) => {
                          const date = new Date(timeStr);
                          let dayName = date.toLocaleDateString(i18n.language, { weekday: 'short' });
                          if (i === 0) dayName = t('Today');
                          const maxTemp = Math.round(weatherData.daily.temperature_2m_max[i]);
                          const code = weatherData.daily.weathercode[i];
                          return (
                            <div key={i} className="flex flex-col items-center">
                               <span className="text-[12px] text-white/90 font-medium drop-shadow">{dayName}</span>
                               <span className="text-lg my-0.5 drop-shadow-sm">{getWeatherIcon(code)}</span>
                               <span className="text-[12px] text-white font-bold drop-shadow">{maxTemp}°C</span>
                            </div>
                          );
                       })}
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[var(--text-color)]/80 text-sm font-medium animate-pulse">{t('Loading weather...')}</div>
                  </div>
                )}
             </div>
          </div>

          {/* Premium Islamiyat */}
          <div className="bg-[var(--card-bg)] rounded-[16px] shadow-none border border-[var(--border-color)] backdrop-blur-xl relative overflow-hidden h-fit relative group">
            <div className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-105">
               <img loading="lazy" src="https://images.theconversation.com/files/154423/original/image-20170126-30419-kxr9hb.jpg?ixlib=rb-4.1.0&q=75&auto=format&w=768&h=512&fit=crop&dpr=1" alt="Islamiyat Background" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               <div className="absolute inset-0 bg-black/60 shadow-inner backdrop-blur-[2px]"></div>
            </div>
            <Link to={`/${lang}/islamiyat`} className="relative z-10 block pb-2">
              <div className="flex justify-between items-start p-3 pb-0">
                <h2 className="font-semibold uppercase tracking-[0.2em] text-[11px] lg:text-[12px] text-white/90 flex items-center gap-1.5 drop-shadow-md"><MoonStar className="w-5 h-5 text-amber-400 " /> {t('Premium Islamiyat')}</h2>
                <span className="text-[11px] text-white/70 font-medium flex items-center gap-1 drop-shadow-md mt-1"><Crown className="w-3.5 h-3.5 text-amber-500" /> {t('Premium Tools')}</span>
              </div>
              <div className="relative flex justify-between items-end p-3 pb-2 mt-2">
                {prayerState.loading ? (
                  <div className="w-full text-center text-white/80 py-2 text-sm font-medium">{t('Loading prayer times...')}</div>
                ) : (
                  [
                    { name: t('Fajr'), time: prayerTimings.Fajr, icon: <Sunrise className="w-4 h-4 text-white/90" /> },
                    { name: t('Dhuhr'), time: prayerTimings.Dhuhr, icon: <Sun className="w-4 h-4 text-white/90" /> },
                    { name: t('Asr'), time: prayerTimings.Asr, icon: <CloudSun className="w-4 h-4 text-white/90" /> },
                    { name: t('Maghrib'), time: prayerTimings.Maghrib, icon: <Sunset className="w-4 h-4 text-white/90" /> },
                    { name: t('Isha'), time: prayerTimings.Isha, icon: <Moon className="w-4 h-4 text-white/90" /> },
                  ].map((prayer, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="mb-0.5 drop-shadow-md">{prayer.icon}</div>
                      <span className="text-[11px] sm:text-[13px] font-bold text-white/90 leading-tight drop-shadow">{prayer.name}</span>
                      <span className="text-[12px] sm:text-xs text-white/80 font-mono tracking-wide mt-0.5 drop-shadow">{prayer.time}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between items-center text-center p-3 sm:px-6 pt-5 border-t border-white/20 mt-1">
                 {[
                    { label: t('Quran'), icon: '📖' },
                    { label: t('Hadith'), icon: '📚' },
                    { label: t('Qibla'), icon: '🧭' },
                    { label: t('Zakat'), icon: '💰' },
                    { label: t('Duas'), icon: '🤲' },
                 ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="text-xl sm:text-2xl mb-1 text-[var(--text-color)] opacity-95 drop-shadow-md">{item.icon}</div>
                      <span className="text-[11px] font-bold text-[var(--text-color)] leading-tight drop-shadow-md">{item.label}</span>
                    </div>
                 ))}
              </div>
            </Link>
          </div>
          
        </div>
      </div>
      
      </div>
    </div>
  );
}