import type { GetStaticPaths, GetStaticProps } from 'next';
import Finance from '../../../src/pages-react/Finance';

export default function FinancePage() {
  return <Finance />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
