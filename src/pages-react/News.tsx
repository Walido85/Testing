import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Link } from '../utils/navigation';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  link: string;
  pubDate: number;
  thumbnail: string | null;
  sourceName: string;
  sourceLogo: string;
  genre: string;
  language?: string;
  imageUrl?: string;
}

const SkeletonCard = () => (
  <div className="flex items-start gap-4 p-3 rounded-xl border animate-pulse" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
    <div className="flex-1 space-y-3">
      <div className="h-5 bg-[var(--card-bg)]0/20 rounded w-full" />
      <div className="h-5 bg-[var(--card-bg)]0/20 rounded w-4/5" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-[var(--card-bg)]0/20 rounded w-full" />
        <div className="h-3 bg-[var(--card-bg)]0/20 rounded w-2/3" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <div className="w-5 h-5 rounded-full bg-[var(--card-bg)]0/20" />
        <div className="h-3 bg-[var(--card-bg)]0/20 rounded w-20" />
      </div>
    </div>
    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-[var(--card-bg)]0/20 flex-shrink-0" />
  </div>
);

const HeroSkeleton = () => (
  <div className="w-full min-h-[300px] sm:min-h-[400px] rounded-2xl border animate-pulse overflow-hidden flex flex-col justify-end p-6 sm:p-8 space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
    <div className="absolute inset-0 bg-[var(--card-bg)]0/10" />
    <div className="relative space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--card-bg)]0/20" />
        <div className="h-4 bg-[var(--card-bg)]0/20 rounded w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-[var(--card-bg)]0/20 rounded w-full" />
        <div className="h-8 bg-[var(--card-bg)]0/20 rounded w-3/4" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-[var(--card-bg)]0/20 rounded w-full" />
        <div className="h-4 bg-[var(--card-bg)]0/20 rounded w-2/3" />
      </div>
    </div>
  </div>
);

function timeAgo(timestamp: any, t: any, isArabic: boolean) {
  // Defensive normalization of timestamp to ensure it's a number
  let ts = timestamp;
  if (typeof ts === 'object' && ts !== null && ts.seconds) {
    ts = ts.seconds * 1000;
  } else if (typeof ts === 'string') {
    ts = new Date(ts).getTime();
  } else if (typeof ts !== 'number') {
    ts = 0;
  }
  
  if (!ts || isNaN(ts) || ts === 0) return ''; // Return empty if invalid to avoid "Invalid Date"

  const diff = (Date.now() - ts) / 1000;
  if (diff < 60 && diff >= 0) return isArabic ? "منذ لحظات" : t("Just now");
  if (diff < 3600 && diff >= 0) return isArabic ? `منذ ${Math.floor(diff / 60)} دقيقة` : `${Math.floor(diff / 60)}m`;
  if (diff < 86400 && diff >= 0) return isArabic ? `منذ ${Math.floor(diff / 3600)} ساعة` : `${Math.floor(diff / 3600)}h`;
  
  const date = new Date(ts);
  try {
    return isArabic 
      ? date.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString();
  } catch (e) {
    return '';
  }
}

