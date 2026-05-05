import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone, Send, ChevronRight, Home, Globe } from 'lucide-react';
import { Link } from '../utils/navigation';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import { motion } from 'motion/react';

export default function Contact() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const infoItems = [
    { icon: Mail, label: t('Email Support'), value: 'support@tuniwave.com', color: 'text-[var(--accent-color)]', bg: 'bg-[var(--accent-color)]/10' },
    { icon: Phone, label: t('Phone Number'), value: '+216 71 000 000', color: 'text-[var(--accent-color)]', bg: 'bg-[var(--accent-color)]/10' },
    { icon: MapPin, label: t('Headquarters'), value: 'Tunis, Tunisia', color: 'text-[var(--accent-color)]', bg: 'bg-[var(--accent-color)]/10' },
    { icon: Globe, label: t('Social Media'), value: '@tuniwave_media', color: 'text-[var(--accent-color)]', bg: 'bg-[var(--accent-color)]/10' },
  ];

  return (
    <div className="w-full py-12 space-y-20" style={{ color: 'var(--text-color)' }}>
      <SEO 
        title={t('Contact Us')} 
        description={t('Get in touch with TuniWave for support, advertising, or feedback.')}
        canonical={`https://tuniwave.com/${lang}/contact`}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black opacity-30">
        <Link to={`/${lang}`} className="hover:opacity-100 transition-opacity flex items-center gap-2">
          <Home className="w-3 h-3" />
          {t('Home')}
        </Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="opacity-100 text-[var(--accent-color)]">{t('Contact Us')}</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-8 max-w-4xl">
        <div className="space-y-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            className="h-1 rounded-full" 
            style={{ background: 'var(--accent-color)' }} 
          />
          <h1 className="text-6xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] italic">
            {t('Contact')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]/50">{t('TuniWave')}</span>
          </h1>
        </div>
        <p className="text-xl md:text-3xl font-bold italic opacity-60 leading-tight max-w-xl">
          {t('Have a question or feedback? We are here to help. Reach out to us through any of the channels below.')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {infoItems.map((item, idx) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 border rounded-[2.5rem] space-y-4 hover:shadow-2xl transition-all duration-500"
                style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">{item.label}</h4>
                  <p className="font-black text-lg tracking-tight italic">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-10 rounded-[3rem] bg-[var(--hover-bg)] border border-dashed text-center space-y-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40 leading-relaxed italic">
              {t('Our support team typically responds within 24 hours during business days.')}
            </p>
          </div>
        </div>

        <form 
          className="p-12 border rounded-[4rem] space-y-10 shadow-2xl relative overflow-hidden group" 
          style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="absolute top-0 left-0 w-full h-1 group-hover:h-2 transition-all" style={{ background: 'var(--accent-color)' }} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">{t('Full Name')}</label>
              <input 
                type="text" 
                className="w-full p-6 rounded-[2rem] border focus:ring-4 focus:ring-[var(--accent-color)]/20 outline-none transition-all font-bold text-sm" 
                style={{ background: 'var(--bg-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                placeholder={t('Enter your name')}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">{t('Email')}</label>
              <input 
                type="email" 
                className="w-full p-6 rounded-[2rem] border focus:ring-4 focus:ring-[var(--accent-color)]/20 outline-none transition-all font-bold text-sm" 
                style={{ background: 'var(--bg-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                placeholder="name@email.com"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">{t('Message Context')}</label>
            <textarea 
              rows={5} 
              className="w-full p-8 rounded-[3rem] border focus:ring-4 focus:ring-[var(--accent-color)]/20 outline-none transition-all resize-none font-bold text-sm" 
              style={{ background: 'var(--bg-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
              placeholder={t('How can we help you today?')}
            />
          </div>

          <button className="group w-full py-7 bg-[var(--accent-color)] text-white font-black uppercase tracking-[0.4em] text-xs rounded-[2.5rem] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[var(--accent-color)]/30 flex items-center justify-center gap-4">
            {t('Send Message')}
            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
