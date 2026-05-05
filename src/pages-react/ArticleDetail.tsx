import React, { useState, useEffect } from 'react';

import { useAstroNavigate } from '../utils/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ExternalLink, Share2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  link: string;
  pubDate: number;
  thumbnail: string | null;
  sourceName: string;
  sourceLogo: string;
  genre: string;
  language: string;
}

declare global {
  interface Window {
    __INITIAL_ARTICLE__?: Article;
  }
}

import { collection, query, where, getDocs, getDoc, limit, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ArticleDetail({ initialData, slug, lang: propLang, articleLang: propArticleLang }: { initialData?: Article, slug?: string, lang?: string, articleLang?: string }) {
  const { t, i18n } = useTranslation();
  // Prefer the prop passed from Astro — don't depend on i18n state which can change mid-render
  const lang = propLang || i18n.language || 'ar';
  const newsLang = propArticleLang || lang;

  const navigate = useAstroNavigate();
  const isArabic = lang === 'ar';

  // URL slugs can be percent-encoded (e.g. Arabic text). Decode once and use everywhere.
  const decodedSlug = slug ? (() => { try { return decodeURIComponent(slug); } catch { return slug; } })() : '';

  // Priority: Prop (SSR) > Global (Legacy) > null
  // Compare both raw and decoded slug so encoding differences never cause a miss.
  const [article, setArticle] = useState<Article | null>(() => {
    if (!decodedSlug) return null;
    if (initialData) {
      const s = initialData.slug, id = initialData.id;
      if (s === decodedSlug || s === slug || id === decodedSlug || id === slug) return initialData;
    }
    if (typeof window !== 'undefined' && window.__INITIAL_ARTICLE__) return window.__INITIAL_ARTICLE__;
    return null;
  });
  const [loading, setLoading] = useState(!article && !!decodedSlug);
  const [error, setError] = useState<string | null>(null);
  const [textSizeLevel, setTextSizeLevel] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!decodedSlug) return;

    // Check both raw and decoded forms so encoding differences never cause a spurious re-fetch
    const isMatchingSlug = article && (
      article.slug === decodedSlug || article.slug === slug ||
      article.id === decodedSlug || article.id === slug
    );
    if (isMatchingSlug) return;

    setLoading(true);
    setError(null);

    const fetchArticle = async () => {
      try {
        // Run all lookup strategies in parallel instead of sequential fallbacks
        const [bySlugLang, bySlugOnly, byIdSnap] = await Promise.all([
          getDocs(query(collection(db, 'rss_articles'), where('slug', '==', decodedSlug), where('language', '==', newsLang), limit(1))),
          getDocs(query(collection(db, 'rss_articles'), where('slug', '==', decodedSlug), limit(1))),
          getDoc(doc(db, 'rss_articles', decodedSlug)),
        ]);

        const docSnapshot =
          (!bySlugLang.empty ? bySlugLang.docs[0] : null) ||
          (!bySlugOnly.empty ? bySlugOnly.docs[0] : null) ||
          (byIdSnap.exists() ? byIdSnap : null);

        if (!docSnapshot) throw new Error('Article not found');

        const rawData = docSnapshot.data()!;
        const data = {
          id: docSnapshot.id,
          ...rawData,
          thumbnail: rawData.imageUrl || rawData.thumbnail || null,
          pubDate: rawData.pubDate
            ? (typeof rawData.pubDate === 'number' ? rawData.pubDate : (rawData.pubDate.seconds ? rawData.pubDate.seconds * 1000 : new Date(rawData.pubDate).getTime()))
            : 0,
        } as Article;

        setArticle(data);
        setLoading(false);
        delete (window as any).__INITIAL_ARTICLE__;
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [decodedSlug, newsLang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-color)]/20 border-t-[var(--accent-color)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!decodedSlug || error || !article) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-[var(--accent-color)] mb-4" />
        <h1 className="text-2xl font-bold text-[var(--text-color)] mb-2">{t('Article Not Found')}</h1>
        <button 
          onClick={() => navigate(`/${i18n.language}/news`)}
          className="mt-4 px-6 py-2 bg-[var(--accent-color)] text-white rounded-full font-bold hover:opacity-90 transition-colors"
        >
          {t('Back to News')}
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-10 ${isArabic ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <SEO 
        title={`${article.title} - Tuniwave News`}
        description={article.description}
        image={article.thumbnail || undefined}
        article={true}
        publishedTime={(() => {
          const date = new Date(Number(article.pubDate) || article.pubDate);
          return !isNaN(date.getTime()) ? date.toISOString() : undefined;
        })()}
        canonical={`https://tuniwave.com/${i18n.language}/news/${article.slug}`}
        breadcrumb={[
          { name: t('Home'), item: `/${i18n.language}` },
          { name: t('News'), item: `/${i18n.language}/news` },
          { name: t(article.genre || 'General'), item: `/${i18n.language}/news?genre=${article.genre}` },
          { name: article.title, item: `/${i18n.language}/news/${article.slug}` }
        ]}
      />

      <div className="relative w-full h-[45vh] sm:h-[55vh] overflow-hidden rounded-t-3xl sm:rounded-t-[40px]">
        {(article.thumbnail || (article as any).imageUrl) && (article.thumbnail?.length > 5 || (article as any).imageUrl?.length > 5) && (
          <img loading="lazy" 
            src={article.thumbnail || (article as any).imageUrl} 
            className="w-full h-full object-cover"
            alt=""
            referrerPolicy="no-referrer"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 mt-[env(safe-area-inset-top)]">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[var(--card-bg)]/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-[var(--card-bg)]/40 transition-all border border-[var(--border-color)] shadow-sm"
            aria-label={t('Back')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => {
                 if (navigator.share) {
                   navigator.share({ title: article.title, url: window.location.href })
                     .catch((err) => {
                       if (err.name !== 'AbortError') console.error('Share error:', err);
                     });
                 } else {
                   navigator.clipboard.writeText(window.location.href);
                 }
               }}
               className="w-10 h-10 rounded-full bg-[var(--card-bg)]/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-[var(--card-bg)]/40 transition-all border border-[var(--border-color)] shadow-sm"
               aria-label={t('Share')}
             >
               <Share2 className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setTextSizeLevel(prev => (prev + 1) % 3)}
               className="w-10 h-10 rounded-full bg-[var(--card-bg)]/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-[var(--card-bg)]/40 transition-all border border-[var(--border-color)] shadow-sm text-[15px] font-bold"
               aria-label={t('Change Text Size')}
             >
               Aa
             </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-3xl mx-auto">
             <h1 className="text-[26px] sm:text-3xl md:text-4xl font-bold text-white leading-[1.3] tracking-tight text-shadow-md">
               {article.title}
             </h1>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-6 border-b border-[var(--border-color)]">
        <div className="text-[14px] text-[var(--text-color)]/80 mb-8 pb-4 flex flex-wrap items-center gap-1.5 opacity-90">
            {isArabic ? 'بقلم' : 'By'} <span className="font-bold text-[var(--text-color)]">{article.sourceName}</span> 
            <span className="px-1 opacity-50">|</span> 
            <span suppressHydrationWarning>{(() => {
                if (article.pubDate === undefined || article.pubDate === null || article.pubDate === 0) return '';
                const date = new Date(Number(article.pubDate) || article.pubDate);
                return !isNaN(date.getTime()) ? date.toLocaleDateString(isArabic ? 'ar' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            })()}</span>
            <span className="px-1 opacity-50">|</span>
            <span>2 {isArabic ? 'دقيقة قراءة' : 'min read'}</span>
        </div>

        <p className={`${
            textSizeLevel === 0 ? 'text-[17px] sm:text-[18px]' : 
            textSizeLevel === 1 ? 'text-[20px] sm:text-[22px]' : 
            'text-[24px] sm:text-[26px]'
          } leading-[1.75] mb-10 text-[var(--text-color)] tracking-wide transition-all duration-300`}
        >
          {article.description}
        </p>

        <div className="flex flex-wrap gap-2.5 mb-10">
            <span className="px-4 py-1.5 border border-[var(--text-color)]/30 rounded-full text-[13px] font-medium text-[var(--text-color)] capitalize">
              {article.genre || (isArabic ? 'أخبار' : 'News')}
            </span>
        </div>

        <div className="flex justify-center pt-2">
           <a 
             href={article.link} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="w-full sm:w-auto px-10 py-4 bg-[var(--text-color)] text-[var(--bg-color)] rounded-full font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-3"
           >
             {t('Read Full Story')} 
             <ExternalLink className="w-4 h-4" />
           </a>
        </div>
      </article>
    </div>
  );
}
