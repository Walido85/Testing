import type { GetStaticPaths, GetStaticProps } from 'next';
import PrivacyPolicy from '../../../src/pages-react/PrivacyPolicy';

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
