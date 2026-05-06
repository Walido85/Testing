import type { GetStaticPaths, GetStaticProps } from 'next';
import Home from '../../src/pages-react/Home';

export default function HomePage({ lang }: { lang: string }) {
  return <Home />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
