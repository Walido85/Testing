import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import RadioDetail from '../../../src/pages-react/RadioDetail';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../src/firebase';

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj.toMillis === 'function') return obj.toMillis();
  if (typeof obj.seconds === 'number' && typeof obj.nanoseconds === 'number') return obj.seconds * 1000;
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serialize(v)]));
  return obj;
}

export default function RadioDetailPage({ lang, slug, initialData }: { lang: string; slug: string; initialData?: any }) {
  const router = useRouter();
  const resolvedSlug = (router.query.slug as string) || slug;
  return <RadioDetail slug={resolvedSlug} lang={lang} initialData={initialData} />;
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
    const snap = await getDocs(query(collection(db, 'stations'), where('slug', '==', slug), limit(1)));
    if (!snap.empty) {
      initialData = serialize({ id: snap.docs[0].id, ...snap.docs[0].data() });
    }
  } catch {
    // fall through — client will fetch
  }

  return {
    props: { lang, slug, initialData },
    revalidate: 86400,
  };
};
