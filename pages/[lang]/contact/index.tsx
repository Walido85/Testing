import type { GetStaticPaths, GetStaticProps } from 'next';
import Contact from '../../../src/pages-react/Contact';

export default function ContactPage() {
  return <Contact />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ['ar', 'fr', 'en'].map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { lang: params?.lang || 'ar' },
});
