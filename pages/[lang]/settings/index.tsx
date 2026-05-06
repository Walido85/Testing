import type { GetStaticPaths, GetStaticProps } from 'next';
import Settings from '../../../src/pages-react/Settings';

export default function SettingsPage() {
  return <Settings />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
