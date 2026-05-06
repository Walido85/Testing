import type { GetStaticPaths, GetStaticProps } from 'next';
import Sitemap from '../../../src/pages-react/Sitemap';

export default function SitemapPage() {
  return <Sitemap />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
