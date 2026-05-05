import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Clock, MapPin, Sparkles, CalendarDays, Timer, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation as useAppLocation } from '../context/LocationContext';
import { 
  useGeolocation, 
  usePrayerTimes, 
  useNextPrayer, 
  useQibla, 
  useAsmaAlHusna,
  useIslamicSEO
} from '../hooks/islamic';
import { AsmaAlHusnaName } from '../hooks/islamic/useAsmaAlHusna';
import { IslamicCalendarWidget } from '../components/islamic/IslamicCalendarWidget';
import { useIsClient } from '../hooks/useIsClient';

export default function Islamiyat() {
  const isClient = useIsClient();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { location } = useAppLocation();
  const geo = useGeolocation();
  
  const lat = geo.lat ?? (location.latitude || null);
  const lng = geo.lng ?? (location.longitude || null);
  
  const prayerState = usePrayerTimes(lat, lng);
  const nextPrayer = useNextPrayer(prayerState.timings);
  const qiblaState = useQibla(lat, lng);
  
  const [randomAsmaId] = useState(() => Math.floor(Math.random() * 99) + 1);
  const asmaState = useAsmaAlHusna(randomAsmaId);

  useIslamicSEO({
    timings: prayerState.timings,
    hijri: prayerState.hijri,
    meta: prayerState.meta,
  });

  const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    if (!isClient) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isClient]);

  return (
    <div className={`min-h-screen pb-20 ${isArabic ? 'text-right font-arabic' : 'text-left'}`}>
      {/* Premium Hero Section */}
      <section className="relative h-[70vh] flex items-end overflow-hidden">
        {/* Actual Mosque Image Background */}
        <div className="absolute inset-0">
          <img loading="lazy" 
            src="https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80&w=2070" 
            alt="Mosque architecture"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/60 to-transparent" />
        </div>
        
        {/* Animated Background Gradients */}
        <div 
          className="absolute inset-0 opacity-15 dark:opacity-40 mix-blend-multiply dark:mix-blend-overlay"
          style={{
            background: 'radial-gradient(circle at 70% 30%, var(--accent-color) 0%, transparent 50%), radial-gradient(circle at 20% 80%, var(--success-color) 0%, transparent 60%)'
          }}
        />

        <div className="max-w-7xl mx-auto w-full px-4 pb-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-[1px] bg-[var(--accent-color)]" />
                <span className="text-[var(--accent-color)] font-serif italic text-lg tracking-widest uppercase mb-1">
                  {t('Spiritual Guidance')}
                </span>
              </div>
              <h1 className={`text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none mb-6 text-[var(--text-color)] ${isArabic ? 'font-arabic font-black' : 'font-serif'}`}>
                {t('Islamiyat')}
              </h1>
              <div className="flex flex-wrap gap-4 text-[var(--text-color)]/70 font-sans tracking-widest text-xs uppercase font-medium">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                  {isClient ? (prayerState.meta?.timezone || t('Locating...')) : t('Locating...')}
                </span>
                {isClient && prayerState.hijri && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[var(--card-bg)]/20 my-auto" />
                    <span>{isArabic ? prayerState.hijri.weekday.ar : prayerState.hijri.weekday.en}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--card-bg)]/20 my-auto" />
                    <span className="text-[var(--accent-color)]">
                      {prayerState.hijri.day} {isArabic ? prayerState.hijri.month.ar : prayerState.hijri.month.en} {prayerState.hijri.year}
                    </span>
                  </>
                )}
              </div>
            </div>

            {isClient && nextPrayer && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="bg-[var(--card-bg)]/5 backdrop-blur-xl p-8 rounded-3xl border border-[var(--border-color)] w-full md:w-80 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[var(--text-color)]/60 text-[10px] font-bold uppercase tracking-[0.2em]">{t('Next Prayer')}</span>
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-serif text-[var(--text-color)] mb-1">{t(nextPrayer.name)}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-sans font-black text-[var(--accent-color)] tracking-tighter">{nextPrayer.time}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Prayer Times Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence mode="wait">
                {!isClient || prayerState.loading ? (
                  <div className="col-span-full h-64 flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-12 h-12 border-2 border-[var(--accent-color)] border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  PRAYER_KEYS.map((key, index) => {
                    const isNext = isClient && nextPrayer?.name === key;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 flex flex-col justify-between h-48 ${
                          isNext 
                          ? 'bg-[var(--card-bg)] border-[var(--accent-color)] shadow-xl shadow-[var(--accent-color)]/10' 
                          : 'bg-[var(--card-bg)] border-black/5 hover:border-[var(--accent-color)]/30'
                        }`}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Clock className="w-16 h-16 text-[var(--text-color)]" />
                        </div>
                        
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block ${isNext ? 'text-[var(--text-color)]/60' : 'text-[var(--text-color)]/40'}`}>
                            {t('Prayer')} 0{index + 1}
                          </span>
                          <h3 className={`text-2xl ${isNext ? 'text-[var(--text-color)]' : 'text-[var(--text-color)]/80'} ${isArabic ? 'font-arabic font-bold' : 'font-serif'}`}>
                            {t(key)}
                          </h3>
                        </div>

                        <div className="flex items-baseline justify-between mt-auto">
                          <span className={`text-3xl font-sans font-black tracking-tighter ${isNext ? 'text-[var(--accent-color)]' : 'text-[var(--text-color)]/60'}`}>
                            {isClient ? prayerState.timings![key] : '--:--'}
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isNext ? 'text-[var(--accent-color)]' : 'text-[var(--text-color)]/20'} ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                        </div>

                        {isNext && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-color)]" />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-8">
              <IslamicCalendarWidget />
            </div>
          </div>

          {/* Right Bento Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Qibla Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--card-bg)] rounded-3xl p-8 relative overflow-hidden h-72 shadow-xl"
            >
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }}
              />
              <div className="relative z-10 h-full flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-[var(--text-color)]/60 mb-6 font-serif italic text-sm tracking-widest">
                  <Compass className="w-4 h-4 text-[var(--accent-color)]" />
                  {t('Qibla Direction')}
                </div>
                
                {!isClient || qiblaState.loading ? (
                  <div className="w-12 h-12 border-2 border-[var(--accent-color)]/30 border-t-amber-500 rounded-full animate-spin" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-[var(--border-color)]" />
                      <div className="absolute inset-2 rounded-full border border-[var(--border-color)]" />
                      <motion.div 
                        initial={{ rotate: 0 }}
                        animate={{ rotate: qiblaState.direction || 0 }}
                        transition={{ duration: 1.5, type: "spring" }}
                        className="w-1 h-14 bg-gradient-to-t from-[var(--accent-color)] to-transparent rounded-full origin-bottom -mt-14"
                      />
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] z-20 shadow-[0_0_10px_rgba(245,158,11,1)]" />
                    </div>
                    <span className="text-3xl font-sans font-black text-[var(--text-color)] mt-4 tracking-tighter">
                      {isClient && qiblaState.direction !== null ? `${Math.round(qiblaState.direction)}°` : '--'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Names of Allah Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--card-bg)] rounded-3xl overflow-hidden border border-black/5 shadow-xl flex flex-col h-fit lg:min-h-[400px]"
            >
              <div className="h-40 relative">
                <img loading="lazy" 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Allah_Calligraphy.svg/512px-Allah_Calligraphy.svg.png" 
                  alt="Allah Calligraphy"
                  className="w-full h-full object-contain p-4 bg-[var(--card-bg)]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[var(--hover-bg)] pointer-events-none" />
              </div>

              <div className="p-8 flex flex-col items-center text-center">
                {!asmaState.loading && asmaState.data ? (
                  <div className="flex flex-col items-center">
                    <span className={`text-7xl font-bold text-[var(--text-color)] mb-4 ${isArabic ? 'font-arabic' : ''}`}>
                      {Array.isArray(asmaState.data) ? asmaState.data[0]?.name : (asmaState.data as AsmaAlHusnaName).name}
                    </span>
                    <span className="text-xl font-serif text-[var(--accent-color)] mb-2 tracking-widest uppercase">
                      {Array.isArray(asmaState.data) ? asmaState.data[0]?.transliteration : (asmaState.data as AsmaAlHusnaName).transliteration}
                    </span>
                    <p className={`text-[var(--text-color)]/60 leading-relaxed italic text-base ${isArabic ? 'font-arabic' : 'font-serif'}`}>
                      "{Array.isArray(asmaState.data) ? asmaState.data[0]?.en?.meaning : (asmaState.data as AsmaAlHusnaName).en?.meaning}"
                    </p>
                  </div>
                ) : (
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-32 h-12 bg-[var(--hover-bg)] rounded" />
                        <div className="w-48 h-6 bg-[var(--hover-bg)] rounded" />
                        <div className="w-64 h-20 bg-[var(--hover-bg)] rounded" />
                    </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Decorative Branding */}
      <footer className="max-w-7xl mx-auto px-4 mt-20 text-center opacity-30">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-[1px] w-20 bg-[var(--text-color)]" />
          <MapIcon className="w-6 h-6" />
          <div className="h-[1px] w-20 bg-[var(--text-color)]" />
        </div>
        <p className="font-serif italic tracking-widest uppercase text-xs">{t('Premium TuniWave Spiritual Experience')}</p>
      </footer>
    </div>
  );
}

