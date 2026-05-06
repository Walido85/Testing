import type { GetStaticPaths, GetStaticProps } from 'next';
import RadioPortal from '../../../src/pages-react/RadioPortal';

export default function RadioPage() {
  return <RadioPortal />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
