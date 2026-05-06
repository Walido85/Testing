import type { GetStaticPaths, GetStaticProps } from 'next';
import TermsOfService from '../../../src/pages-react/TermsOfService';

export default function TermsPage() {
  return <TermsOfService />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
