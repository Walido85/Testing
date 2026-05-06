import type { GetStaticPaths, GetStaticProps } from 'next';
import Horoscope from '../../../src/pages-react/Horoscope';

export default function HoroscopePage() {
  return <Horoscope />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
