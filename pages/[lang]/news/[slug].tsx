import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import ArticleDetail from '../../../src/pages-react/ArticleDetail';
import { collection, query, where, getDocs, getDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../../src/firebase';

export default function ArticlePage({ lang, slug, initialData }: { lang: string; slug: string; initialData?: any }) {
  const router = useRouter();
  const resolvedSlug = (router.query.slug as string) || slug;
  return <ArticleDetail slug={resolvedSlug} lang={lang} initialData={initialData} />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  const slug = (params?.slug as string) || '';

  let initialData = null;
  try {
    const decoded = (() => { try { return decodeURIComponent(slug); } catch { return slug; } })();
    const [bySlug, bySlugDecoded, byId] = await Promise.all([
      getDocs(query(collection(db, 'rss_articles'), where('slug', '==', slug), limit(1))),
      getDocs(query(collection(db, 'rss_articles'), where('slug', '==', decoded), limit(1))),
      getDoc(doc(db, 'rss_articles', decoded)),
    ]);
    const snap =
      (!bySlug.empty ? bySlug.docs[0] : null) ||
      (!bySlugDecoded.empty ? bySlugDecoded.docs[0] : null) ||
      (byId.exists() ? byId : null);

    if (snap) {
      const raw = snap.data()!;
      initialData = {
        id: snap.id,
        ...raw,
        thumbnail: raw.imageUrl || raw.thumbnail || null,
        pubDate: raw.pubDate
          ? (typeof raw.pubDate === 'number' ? raw.pubDate : (raw.pubDate.seconds ? raw.pubDate.seconds * 1000 : new Date(raw.pubDate).getTime()))
          : 0,
      };
    }
  } catch {
    // fall through — client will fetch
  }

  return {
    props: { lang, slug, initialData },
    revalidate: 3600,
  };
};
