import React from 'react';
import { Link } from '../utils/navigation';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Map, TrendingUp, Radio, Tv, Newspaper, Bookmark, Plane, MoonStar, Sparkles } from 'lucide-react';

export default function Sitemap() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const links = [
    { name: t('Home'), path: `/${lang}`, icon: Map },
    { name: t('News'), path: `/${lang}/news`, icon: Newspaper },
    { name: t('Sports'), path: `/${lang}/sports`, icon: Bookmark },
    { name: t('Finance'), path: `/${lang}/finance`, icon: TrendingUp },
    { name: t('Live TV'), path: `/${lang}/tv`, icon: Tv },
    { name: t('Radio'), path: `/${lang}/radio`, icon: Radio },
    { name: t('Vols'), path: 'https://vols.tuniwave.com', icon: Plane, isExternal: true },
    { name: t('Islamiyat'), path: `/${lang}/islamiyat`, icon: MoonStar },
    { name: t('Horoscope'), path: `/${lang}/horoscope`, icon: Sparkles },
    { name: t('About Us'), path: `/${lang}/about`, icon: FileText },
    { name: t('Contact Us'), path: `/${lang}/contact`, icon: FileText },
    { name: t('Privacy Policy'), path: `/${lang}/privacy`, icon: FileText },
    { name: t('Terms of Service'), path: `/${lang}/terms`, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] px-5 py-10 sm:px-10 lg:px-20 text-[var(--text-color)]">
      <SEO title={t('Sitemap')} description={t('Sitemap for TuniWave')} canonical={`https://tuniwave.com/${lang}/sitemap`} />
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8" style={{ color: 'var(--accent-color)' }}>{t('Sitemap')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {links.map((link) => {
          const content = (
            <>
              <link.icon className="w-6 h-6 text-[var(--accent-color)]" />
              <span className="font-bold text-sm uppercase tracking-wider group-hover:text-[var(--accent-color)]">{link.name}</span>
            </>
          );
          const className = "flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)] transition-all group";

          if ('isExternal' in link && link.isExternal) {
            return (
              <a
                key={link.path}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
