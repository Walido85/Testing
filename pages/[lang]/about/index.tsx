import type { GetStaticPaths, GetStaticProps } from 'next';
import About from '../../../src/pages-react/About';

export default function AboutPage() {
  return <About />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
