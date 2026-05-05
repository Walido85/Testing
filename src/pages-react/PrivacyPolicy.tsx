import { useTranslation } from 'react-i18next';
import { Shield, Lock, Eye, Cookie, Info, Mail, ChevronRight, Home } from 'lucide-react';
import { Link } from '../utils/navigation';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const sections = [
    { id: 'intro', title: t('1. Introduction'), icon: Info },
    { id: 'collection', title: t('2. Information We Collect'), icon: Eye },
    { id: 'usage', title: t('3. How We Use Your Information'), icon: Lock },
    { id: 'adsense', title: t('4. AdSense and Cookies'), icon: Cookie },
    { id: 'security', title: t('5. Data Security'), icon: Shield },
    { id: 'contact', title: t('6. Contact Us'), icon: Mail },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full py-12 space-y-24" style={{ color: 'var(--text-color)' }}>
      <SEO 
        title={t('Privacy Policy')} 
        description={t('Read our privacy policy to understand how TuniWave handles your data.')}
        canonical={`https://tuniwave.com/${lang}/privacy`}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black opacity-30">
        <Link to={`/${lang}`} className="hover:opacity-100 transition-opacity flex items-center gap-2">
          <Home className="w-3 h-3" />
          {t('Home')}
        </Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="opacity-100 text-[var(--accent-color)]">{t('Privacy Policy')}</span>
      </nav>
      
      <div className="flex flex-col lg:flex-row gap-20">
        {/* Table of Contents - Desktop Only Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32 h-fit space-y-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">{t('Navigation')}</h3>
          <nav className="flex flex-col gap-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className="flex items-center gap-4 text-xs font-black opacity-40 hover:opacity-100 hover:text-[var(--accent-color)] transition-all text-left uppercase tracking-[0.2em] group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current scale-0 group-hover:scale-100 transition-transform duration-300" />
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-24">
          <header className="space-y-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              className="h-1 rounded-full" 
              style={{ background: 'var(--accent-color)' }} 
            />
            <h1 className="text-6xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-color)] to-[var(--text-color)]/30">
              {t('Privacy')} <br />
              <span className="text-[var(--accent-color)]">{t('Policy')}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-color)' }} />
                <span>v3.0.4</span>
              </div>
              <span>{t('Effective Date')}: 16.04.2026</span>
              <span className="ml-auto italic opacity-50 font-bold">{t('Reading time: 6 min')}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-20 text-lg leading-relaxed max-w-3xl">
            <section id="intro" className="space-y-8 h-scroll-mt-24">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <Info className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('1. Introduction')}</h2>
               </div>
               <p className="opacity-70 font-medium font-serif leading-relaxed italic">
                {t('Welcome to TuniWave. We are committed to protecting your personal information and your right to privacy. This privacy policy applies to all information collected through our website, mobile application, and any related services.')}
              </p>
            </section>

            <section id="collection" className="space-y-10 p-12 rounded-[3.5rem] border bg-[var(--card-bg)]/5 relative group transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--accent-color)]/5" style={{ borderColor: 'var(--border-color)' }}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5 shadow-inner" style={{ borderColor: 'var(--border-color)' }}>
                   <Eye className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('2. Information We Collect')}</h2>
               </div>
               <div className="space-y-8">
                <p className="opacity-70 font-medium">
                  {t('We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--border-color)] border border-[var(--border-color)] overflow-hidden rounded-[2rem]">
                  {['Log and Usage Data', 'Device Information', 'Location Data', 'Cookies & Tracking', 'Contact Details', 'Authentication'].map(item => (
                    <div key={item} className="p-6 bg-[var(--header-bg)] hover:bg-[var(--accent-color)]/10 transition-colors group/item">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] group-hover/item:text-[var(--accent-color)] transition-colors">
                        {t(item)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="usage" className="space-y-8 border-l-2 pl-12" style={{ borderColor: 'var(--accent-color)' }}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <Lock className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('3. How We Use Your Information')}</h2>
               </div>
               <p className="opacity-70 font-medium">
                {t('We use personal information collected via our App for a variety of business purposes described below. We process your personal information for search purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.')}
              </p>
            </section>

            <section id="adsense" className="space-y-8 p-12 rounded-[3.5rem] border border-[var(--accent-color)]/20 bg-[var(--accent-color)]/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 blur-[120px] rounded-full -mr-32 -mt-32 group-hover:bg-[var(--accent-color)]/10 transition-all duration-1000" />
               <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[var(--accent-color)]/20 bg-[var(--accent-color)]/10">
                   <Cookie className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic text-[var(--accent-color)]">{t('4. AdSense and Cookies')}</h2>
               </div>
               <div className="space-y-8 relative z-10">
                <p className="opacity-70 font-medium leading-relaxed italic border-l-4 border-[var(--accent-color)]/20 pl-6">
                  {t('Google, as a third-party vendor, uses cookies to serve ads on TuniWave. Google\'s use of the advertising cookie enables it and its partners to serve ads to our users based on their visit to our site and other sites on the Internet.')}
                </p>
                <div className="p-8 rounded-[2rem] bg-black/40 border border-[var(--border-color)] backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed italic opacity-80 decoration-red-500/50 underline-offset-8 underline">
                    {t('Users may opt out of personalized advertising by visiting Ads Settings or www.aboutads.info.')}
                  </p>
                </div>
              </div>
            </section>

            <section id="security" className="space-y-8">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <Shield className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('5. Data Security')}</h2>
               </div>
               <p className="opacity-70 font-medium leading-relaxed">
                {t('We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.')}
              </p>
            </section>

            <section id="contact" className="space-y-8 border-t pt-12" style={{ borderColor: 'var(--border-color)' }}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <Mail className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('6. Contact Us')}</h2>
               </div>
               <p className="opacity-70 font-medium leading-relaxed">
                {t('If you have questions or comments about this policy, you may email us at support@tuniwave.com or use our contact form.')}
              </p>
              <Link to={`/${lang}/contact`} className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] hover:gap-5 transition-all">
                {t('Go to contact page')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
