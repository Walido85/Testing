import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import RadioDetail from '../../../src/pages-react/RadioDetail';

export default function RadioDetailPage({ lang }: { lang: string }) {
  const router = useRouter();
  const slug = router.query.slug as string;
  return <RadioDetail slug={slug} lang={lang} />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar', slug: params?.slug || '' },
});