export default function News({ initialData, initialGenres }: { initialData?: Article[], initialGenres?: string[] }) {
  const { t, i18n } = useTranslation();
  const { lang } = useLanguage();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const urlGenre = searchParams.get('genre');
  const searchQuery = searchParams.get('q');

  const isArabic = i18n.language === 'ar';
  
  const [articles, setArticles] = useState<Article[]>(initialData || []);
  const [genres, setGenres] = useState<string[]>(() => {
    if (initialGenres && initialGenres.length > 0) return initialGenres;
    if (initialData && initialData.length > 0) {
      const uniqueGenres = Array.from(new Set(initialData.map((s: any) => s.genre).filter(Boolean)));
      return ['All', ...(uniqueGenres as string[])];
    }
    return ['All'];
  });
  const [activeGenre, setActiveGenre] = useState<string>(urlGenre || 'All');
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);

  // Sync state with URL and handle browser back/forward buttons
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const genre = params.get('genre') || 'All';
      setActiveGenre(genre);
      setVisibleCount(20);
    };

    window.addEventListener('popstate', syncFromUrl);
    
    // Sync immediately on mount
    syncFromUrl();

    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const handleGenreChange = (genre: string) => {
    if (genre === activeGenre) return;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveGenre(genre);
    setVisibleCount(20);
    
    // Update browser URL without triggering a navigation — genre filter is pure client-side state
    const baseUrl = `/${lang}/news/`;
    const newUrl = genre === 'All' ? baseUrl : `${baseUrl}?genre=${encodeURIComponent(genre)}`;
    window.history.pushState({}, '', newUrl);
  };
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const fetchNews = useCallback(async () => {
    // Only show loading if we don't already have articles to display
    if (articles.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const currentLang = i18n.language.slice(0, 2).toLowerCase();
      
      // 1. Fetch active source IDs from 'rss'
      const sourcesQuery = query(collection(db, 'rss'), where('status', '==', 'active'));
      const sourcesSnapshot = await getDocs(sourcesQuery);
      
      const sourceLanguageMap = new Map<string, string>();
      const sourceGenreMap = new Map<string, string>();
      const availableGenres = new Set<string>(['All']);
      
      sourcesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const sLang = (data.language || 'ar').toLowerCase();
        const isMatch = sLang.startsWith(currentLang) || 
                        (currentLang === 'ar' && sLang.startsWith('arabic')) || 
                        (currentLang === 'en' && sLang.startsWith('english')) || 
                        (currentLang === 'fr' && sLang.startsWith('french'));
        
        if (isMatch) {
          sourceLanguageMap.set(doc.id, data.language || 'ar');
          const genre = data.genre || 'General';
          sourceGenreMap.set(doc.id, genre);
          availableGenres.add(genre);
        }
      });
      
      const activeSourceIds = Array.from(sourceLanguageMap.keys());
      setGenres(Array.from(availableGenres));

      if (activeSourceIds.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      // 2. Fetch articles from 'rss_articles' ordering by date to avoid composite index requirements
      const newsQuery = query(
        collection(db, 'rss_articles'),
        orderBy('pubDate', 'desc'),
        limit(200)
      );
      
      const snapshots = await getDocs(newsQuery);
      const allArticles: any[] = [];
      const activeSourceIdsSet = new Set(activeSourceIds);
      
      snapshots.forEach(doc => {
        const d = doc.data();
        if (activeSourceIdsSet.has(d.sourceId)) {
          allArticles.push({
            id: doc.id,
            ...d,
            thumbnail: d.imageUrl || d.thumbnail || undefined,
            sourceName: d.sourceName,
            genre: sourceGenreMap.get(d.sourceId) || d.genre || 'General',
            language: sourceLanguageMap.get(d.sourceId) || d.sourceLanguage || d.language || 'ar',
            pubDate: d.pubDate 
              ? (typeof d.pubDate === 'number' ? d.pubDate : (d.pubDate.seconds ? d.pubDate.seconds * 1000 : new Date(d.pubDate).getTime())) 
              : 0
          } as Article);
        }
      });

      // Sort and final data prep
      const finalArticles = (allArticles as Article[])
        .sort((a, b) => b.pubDate - a.pubDate);

      setArticles(finalArticles);
      
      // Update active genre if it was set in URL but not yet reflected in filtering
      const params = new URLSearchParams(window.location.search);
      const urlGenre = params.get('genre');
      if (urlGenre && urlGenre !== activeGenre) {
        setActiveGenre(urlGenre);
      }
      
      try {
        sessionStorage.setItem(`tuniwave_all_news_${currentLang}`, JSON.stringify({ data: finalArticles, timestamp: Date.now() }));
      } catch (e) {}
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch News Error:', err);
      setError(t('Failed to load news. Please try again later.'));
      setLoading(false);
    }
  }, [i18n.language, t]);

  useEffect(() => {
    // We always run fetchNews on mount/lang-change to ensure 
    // the genre list is complete from the RSS config, 
    // even if initialData was small.
    fetchNews();
  }, [fetchNews]);

  const filteredArticles = useMemo(() => {
    let filtered = articles;
    if (activeGenre !== 'All') {
      const normalizedActiveGenre = activeGenre.trim().toLowerCase();
      filtered = filtered.filter(a => a.genre?.trim().toLowerCase() === normalizedActiveGenre);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [articles, activeGenre, searchQuery]);

  const displayedArticles = filteredArticles.slice(0, visibleCount);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getInitialsBg = (name: string) => {
    const colors = ['var(--accent-color)', 'var(--success-color)'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className={`flex flex-col h-full font-sans ${isArabic ? 'rtl' : 'ltr'}`} style={{ background: 'var(--bg-color)' }}>
      <SEO 
        title={activeGenre !== 'All' 
            ? `${t(activeGenre)} - ${t('TuniWave News')}`
            : t('Latest Tunisia News & Headlines')
        }
        description={activeGenre !== 'All' 
            ? `${t('Latest')} ${t(activeGenre)} ${t('news and updates from Tunisia. Get informed on top stories from reliable sources.')}`
            : t('Stay informed with the latest news from Tunisia. Politics, economy, culture, and more from reliable sources.')
        }
        canonical={`https://tuniwave.com/${lang}/news${activeGenre !== 'All' ? `?genre=${activeGenre}` : ''}`}
        breadcrumb={[
          { name: t('Home'), item: `/${lang}` },
          { name: t('News'), item: `/${lang}/news` },
          ...(activeGenre !== 'All' ? [{ name: t(activeGenre), item: `/${lang}/news?genre=${activeGenre}` }] : [])
        ]}
      />

      {/* Top Mobile Navigation (Hidden on lg) */}
      <div className="lg:hidden sticky top-[60px] z-30 bg-[var(--bg-color)] border-b border-[var(--border-color)]">
        <div className="flex items-center overflow-x-auto hide-scrollbar px-2 h-14">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreChange(genre)}
              className="relative px-4 h-full flex items-center justify-center whitespace-nowrap text-[14px] font-bold tracking-wide transition-colors"
              style={{ 
                color: activeGenre === genre ? 'var(--accent-color)' : 'var(--text-color)',
                opacity: activeGenre === genre ? 1 : 0.7 
              }}
            >
              {t(genre)}
              {activeGenre === genre && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--accent-color)] rounded-t-full shadow-[0_-2px_8px_rgba(var(--accent-color-rgb),0.4)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full py-2 sm:py-4">
        {error ? (
          <div className="p-8 text-center bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
            <AlertCircle className="w-12 h-12 text-[var(--danger-color)] mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Oops!</h2>
            <p className="opacity-70">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-4">
            <HeroSkeleton />
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR: Categories (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-2">
               <div className="sticky top-[90px] pr-2" style={{ borderRight: isArabic ? 'none' : '1px solid var(--border-color)', borderLeft: isArabic ? '1px solid var(--border-color)' : 'none' }}>
                  <h3 className="font-bold text-[18px] mb-4" style={{ color: 'var(--text-color)' }}>{t('Categories')}</h3>
                  <div className="flex flex-col space-y-1">
                    {genres.map(genre => (
                       <button
                         key={genre}
                         onClick={() => handleGenreChange(genre)}
                         className="flex items-center text-start px-3 py-2.5 rounded-lg text-[15px] font-semibold transition-all"
                         style={{ 
                           backgroundColor: activeGenre === genre ? 'var(--card-bg)' : 'transparent',
                           color: activeGenre === genre ? 'var(--accent-color)' : 'var(--text-color)',
                           opacity: activeGenre === genre ? 1 : 0.7 
                         }}
                       >
                         {t(genre)}
                       </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* CENTER COLUMN: Main News Feed */}
            <div className="lg:col-span-7 flex flex-col gap-8 pb-12">
               
               {/* 1. HERO GRID (Top 3 articles) */}
               {displayedArticles.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Main Hero (Left/Top) */}
                    <Link 
                      to={`/${lang}/news/${displayedArticles[0].slug || displayedArticles[0].id}`} 
                      className="md:col-span-8 group block relative rounded-[12px] overflow-hidden shadow-sm border"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                    >
                        <div className="w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                           <img 
                             loading="eager" 
                             src={displayedArticles[0].thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop'} 
                             alt="" 
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                             onError={(e) => {
                               (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop';
                             }}
                             referrerPolicy="no-referrer"
                             fetchPriority="high"
                           />
                        </div>
                        <div className="p-4 sm:p-5 flex flex-col">
                           <span className="text-[var(--accent-color)] text-[12px] font-bold uppercase tracking-wider mb-2">
                             {t(displayedArticles[0].genre || 'General')}
                           </span>
                           <h2 className="text-[22px] sm:text-[28px] leading-[1.2] font-bold mb-3 group-hover:text-[var(--accent-color)] transition-colors line-clamp-3" style={{ color: 'var(--text-color)' }}>
                             {displayedArticles[0].title}
                           </h2>
                           <p className="text-[14px] sm:text-[15px] line-clamp-2 opacity-80 mb-4" style={{ color: 'var(--text-color)' }}>
                             {displayedArticles[0].description}
                           </p>
                           <div className="flex items-center gap-2 text-[12px] font-medium opacity-70 mt-auto" style={{ color: 'var(--text-color)' }}>
                             {displayedArticles[0].sourceLogo ? (
                               <img loading="lazy" src={displayedArticles[0].sourceLogo} alt={displayedArticles[0].sourceName} className="w-5 h-5 rounded-full object-cover shadow-sm" />
                             ) : (
                               <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold" style={{ backgroundColor: getInitialsBg(displayedArticles[0].sourceName) }}>
                                  {getInitials(displayedArticles[0].sourceName)}
                               </div>
                             )}
                             <span>{displayedArticles[0].sourceName} &bull; {timeAgo(displayedArticles[0].pubDate, t, isArabic)}</span>
                           </div>
                        </div>
                    </Link>

                    {/* Sub Heroes (Right - Articles 1 and 2) */}
                    {displayedArticles.length > 1 && (
                      <div className="md:col-span-4 flex flex-col gap-4">
                         {displayedArticles.slice(1, 3).map(article => (
                           <Link
                             key={article.id}
                             to={`/${lang}/news/${article.slug || article.id}`}
                             className="flex-1 group flex flex-col rounded-[12px] overflow-hidden shadow-sm border"
                             style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                           >
                              <div className="w-full aspect-[16/9] overflow-hidden">
                                 <img loading="lazy" 
                                   src={article.thumbnail || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop'} 
                                   alt="" 
                                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                   onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop')}
                                   referrerPolicy="no-referrer"
                                 />
                              </div>
                              <div className="p-3 sm:p-4 flex flex-col flex-1">
                                 <h3 className="text-[16px] sm:text-[18px] font-bold leading-[1.3] group-hover:text-[var(--accent-color)] transition-colors line-clamp-3 mb-2" style={{ color: 'var(--text-color)' }}>
                                   {article.title}
                                 </h3>
                                 <div className="flex items-center gap-2 text-[11px] font-medium opacity-70 mt-auto" style={{ color: 'var(--text-color)' }}>
                                   <span>{article.sourceName} &bull; {timeAgo(article.pubDate, t, isArabic)}</span>
                                 </div>
                              </div>
                           </Link>
                         ))}
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center pt-16">
                    <div className="text-[var(--news-text-secondary)] font-bold">{t('No articles found')}</div>
                 </div>
               )}

               {/* 2. LATEST NEWS LIST */}
               {displayedArticles.length > 3 && (
                 <div>
                    <h2 className="font-bold text-[20px] mb-4 pb-2 border-b uppercase tracking-wide" style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                       {t('Latest News')}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {displayedArticles.slice(3).map((article) => (
                        <Link
                          key={article.id}
                          to={`/${lang}/news/${article.slug || article.id}`}
                          className="flex rounded-[12px] p-3 sm:p-4 gap-4 shadow-sm border group hover:shadow-md transition-all items-stretch bg-opacity-50"
                          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                        >
                          <div className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] flex-shrink-0 overflow-hidden rounded-[8px]">
                            <img 
                              loading="lazy"
                              src={article.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop'} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-[var(--hover-bg)]"
                              onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop')}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <h3 className="text-[16px] sm:text-[19px] font-bold leading-[1.3] transition-colors line-clamp-3 mb-2 text-start group-hover:text-[var(--accent-color)]" style={{ color: 'var(--text-color)' }}>
                              {article.title}
                            </h3>
                            <p className="hidden sm:block text-[14px] line-clamp-2 opacity-70 mb-3" style={{ color: 'var(--text-color)' }}>
                               {article.description}
                            </p>
                            <div className="flex items-center gap-2 text-[12px] font-medium opacity-70 mt-auto" style={{ color: 'var(--text-color)' }}>
                              {article.sourceLogo ? (
                                <img loading="lazy" src={article.sourceLogo} alt={article.sourceName} className="w-5 h-5 rounded-full object-cover shadow-sm" />
                              ) : (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold" style={{ backgroundColor: getInitialsBg(article.sourceName) }}>
                                   {getInitials(article.sourceName)}
                                </div>
                              )}
                              <span>{article.sourceName} &bull; {timeAgo(article.pubDate, t, isArabic)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Load More Button */}
                    {visibleCount < filteredArticles.length && (
                      <div className="flex justify-center pt-8">
                        <button 
                          onClick={() => setVisibleCount(v => v + 20)}
                          className="px-8 py-3 rounded-full font-bold uppercase tracking-wider text-[13px] transition-all shadow-sm border border-[var(--border-color)] hover:bg-[var(--accent-color)] hover:text-white hover:border-[var(--accent-color)]"
                          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                        >
                          {t('Load More')}
                        </button>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* RIGHT SIDEBAR: Editor's Picks / Trending (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-3">
               <div className="sticky top-[90px] pl-2" style={{ borderLeft: isArabic ? 'none' : '1px solid var(--border-color)', borderRight: isArabic ? '1px solid var(--border-color)' : 'none' }}>
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse"></div>
                     <h3 className="font-bold text-[18px] uppercase tracking-wide" style={{ color: 'var(--text-color)' }}>{t("Editor's Picks")}</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                     {articles.slice(10, 16).map((article, idx) => (
                       <Link
                         key={`pick-${article.id}-${idx}`}
                         to={`/${lang}/news/${article.slug || article.id}`}
                         className="group flex flex-col gap-2 pb-4 border-b border-[var(--border-color)] last:border-0"
                       >
                         <h4 className="text-[15px] font-bold leading-[1.3] group-hover:text-[var(--accent-color)] transition-colors line-clamp-3" style={{ color: 'var(--text-color)' }}>
                           {article.title}
                         </h4>
                         <span className="text-[11px] font-medium opacity-60" style={{ color: 'var(--text-color)' }}>
                           {article.sourceName} &bull; {timeAgo(article.pubDate, t, isArabic)}
                         </span>
                       </Link>
                     ))}
                  </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
