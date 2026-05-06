import type { GetStaticPaths, GetStaticProps } from 'next';
import Profile from '../../../src/pages-react/Profile';

export default function ProfilePage() {
  return <Profile />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
