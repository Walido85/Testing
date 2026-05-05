import React, { lazy, Suspense } from 'react';
import ReactProviders from './ReactProviders';
import LayoutComponent from './Layout';

const Home = lazy(() => import('../pages-react/Home'));
const News = lazy(() => import('../pages-react/News'));
const ArticleDetail = lazy(() => import('../pages-react/ArticleDetail'));
const RadioPortal = lazy(() => import('../pages-react/RadioPortal'));
const RadioDetail = lazy(() => import('../pages-react/RadioDetail'));
const Sports = lazy(() => import('../pages-react/Sports'));
const LiveTV = lazy(() => import('../pages-react/LiveTV'));
const Finance = lazy(() => import('../pages-react/Finance'));
const Islamiyat = lazy(() => import('../pages-react/Islamiyat'));
const Horoscope = lazy(() => import('../pages-react/Horoscope'));
const About = lazy(() => import('../pages-react/About'));
const Contact = lazy(() => import('../pages-react/Contact'));
const PrivacyPolicy = lazy(() => import('../pages-react/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages-react/TermsOfService'));
const Profile = lazy(() => import('../pages-react/Profile'));
const Settings = lazy(() => import('../pages-react/Settings'));
const Sitemap = lazy(() => import('../pages-react/Sitemap'));

const pages: Record<string, React.ComponentType<any>> = {
  Home,
  News,
  ArticleDetail,
  Radio: RadioPortal,
  RadioPortal,
  RadioDetail,
  Sports,
  TV: LiveTV,
  LiveTV,
  Finance,
  Islamiyat,
  Horoscope,
  About,
  Contact,
  PrivacyPolicy,
  TermsOfService,
  Profile,
  Settings,
  Sitemap
};

export type PageName = keyof typeof pages;

interface Props {
  pageName?: string;
  url?: string;
  initialData?: any;
  [key: string]: any;
}

export default function AstroPageLoader({ pageName = 'Home', url, initialData, ...rest }: Props) {
  const PageComponent = (pages as any)[pageName] || pages.Home;

  // Manually extract params from URL for components that expect them
  // This is necessary because we are rendering components directly without react-router-dom Routes
  const params = { ...rest };
  if (url) {
    const parts = url.split('/').filter(Boolean);
    // URL format: /lang/page/slug or /lang/page or /lang
    if (parts.length >= 1) params.lang = parts[0];
    if (parts.length >= 3) params.slug = parts[2];
  }

  return (
    <ReactProviders url={url} lang={params.lang}>
      <LayoutComponent>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div></div>}>
          <PageComponent initialData={initialData} {...params} />
        </Suspense>
      </LayoutComponent>
    </ReactProviders>
  );
}
