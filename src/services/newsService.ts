import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const newsCache = new Map<string, { data: NewsItem[], timestamp: number }>();
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  thumbnail: string;
  imageUrl?: string;
  source: string;
  description: string;
  language?: string;
  isPremium?: boolean;
}

export function getArticleImage(article: any): string | undefined {
  if (!article) return undefined;
  
  if (article.imageUrl && typeof article.imageUrl === 'string') return article.imageUrl;
  if (article.thumbnail && typeof article.thumbnail === 'string') return article.thumbnail;
  if (article.image && typeof article.image === 'string') return article.image;
  
  if (article.enclosure) {
    if (typeof article.enclosure === 'string') return article.enclosure;
    if (Array.isArray(article.enclosure) && article.enclosure.length > 0) {
      if (typeof article.enclosure[0] === 'string') return article.enclosure[0];
      if (article.enclosure[0].url) return article.enclosure[0].url;
    }
    if (article.enclosure.url) return article.enclosure.url;
  }
  
  if (article['media:content']) {
     const media = article['media:content'];
     if (Array.isArray(media) && media.length > 0) {
       if (media[0].$ && media[0].$.url) return media[0].$.url;
       if (media[0].url) return media[0].url;
     } else if (media.$ && media.$.url) {
       return media.$.url;
     } else if (media.url) {
       return media.url;
     }
  }

  if (article.media_thumbnail && typeof article.media_thumbnail === 'string') return article.media_thumbnail;
  
  if (article.media && article.media.url) return article.media.url;
  if (article.media && article.media.$ && article.media.$.url) return article.media.$.url;
  
  // Try parsing from content
  const content = article.content || article.description || article.contentSnippet;
  if (content && typeof content === 'string') {
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  return undefined;
}

export async function fetchNewsFromRss(rssUrl?: string, lang: string = 'en', category?: string): Promise<NewsItem[]> {
  const cacheKey = `${rssUrl || 'all'}_${lang}_${category || 'all'}`;
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL) {
    return cached.data;
  }

  try {
    // 1. Fetch active source IDs from 'rss' collection
    let sourcesQuery = query(collection(db, 'rss'), where('status', '==', 'active'));
    if (category) {
      sourcesQuery = query(collection(db, 'rss'), where('status', '==', 'active'), where('category', '==', category));
    }
    const sourcesSnapshot = await getDocs(sourcesQuery);
    const activeSourceIds = sourcesSnapshot.docs.map(doc => doc.id);

    if (activeSourceIds.length === 0) return [];

    // 2. Build a map of source languages for robust filtering
    const sourceLanguageMap = new Map<string, string>();
    sourcesSnapshot.docs.forEach(s => {
      sourceLanguageMap.set(s.id, (s.data().language as string) || 'ar');
    });

    // 3. Fetch articles from 'rss_articles' matching active source IDs
    const limitedSourceIds = activeSourceIds.slice(0, 120);
    const chunks = [];
    for (let i = 0; i < limitedSourceIds.length; i += 30) {
      chunks.push(limitedSourceIds.slice(i, i + 30));
    }

    const allArticles: any[] = [];
    const chunkPromises = chunks.map(chunk => {
      const articlesQuery = query(
        collection(db, 'rss_articles'),
        where('sourceId', 'in', chunk),
        orderBy('pubDate', 'desc'),
        limit(50)
      );
      return getDocs(articlesQuery);
    });
    const snapshots = await Promise.all(chunkPromises);
    const targetLangPrefix = lang.slice(0, 2).toLowerCase();
    
    snapshots.forEach(snapshot => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);
      const filtered = docs.filter(d => {
        const itemLangRaw = (d.language || d.Language || d.lang || d.Lang || sourceLanguageMap.get(d.sourceId) || '');
        const itemLang = itemLangRaw.toLowerCase();
        
        if (!itemLang) return targetLangPrefix === 'ar';
        
        return itemLang.startsWith(targetLangPrefix) || 
               (targetLangPrefix === 'ar' && (itemLang === 'arabic')) ||
               (targetLangPrefix === 'en' && (itemLang === 'english')) ||
               (targetLangPrefix === 'fr' && (itemLang === 'french'));
      });
      allArticles.push(...filtered.map(art => {
        // Normalize pubDate to number for later sorting
        let ts = 0;
        if (art.pubDate) {
          if (typeof art.pubDate === 'number') ts = art.pubDate;
          else if (art.pubDate.seconds) ts = art.pubDate.seconds * 1000;
          else if (art.pubDate.toMillis) ts = art.pubDate.toMillis();
          else ts = new Date(art.pubDate).getTime();
        }
        return { ...art, pubDate: isNaN(ts) ? 0 : ts };
      }));
    });

    // Sort combined results and limit to 100
    const results = allArticles
      .sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0))
      .slice(0, 100)
      .map(data => ({
        title: data.title || '',
        pubDate: data.pubDate || '',
        link: data.link || '',
        guid: data.id,
        thumbnail: getArticleImage(data) || '',
        source: data.sourceName || '',
        description: data.description || '',
        isPremium: !!data.isPremium || !!data.premium
      } as NewsItem));
      
    newsCache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (err) {
    console.error('Error fetching news from Firestore:', err);
    return [];
  }
}
