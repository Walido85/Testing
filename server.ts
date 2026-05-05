import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit, Timestamp, orderBy } from 'firebase/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase for server-side cache
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase, firebaseConfig.firestoreDatabaseId);

// In-Memory Cache
let homeDataCache: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refreshHomeCache() {
  try {
    const timeNow = Date.now();
    const lookbackDays = 30;
    const pastDate = timeNow - (lookbackDays * 24 * 60 * 60 * 1000);
    const pastTimestamp = Timestamp.fromMillis(pastDate);
    
    // 0. Fetch Sources to map language fallback
    const sourcesSnapshot = await getDocs(collection(db, 'rss'));
    const sourceLangMap = new Map();
    sourcesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      sourceLangMap.set(doc.id, data.language || data.Language || 'ar');
    });

    // 1. Fetch Top News - Using orderBy and limit for efficiency (skipping where for now to avoid index issues if any, and speed)
    const newsQuery = query(
      collection(db, 'rss_articles'), 
      orderBy('pubDate', 'desc'),
      limit(3000)
    );
    const newsSnapshot = await getDocs(newsQuery);
    
    const articles = newsSnapshot.docs.map(doc => {
      const data = doc.data();
      const sId = data.sourceId;
      
      const getLang = (val: any) => {
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object') return val.language || val.Language || val.lang || val.Lang || '';
        return '';
      };
      
      const sLangFallback = getLang(sourceLangMap.get(sId)) || 'ar';
      const itemLangRaw = getLang(data) || sLangFallback;
      
      // Parse pubDate to numeric timestamp for sorting
      let ts = 0;
      if (data.pubDate) {
        if (typeof data.pubDate === 'number') ts = data.pubDate;
        else if (data.pubDate.seconds) ts = data.pubDate.seconds * 1000;
        else if (data.pubDate.toMillis) ts = data.pubDate.toMillis();
        else ts = new Date(data.pubDate).getTime();
      }

      return { 
        id: doc.id, 
        ...data, 
        language: itemLangRaw,
        pubDate: ts 
      };
    });
    
    // Sort by numeric timestamp and keep a larger buffer to ensure language variety
    const sortedArticles = articles
      .filter(a => a.pubDate > 0)
      .sort((a: any, b: any) => b.pubDate - a.pubDate)
      .slice(0, 4000);

    // Debug: count by language
    const langCounts: Record<string, number> = {};
    sortedArticles.forEach(a => {
      const l = (a.language || 'ar').toLowerCase().slice(0, 2);
      langCounts[l] = (langCounts[l] || 0) + 1;
    });

    // 2. Fetch TV Channels
    const tvQuery = query(collection(db, 'tv'), where('status', '==', 'active'), limit(20));
    const tvSnapshot = await getDocs(tvQuery);
    const tvChannels = tvSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Fetch Radio Stations
    const radioQuery = query(collection(db, 'stations'), where('status', '==', 'active'), limit(30));
    const radioSnapshot = await getDocs(radioQuery);
    const radioStations = radioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    homeDataCache = {
      articles: sortedArticles,
      tv: tvChannels,
      radio: radioStations,
      timestamp: timeNow
    };
    lastCacheTime = timeNow;
    console.log(`[Cache] Refreshed home data at ${new Date(timeNow).toISOString()} - Total articles: ${sortedArticles.length}`);
    console.log(`[Cache] Lang metrics: ${JSON.stringify(langCounts)}`);
  } catch (error) {
    console.error("[Cache] Error refreshing home cache:", error);
  }
}

// Initial fetch
refreshHomeCache();
setInterval(refreshHomeCache, CACHE_TTL);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Home Cache API Endpoint
  app.get("/api/home-data", async (req, res) => {
    if (!homeDataCache || (Date.now() - lastCacheTime > CACHE_TTL)) {
      await refreshHomeCache();
    }
    
    // Send standard empty structure if cache is entirely failing
    if (!homeDataCache) {
      return res.json({ articles: [], tv: [], radio: [] });
    }
    
    res.json(homeDataCache);
  });

  // Explicit route for robots.txt
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\n\nSitemap: https://tuniwave.com/sitemap.xml");
  });

  // Explicit route for sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    res.type("text/xml");
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    if (fs.existsSync(sitemapPath)) {
      res.sendFile(sitemapPath);
    } else {
      res.status(404).send("Sitemap not found");
    }
  });

  // Explicit route for ads.txt
  app.get("/ads.txt", (req, res) => {
    res.type("text/plain");
    const adsPath = path.join(process.cwd(), "public", "ads.txt");
    if (fs.existsSync(adsPath)) {
      res.sendFile(adsPath);
    } else {
      res.status(404).send("ads.txt not found");
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: process.cwd(),
      base: '/',
    });
    app.use(vite.middlewares);

    // SPA fallback for dev mode - ensures index.html is served and transformed for all routes
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // 1. Read index.html
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');

        // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
        //    also applies HTML transforms from Vite plugins, e.g. global preambles
        //    from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template);

        // 3. Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        // If an error is caught, let Vite fix the stacktrace so it maps back
        // to your actual source code.
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { 
      index: false,
      maxAge: '1y',
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          // Don't cache HTML to ensure latest app is loaded
          res.setHeader('Cache-Control', 'no-cache');
        } else {
          // Cache everything else for 1 year
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));

    // SEO 302 Redirect for root to avoid client-side redirect which causes Canonical mismatch in PageSpeed
    app.get('/', (req, res) => {
      // 1. Check cookie first for saved user preference
      const cookieMatch = req.headers.cookie ? req.headers.cookie.match(/i18nextLng=(ar|fr|en)/) : null;
      if (cookieMatch && cookieMatch[1]) {
        return res.redirect(302, `/${cookieMatch[1]}`);
      }
      
      // 2. Fallback to Accept-Language header
      const acceptLang = req.headers['accept-language'] || '';
      let targetLang = 'ar';
      
      const match = acceptLang.match(/([a-z]{2})/i);
      if (match) {
        const langCode = match[1].toLowerCase();
        if (['ar', 'fr', 'en'].includes(langCode)) {
          targetLang = langCode;
        }
      }
      return res.redirect(302, `/${targetLang}`);
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
  });
}

startServer();
