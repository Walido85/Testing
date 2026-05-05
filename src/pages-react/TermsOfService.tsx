import { useTranslation } from 'react-i18next';
import { Gavel, FileText, Scale, HelpCircle, AlertTriangle, ChevronRight, Home, ArrowUpRight } from 'lucide-react';
import { Link } from '../utils/navigation';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import { motion } from 'motion/react';

export default function TermsOfService() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const sections = [
    { id: 'acceptance', title: t('1. Acceptance of Terms'), icon: FileText },
    { id: 'license', title: t('2. Use License'), icon: Gavel },
    { id: 'disclaimer', title: t('3. Content Disclaimer'), icon: AlertTriangle },
    { id: 'liability', title: t('4. Limitations of Liability'), icon: Scale },
    { id: 'law', title: t('5. Governing Law'), icon: HelpCircle },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-12 space-y-24" style={{ color: 'var(--text-color)' }}>
      <SEO 
        title={t('Terms of Service')} 
        description={t('Read our terms of service to understand the rules for using TuniWave.')}
        canonical={`https://tuniwave.com/${lang}/terms`}
      />
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black opacity-30">
        <Link to={`/${lang}`} className="hover:opacity-100 transition-opacity flex items-center gap-2">
          <Home className="w-3 h-3" />
          {t('Home')}
        </Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="opacity-100 text-[var(--accent-color)]">{t('Terms of Service')}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-20">
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32 h-fit space-y-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">{t('Legal Sections')}</h3>
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

        <div className="flex-1 space-y-24">
          <header className="space-y-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              className="h-1 rounded-full" 
              style={{ background: 'var(--accent-color)' }} 
            />
            <h1 className="text-6xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-color)] to-[var(--text-color)]/30">
              {t('Terms')} <br />
              <span className="text-[var(--accent-color)]">{t('Service')}</span>
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <span>{t('Effective Date')}: 16.04.2026</span>
              <span className="ml-auto flex items-center gap-2 italic">
                {t('Legally Binding')}
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-20 text-lg leading-relaxed max-w-3xl">
            <section id="acceptance" className="space-y-8">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <FileText className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('1. Acceptance of Terms')}</h2>
               </div>
               <p className="opacity-70 font-medium font-serif italic">
                {t('By accessing and using TuniWave, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.')}
              </p>
            </section>

            <section id="license" className="space-y-10 p-12 rounded-[3.5rem] border bg-[var(--card-bg)]/5 shadow-2xl shadow-black/20" style={{ borderColor: 'var(--border-color)' }}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <Gavel className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('2. Use License')}</h2>
               </div>
               <div className="space-y-6">
                <p className="opacity-70 font-medium leading-relaxed">
                  {t('Permission is granted to temporarily download one copy of the materials (information or software) on TuniWave\'s website for personal, non-commercial transitory viewing only.')}
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    'You may not modify or copy the materials.',
                    'You may not use the materials for commercial purpose.',
                    'You may not reverse engineer any software.'
                  ].map(rule => (
                    <div key={rule} className="flex gap-4 items-start p-4 border rounded-2xl bg-black/20 border-[var(--border-color)]">
                      <ChevronRight className="w-4 h-4 text-[var(--accent-color)] flex-shrink-0 mt-1" />
                      <p className="text-xs font-black uppercase tracking-widest opacity-60 leading-tight">{t(rule)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="disclaimer" className="space-y-8 border-l-2 pl-12" style={{ borderColor: 'var(--accent-color)' }}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <AlertTriangle className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('3. Content Disclaimer')}</h2>
               </div>
               <p className="opacity-70 font-medium italic">
                {t('The materials on TuniWave\'s website are provided on an \'as is\' basis. TuniWave makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability or fitness for a particular purpose.')}
              </p>
            </section>

            <section id="liability" className="space-y-8">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--card-bg)]/5" style={{ borderColor: 'var(--border-color)' }}>
                   <Scale className="w-5 h-5 text-[var(--accent-color)]" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('4. Limitations of Liability')}</h2>
               </div>
               <p className="opacity-70 font-medium leading-relaxed">
                {t('In no event shall TuniWave or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TuniWave\'s platform.')}
              </p>
            </section>

            <section id="law" className="space-y-8 p-12 rounded-[3.5rem] border border-[var(--accent-color)]/20 bg-[var(--accent-color)]/5">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[var(--accent-color)] border-[var(--accent-color)] text-white">
                   <HelpCircle className="w-5 h-5" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">{t('5. Governing Law')}</h2>
               </div>
               <p className="opacity-70 font-medium leading-relaxed">
                {t('These terms and conditions are governed by and construed in accordance with the laws of Tunisia and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

