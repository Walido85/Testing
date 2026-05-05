
import admin from 'firebase-admin';
import fs from 'fs';

const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
  : undefined;

console.log("--- Debugging Firestore Initialization ---");
if (credentials) {
  console.log("Credentials detected from GOOGLE_APPLICATION_CREDENTIALS_JSON.");
  console.log("Project ID from credentials:", credentials.project_id);
  console.log("Service account email:", credentials.client_email);
  
  if (credentials.project_id === "tunisia-radios-d7aa8") {
    console.log("✅ Project ID matches 'tunisia-radios-d7aa8' exactly.");
  } else {
    console.log("❌ PROJECT ID MISMATCH! Expected: tunisia-radios-d7aa8, Got:", credentials.project_id);
  }

  if (credentials.client_email === "firebase-adminsdk-fbsvc@tunisia-radios-d7aa8.iam.gserviceaccount.com") {
    console.log("✅ Service account email matches expected admin SDK email.");
  } else {
    console.log("⚠️ Service account email differs from expected. Got:", credentials.client_email);
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(credentials)
    });
    console.log("Firebase Admin initialized successfully with provided service account.");
  } catch (err: any) {
    console.error("FATAL: Failed to initialize Firebase Admin:");
    console.error(err.stack || err);
  }
} else {
  console.log("No credentials found in GOOGLE_APPLICATION_CREDENTIALS_JSON. Attempting default initialization...");
  try {
    admin.initializeApp();
    console.log("Firebase Admin initialized with default application credentials.");
  } catch (err: any) {
    console.error("FATAL: Failed to initialize Firebase Admin with default credentials:");
    console.error(err.stack || err);
  }
}

const db = admin.firestore();
try {
  // Using the firestoreDatabaseId from the config, but explicitly logging it
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  const dbId = config.firestoreDatabaseId || '(default)';
  console.log("Applying Firestore database ID setting:", dbId);
  db.settings({ databaseId: dbId });
  console.log("Firestore settings applied.");
} catch (err) {
  console.warn("Notice: Could not read firebase-applet-config.json for databaseId, proceeding with default SDK behavior.");
}

const BASE_URL = 'https://tuniwave.com';
const SECTIONS = [
  { collection: "stations", urlPrefix: "/radio", filter: { status: "active" }, priority: 0.8, changefreq: "weekly" },
  { collection: "rss_articles", urlPrefix: "/news", filter: {}, priority: 0.9, changefreq: "daily" },
];

const STATIC_URLS = [
  { path: "", priority: 1.0, changefreq: "daily" },
  { path: "/tv", priority: 0.8, changefreq: "daily" },
  { path: "/sports", priority: 0.8, changefreq: "daily" },
  { path: "/rss", priority: 0.6, changefreq: "monthly" },
  { path: "/finance", priority: 0.6, changefreq: "monthly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
  { path: "/privacy", priority: 0.6, changefreq: "monthly" },
  { path: "/terms", priority: 0.6, changefreq: "monthly" },
];

function getSafeDate(updatedAt: any): string {
    if (!updatedAt) return new Date().toISOString();
    if (updatedAt instanceof admin.firestore.Timestamp) return updatedAt.toDate().toISOString();
    if (typeof updatedAt === 'object' && '_seconds' in updatedAt) return new Date(updatedAt._seconds * 1000).toISOString();
    if (typeof updatedAt === 'string') return new Date(updatedAt).toISOString();
    return new Date().toISOString();
}

function normalizeLanguage(lang: any): string | null {
    if (!lang) return null;
    const l = lang.toString().toLowerCase();
    if (['ar', 'fr', 'en'].includes(l)) return l;
    if (l === 'arabic') return 'ar';
    if (l === 'french') return 'fr';
    if (l === 'english') return 'en';
    return null;
}

async function generateSitemap() {
  let entries: string[] = [];
  const currentDate = new Date().toISOString();

  const langs = ['en', 'fr', 'ar'];

  // 1. Static URLs
  for (const urlCfg of STATIC_URLS) {
    for (const lang of langs) {
        entries.push(genEntry(lang, urlCfg.path, currentDate, urlCfg.changefreq, urlCfg.priority, langs));
    }
  }

  // 2. Dynamic URLs
  for (const section of SECTIONS) {
    let generatedCount = 0;
    const articleCounts: Record<string, number> = { ar: 0, fr: 0, en: 0 };
    try {
        let query: admin.firestore.Query = db.collection(section.collection);
        if (section.filter && Object.keys(section.filter).length > 0) {
            for (const [key, value] of Object.entries(section.filter)) {
                query = query.where(key, '==', value);
            }
        }
        const snapshot = await query.get();
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            let slug = data.slug || data.kawarji_slug;
            if (!slug) {
                console.warn(`Skipping document in ${section.collection} due to missing slug/kawarji_slug: ${doc.id}`);
                continue;
            }
            // Strip language name if present in the slug from the db
            slug = slug.replace(/^(english|arabic|french|en|ar|fr)\//i, '');
            const relativePath = `${section.urlPrefix}/${slug}`;
            const lastmod = getSafeDate(data.updatedAt || data.publishedAt);
            
            if (section.collection === 'rss_articles') {
                const lang = normalizeLanguage(data.sourceLanguage);
                if (!lang) {
                    console.warn(`Skipping article ${doc.id} due to missing or unknown sourceLanguage: ${data.sourceLanguage}`);
                    continue;
                }
                entries.push(genSingleEntry(lang, relativePath, lastmod, section.changefreq, section.priority));
                articleCounts[lang]++;
                generatedCount++;
            } else {
                for (const lang of langs) {
                    entries.push(genEntry(lang, relativePath, lastmod, section.changefreq, section.priority, langs));
                }
                generatedCount++;
            }
        }
        
        if (section.collection === 'rss_articles') {
            console.log(`Collection ${section.collection}: processed ${generatedCount} articles (AR: ${articleCounts.ar}, FR: ${articleCounts.fr}, EN: ${articleCounts.en}).`);
        } else {
            console.log(`Collection ${section.collection}: processed ${generatedCount} documents (${generatedCount * langs.length} URLs).`);
        }
    } catch (e) {
        console.error(`ERROR fetching collection ${section.collection}:`, e);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;

  if (!fs.existsSync('public')) fs.mkdirSync('public', {recursive: true});
  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log(`Sitemap generated with ${entries.length} total entries.`);
}

function genEntry(lang: string, path: string, lastmod: string, changefreq: string, priority: number, allLangs: string[]) {
    const alternates = allLangs.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}${path}"/>`).join('\n    ');
    
    return `  <url>
    <loc>${BASE_URL}/${lang}${path}</loc>
    ${alternates}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function genSingleEntry(lang: string, path: string, lastmod: string, changefreq: string, priority: number) {
    return `  <url>
    <loc>${BASE_URL}/${lang}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

generateSitemap();
