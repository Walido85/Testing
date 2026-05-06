import type { GetStaticPaths, GetStaticProps } from 'next';
import News from '../../../src/pages-react/News';

export default function NewsPage() {
  return <News />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
