import type { GetStaticPaths, GetStaticProps } from 'next';
import Islamiyat from '../../../src/pages-react/Islamiyat';

export default function IslamiyatPage() {
  return <Islamiyat />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
