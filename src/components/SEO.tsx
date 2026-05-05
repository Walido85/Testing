import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  breadcrumb?: { name: string; item: string }[];
  sportsEvents?: {
    name: string;
    startDate: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    url: string;
  }[];
  preloadImage?: string;
}

export default function SEO({ 
  title = "TuniWave - Radio, TV & News Tunisia", 
  description = "Listen to Tunisian radio, watch live TV, and get the latest sports and news updates in real-time.",
  canonical,
  type = "website",
  image = "/og-image.jpg", 
  article = false,
  publishedTime,
  modifiedTime,
  author = "TuniWave",
  breadcrumb = [],
  sportsEvents = [],
  preloadImage
}: SEOProps) {
  const { i18n } = useTranslation();
  const location = typeof window !== 'undefined' ? window.location : { pathname: '', search: '', hash: '' };
  const siteTitle = title.includes("TuniWave") ? title : `${title} | TuniWave`;
  const lang = i18n.language || 'en';
  const fullImage = image.startsWith('http') ? image : `https://tuniwave.com${image}`;
  
  // Compute true canonical using location to always perfectly match hreflang
  const getCleanSearch = () => {
    if (!location.search) return '';
    const params = new URLSearchParams(location.search);
    ['fbclid', 'gclid', '_ga', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(p => params.delete(p));
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  // Helper to build alternate URLs
  const getAlternateUrl = (targetLang: string) => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const supportedLangs = ['ar', 'fr', 'en'];
    
    let url: string;
    if (pathParts.length > 0 && supportedLangs.includes(pathParts[0])) {
      const newPathParts = [...pathParts];
      newPathParts[0] = targetLang;
      url = `https://tuniwave.com/${newPathParts.join('/')}`;
    } else {
      url = `https://tuniwave.com/${targetLang}${location.pathname === '/' ? '' : location.pathname}`;
    }
    url += getCleanSearch();
    return url.endsWith('/') && url !== 'https://tuniwave.com/' ? url.slice(0, -1) : url;
  };
  
  // Build x-default URL (no language prefix)
  const getXDefaultUrl = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const supportedLangs = ['ar', 'fr', 'en'];
    let url: string;
    if (pathParts.length > 0 && supportedLangs.includes(pathParts[0])) {
      const newPathParts = pathParts.slice(1);
      url = newPathParts.length > 0 ? `https://tuniwave.com/${newPathParts.join('/')}` : 'https://tuniwave.com';
    } else {
      url = `https://tuniwave.com${location.pathname === '/' ? '' : location.pathname}`;
    }
    url += getCleanSearch();
    return url.endsWith('/') && url !== 'https://tuniwave.com/' ? url.slice(0, -1) : url;
  };

  // Use the explicit canonical if provided, otherwise derive it from the current location.
  let resolvedCanonical = canonical ?? `https://tuniwave.com${location.pathname === '/' ? '' : location.pathname}${getCleanSearch()}`;
  if (resolvedCanonical.endsWith('/') && resolvedCanonical !== 'https://tuniwave.com/') {
    resolvedCanonical = resolvedCanonical.slice(0, -1);
  }

  const structuredDataList: any[] = [];

  // Main Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": article ? "NewsArticle" : "WebSite",
    "name": "TuniWave",
    "description": description,
    "url": resolvedCanonical,
    "image": {
      "@type": "ImageObject",
      "url": fullImage
    },
    ...(article ? {
      "headline": title.substring(0, 110),
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "author": {
        "@type": "Person",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "TuniWave",
        "logo": {
          "@type": "ImageObject",
          "url": "https://tuniwave.com/logo-full.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": resolvedCanonical
      }
    } : {
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://tuniwave.com/news?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    })
  };
  structuredDataList.push(structuredData);

  // Sports Event Data
  if (sportsEvents.length > 0) {
    sportsEvents.forEach(event => {
       structuredDataList.push({
         "@context": "https://schema.org",
         "@type": "SportsEvent",
         "name": event.name,
         "startDate": event.startDate,
         "homeTeam": { "@type": "SportsTeam", "name": event.homeTeam },
         "awayTeam": { "@type": "SportsTeam", "name": event.awayTeam },
         "url": event.url,
         "organizer": { "@type": "Organization", "name": event.league }
       });
    });
  }

  // Breadcrumb Structured Data
  const breadcrumbData = breadcrumb.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item.startsWith('http') ? item.item : `https://tuniwave.com${item.item}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={lang} />
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={resolvedCanonical} />
      {preloadImage && <link rel="preload" as="image" href={preloadImage} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:site_name" content="TuniWave" />
      
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Language Alternates (hreflang) - Support Path-based language prefixes */}
      <link rel="alternate" hrefLang="en" href={getAlternateUrl('en')} />
      <link rel="alternate" hrefLang="fr" href={getAlternateUrl('fr')} />
      <link rel="alternate" hrefLang="ar" href={getAlternateUrl('ar')} />
      <link rel="alternate" hrefLang="x-default" href={getXDefaultUrl()} />

      {/* Structured Data Scripts */}
      {structuredDataList.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}
    </Helmet>
  );
}
