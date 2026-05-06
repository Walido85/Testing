import type { GetStaticPaths, GetStaticProps } from 'next';
import LiveTV from '../../../src/pages-react/LiveTV';

export default function TVPage() {
  return <LiveTV />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
