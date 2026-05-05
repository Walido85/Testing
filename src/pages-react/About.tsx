import { useTranslation } from 'react-i18next';
import { Target, Heart, Zap, Award, Globe, Shield, ChevronRight, Home, ArrowUpRight } from 'lucide-react';
import { Link } from '../utils/navigation';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import { motion } from 'motion/react';

export default function About() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const values = [
    { icon: Target, title: t('Our Mission'), desc: t('TuniWave is a comprehensive digital media platform dedicated to bringing the best of Tunisia\'s information and entertainment to your fingertips.') },
    { icon: Heart, title: t('Our Values'), desc: t('To become the most reliable and innovative media hub for the Tunisian diaspora and locals alike.') },
    { icon: Shield, title: t('Accurate Information'), desc: t('We prioritize fact-checking and reliability in all our news coverage.') },
    { icon: Globe, title: t('Cultural Preservation'), desc: t('Highlighting Tunisian traditions, history, and modern achievements.') },
    { icon: Zap, title: t('Technological Innovation'), desc: t('Using cutting-edge features to provide a seamless digital experience.') },
    { icon: Award, title: t('Professional Excellence'), desc: t('A commitment to the highest standards of digital journalism.') },
  ];

  return (
    <div className="w-full py-12 space-y-24" style={{ color: 'var(--text-color)' }}>
      <SEO 
        title={t('About Us')} 
        description={t('Learn more about TuniWave, the ultimate destination for Tunisian news and entertainment.')}
        canonical={`https://tuniwave.com/${lang}/about`}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black opacity-30">
        <Link to={`/${lang}`} className="hover:opacity-100 transition-opacity flex items-center gap-2">
          <Home className="w-3 h-3" />
          {t('Home')}
        </Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="opacity-100 text-[var(--accent-color)]">{t('About Us')}</span>
      </nav>

      {/* Hero Header */}
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
        <div className="space-y-10">
          <div className="space-y-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              className="h-1 rounded-full" 
              style={{ background: 'var(--accent-color)' }} 
            />
            <h1 className="text-4xl md:text-7xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] italic">
              {t('About')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]/50">{t('TuniWave')}</span>
            </h1>
          </div>
          <p className="text-xl md:text-3xl font-bold italic opacity-60 leading-tight max-w-xl">
            {t('Founded in 2026, we pride ourselves on being the primary aggregator for Tunisian news, radio, and television.')}
          </p>
        </div>
        <div className="hidden lg:block border-l pl-12 h-fit" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-4">{t('Core Purpose')}</p>
          <p className="text-lg font-bold leading-relaxed opacity-80 italic">
            {t('To become the most reliable and innovative media hub for the Tunisian diaspora and locals alike.')}
          </p>
        </div>
      </header>

      {/* Narrative Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
           <h2 className="text-2xl font-black uppercase tracking-tight italic border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>{t('The TuniWave Vision')}</h2>
           <p className="text-lg md:text-xl font-medium leading-relaxed opacity-70">
             {t('Our mission is to digitalize the Tunisian media landscape, providing an accessible bridge between tradition and the modern digital era. We aim to support the Tunisian community worldwide by keeping them connected to their roots through high-quality streaming and reliable information.')}
           </p>
        </div>
        <div className="p-10 rounded-[2.5rem] bg-[var(--accent-color)] text-white space-y-6 flex flex-col justify-between">
           <Zap className="w-12 h-12" />
           <p className="text-2xl font-black uppercase tracking-tighter leading-tight italic">
             {t('Innovation is in our DNA.')}
           </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="space-y-12">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 text-center">{t('Our Founding Principles')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-color)] border border-[var(--border-color)] rounded-[3rem] overflow-hidden">
          {values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-10 bg-[var(--header-bg)] hover:bg-[var(--accent-color)] group transition-all duration-700 cursor-default"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border mb-8 group-hover:bg-[var(--card-bg)] group-hover:border-white transition-all duration-500" style={{ borderColor: 'var(--border-color)' }}>
                <item.icon className="w-6 h-6 group-hover:text-[var(--accent-color)] transition-colors" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight italic mb-4 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="text-sm font-medium opacity-50 leading-relaxed group-hover:text-white group-hover:opacity-80 transition-all">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="h-[400px] rounded-[4rem] relative overflow-hidden group">
        <img loading="lazy" 
          src="https://picsum.photos/seed/tunisia/1920/1080?blur=4" 
          alt="Tunisia" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-8">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white italic leading-none">
            {t('Shaping the future of')} <br />
            <span className="text-[var(--accent-color)]">{t('Tunisian Media')}</span>
          </h2>
          <Link 
            to={`/${lang}/contact`} 
            className="group flex items-center gap-4 px-10 py-5 bg-[var(--card-bg)] text-[var(--text-color)] rounded-full font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300"
          >
            {t('Join Our Journey')}
            <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
