import type { GetStaticPaths, GetStaticProps } from 'next';
import Sports from '../../../src/pages-react/Sports';

export default function SportsPage() {
  return <Sports />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
