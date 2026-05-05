import { Link, useAstroNavigate } from '../utils/navigation';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Youtube, ChevronRight, TrendingUp } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const navigate = useAstroNavigate();

  const footerSections = [
    {
      title: t('Platform'),
      links: [
        { label: t('News'), path: `/${lang}/news` },
        { label: t('Sports'), path: `/${lang}/sports` },
        { label: t('Live TV'), path: `/${lang}/tv` },
        { label: t('Radio'), path: `/${lang}/radio` },
        { label: t('Finance'), path: `/${lang}/finance` },
        { label: t('Islamiyat'), path: `/${lang}/islamiyat` },
        { label: t('Horoscope'), path: `/${lang}/horoscope` },
        { label: t('Vols'), path: 'https://vols.tuniwave.com', isExternal: true },
      ]
    },
    {
      title: t('Company'),
      links: [
        { label: t('About Us'), path: `/${lang}/about` },
        { label: t('Contact Us'), path: `/${lang}/contact` },
        { label: t('Advertise'), path: `/${lang}/contact` },
      ]
    },
    {
      title: t('Legal'),
      links: [
        { label: t('Privacy Policy'), path: `/${lang}/privacy` },
        { label: t('Terms of Service'), path: `/${lang}/terms` },
        { label: t('Cookie Policy'), path: `/${lang}/privacy` },
      ]
    }
  ];

  return (
    <footer 
      className="mt-6 sm:mt-10 border-t pt-10 sm:pt-16 pb-20 md:pb-10 px-5 sm:px-6 lg:px-8" 
      style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}
    >
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16">
          {/* Brand Identity Section */}
          <div className="col-span-2 space-y-5 sm:space-y-6">
            <Link 
              to={`/${lang}`} 
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[var(--accent-color)] rounded-xl rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-xl" />
                <TrendingUp className="relative w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-2xl sm:text-3xl tracking-tighter leading-none uppercase" style={{ color: 'var(--text-color)' }}>
                  Tuni<span style={{ color: 'var(--accent-color)' }}>Wave</span>
                </span>
                <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-60 mt-1" style={{ color: 'var(--text-color)' }}>{t('Tunisia Digital Media Hub')}</span>
              </div>
            </Link>
            <p className="text-[11px] sm:text-xs font-medium leading-relaxed opacity-60 max-w-sm" style={{ color: 'var(--text-color)' }}>
              {t('TuniWave is a comprehensive digital media platform dedicated to bringing the best of Tunisia\'s information and entertainment to your fingertips.')}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, name: "Facebook" },
                { Icon: Twitter, name: "Twitter" },
                { Icon: Instagram, name: "Instagram" },
                { Icon: Youtube, name: "Youtube" },
              ].map(({ Icon, name }, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] hover:border-[var(--accent-color)] hover:text-white transition-colors" 
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                  aria-label={name}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categorized Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: 'var(--accent-color)' }} />
                {section.title}
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {section.links.map((link) => {
                  if ('isExternal' in link && link.isExternal) {
                    return (
                      <li key={link.label}>
                        <a 
                          href={link.path} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] sm:text-xs font-semibold opacity-50 hover:opacity-100 hover:text-[var(--accent-color)] transition-colors uppercase tracking-wide sm:tracking-[0.15em] flex items-center gap-0 hover:gap-1.5"
                          style={{ color: 'var(--text-color)' }}
                        >
                          <ChevronRight className="w-0 h-3 group-hover:w-3 opacity-0 group-hover:opacity-100 transition-all text-[var(--accent-color)]" />
                          {link.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <Link 
                        to={link.path} 
                        className="text-[11px] sm:text-xs font-semibold opacity-50 hover:opacity-100 hover:text-[var(--accent-color)] transition-colors uppercase tracking-wide sm:tracking-[0.15em] flex items-center gap-0 hover:gap-1.5"
                        style={{ color: 'var(--text-color)' }}
                      >
                        <ChevronRight className="w-0 h-3 group-hover:w-3 opacity-0 group-hover:opacity-100 transition-all text-[var(--accent-color)]" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-8 sm:pt-10 border-t flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]" style={{ color: 'var(--text-color)' }}>
              © 2026 TuniWave • {t('All Rights Reserved')}
            </p>
            <p className="text-[8px] font-medium opacity-60 uppercase tracking-[0.15em]" style={{ color: 'var(--text-color)' }}>
              {t('Designed and maintained with passion for Tunisia.')}
            </p>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              to={`/${lang}/contact`} 
              className="text-[9px] font-bold opacity-60 hover:opacity-100 uppercase tracking-[0.2em] transition-colors hover:text-[var(--accent-color)]" 
              style={{ color: 'var(--text-color)' }}
            >
              {t('Support')}
            </Link>
            <span className="w-0.5 h-0.5 rounded-full opacity-20" style={{ background: 'var(--text-color)' }} />
            <Link 
              to={`/${lang}/sitemap`} 
              className="text-[9px] font-bold opacity-60 hover:opacity-100 uppercase tracking-[0.2em] transition-colors hover:text-[var(--accent-color)]" 
              style={{ color: 'var(--text-color)' }}
            >
              {t('Sitemap')}
            </Link>
            <span className="w-0.5 h-0.5 rounded-full opacity-20" style={{ background: 'var(--text-color)' }} />
            <button 
              onPointerDown={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[9px] font-bold opacity-60 hover:opacity-100 uppercase tracking-[0.2em] transition-colors hover:text-[var(--accent-color)]"
              style={{ color: 'var(--text-color)' }}
            >
              {t('Back to Top')} ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
