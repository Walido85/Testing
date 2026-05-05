import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { Sparkles, Star, Moon, Heart, Briefcase, Zap, X, Info, Coffee, Sun, Compass, LayoutGrid, Sparkle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const getDailyHoroscope = (sign: string, date: Date, t: any) => {
  const daySeed = date.getDate() + date.getMonth() * 31 + date.getFullYear();
  const signSeed = sign.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const combinedSeed = daySeed + signSeed;
  
  // Weekly seed (based on year and week number)
  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };
  const weekSeed = getWeekNumber(date) + date.getFullYear();
  const weeklyCombinedSeed = weekSeed + signSeed;

  const love = (combinedSeed % 40) + 60; 
  const career = ((combinedSeed * 13) % 40) + 55;
  const health = ((combinedSeed * 7) % 30) + 70;

  const magiAdvices = [
    t("The planets are in your favor, but don't rush into major decisions."),
    t("A period of reflection is necessary before the next big leap."),
    t("Your charm is at its peak today; use it to resolve old conflicts."),
    t("Financial stability is coming, but stay cautious with current spending."),
    t("A new door opens in your social life. Be ready to welcome new energy."),
    t("Focus on your inner peace; the external noise is temporary."),
    t("Success is a journey, not a destination. Enjoy the process today.")
  ];

  const luckyNumbers = [3, 7, 9, 11, 22, 33, 44, 5, 8];
  const luckyColors = [t('Gold'), t('Deep Blue'), t('Emerald'), t('Ruby'), t('Silver'), t('Violet')];
  const luckyHours = ['10:00', '14:30', '18:15', '21:00', '08:45', '12:00'];
  const compatibilities = [t('Leo'), t('Aries'), t('Libra'), t('Scorpio'), t('Taurus'), t('Pisces')];

  const intros = [
    t("Magi Farah predicts a day of significant planetary shifts for you. The energy is ripe for transformation."),
    t("The lunar cycle brings a wave of emotional clarity, helping you see through the fog of recent events."),
    t("Venus and Mars align to spark a new flame in your life, whether it's a new passion or a rekindled romance."),
    t("Jupiter brings abundance and growth, but Saturn's presence reminds you that discipline is the key to lasting success."),
    t("A celestial alignment suggests a breakthrough in your career path. Be ready to seize the moment when it arrives.")
  ];
  
  const bodies = [
    t("Your intuition is your best guide today. Listen to the whispers of the universe."),
    t("A surprise message from the past might arrive, bringing closure or new hope."),
    t("Energy levels are high; it is a perfect time to start a new creative project."),
    t("A professional challenge will turn into a valuable lesson by the end of the day."),
    t("Harmony in the home is highlighted. Spend quality time with loved ones.")
  ];

  const weeklyForecasts = [
    t("This week, the cosmic energy focuses on your foundations. It's time to strengthen your roots and prepare for the growth ahead."),
    t("Expect a surge of creativity and social interaction. Your ideas will find a receptive audience if you speak from the heart."),
    t("The stars suggest a period of introspection. Looking inward will provide the answers you've been seeking in the outside world."),
    t("A week of dynamic action and quick decisions. Trust your instincts as the pace of life accelerates significantly."),
    t("Harmony and balance are your themes for the next seven days. Focus on resolving tensions and finding middle ground.")
  ];

  return {
    text: `${intros[combinedSeed % intros.length]} ${bodies[(combinedSeed * 3) % bodies.length]}`,
    weeklyText: weeklyForecasts[weeklyCombinedSeed % weeklyForecasts.length],
    love,
    career,
    health,
    advice: magiAdvices[(combinedSeed * 5) % magiAdvices.length],
    luckyNumber: luckyNumbers[(combinedSeed * 2) % luckyNumbers.length],
    luckyColor: luckyColors[(combinedSeed * 4) % luckyColors.length],
    luckyHour: luckyHours[(combinedSeed * 6) % luckyHours.length],
    compatibility: compatibilities[(combinedSeed * 8) % compatibilities.length]
  };
};

export default function Horoscope() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const isArabic = i18n.language === 'ar';
  const today = new Date();
  const [selectedSign, setSelectedSign] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const signs = [
    { id: 'aries', name: t('Aries'), date: t('21 Mar - 19 Avr'), icon: '♈', color: 'var(--accent-color)' },
    { id: 'taurus', name: t('Taurus'), date: t('20 Avr - 20 Mai'), icon: '♉', color: 'var(--success-color)' },
    { id: 'gemini', name: t('Gemini'), date: t('21 Mai - 20 Juin'), icon: '♊', color: 'var(--accent-color)' },
    { id: 'cancer', name: t('Cancer'), date: t('21 Juin - 22 Juil'), icon: '♋', color: 'var(--accent-color)' },
    { id: 'leo', name: t('Leo'), date: t('23 Juil - 22 Août'), icon: '♌', color: 'var(--accent-color)' },
    { id: 'virgo', name: t('Virgo'), date: t('23 Août - 22 Sept'), icon: '♍', color: 'var(--accent-color)' },
    { id: 'libra', name: t('Libra'), date: t('23 Sept - 22 Oct'), icon: '♎', color: 'var(--accent-color)' },
    { id: 'scorpio', name: t('Scorpio'), date: t('23 Oct - 21 Nov'), icon: '♏', color: 'var(--accent-color)' },
    { id: 'sagittarius', name: t('Sagittarius'), date: t('22 Nov - 21 Déc'), icon: '♐', color: 'var(--accent-color)' },
    { id: 'capricorn', name: t('Capricorn'), date: t('22 Déc - 19 Jan'), icon: '♑', color: 'var(--accent-color)' },
    { id: 'aquarius', name: t('Aquarius'), date: t('20 Jan - 18 Fév'), icon: '♒', color: 'var(--accent-color)' },
    { id: 'pisces', name: t('Pisces'), date: t('19 Fév - 20 Mar'), icon: '♓', color: 'var(--accent-color)' },
  ];

  const dailyInsight = useMemo(() => getDailyHoroscope('General', today, t), [t]);
  const selectedHoroscope = useMemo(() => selectedSign ? getDailyHoroscope(selectedSign.id, today, t) : null, [selectedSign, t]);

  const handleOpenWeekly = () => {
    if (!selectedSign) {
      setSelectedSign(signs[0]);
    }
    setViewMode('weekly');
  };

  return (
    <div className="flex flex-col space-y-12 h-full pb-4 relative">
      <SEO 
        title={t('Daily Horoscope')}
        description={t('Get your daily zodiac sign predictions, lucky numbers, and astrological advice by Magi Farah.')}
        canonical={`https://tuniwave.com/${lang}/horoscope`}
      />
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[var(--bg-color)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-color)]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-color)]/10 blur-[150px]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Hero Section - Immersive */}
      <section className="relative h-[400px] rounded-sm overflow-hidden flex flex-col items-center justify-center text-center p-8 border border-[var(--border-color)] shadow-2xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000" 
            alt="Galaxy" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-20 space-y-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full border border-[var(--border-color)] flex items-center justify-center mb-6 backdrop-blur-md">
              <Sparkles className="w-8 h-8 text-[var(--accent-color)]" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none mb-4 text-white" style={{ textShadow: '0 0 30px rgba(255,255,255,0.3)' }}>
              {t("Magi Farah's Daily Wisdom")}
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-white/30" />
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-white opacity-70">
                {today.toLocaleDateString(i18n.language === 'ar' ? 'ar-u-nu-latn' : i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="h-px w-12 bg-white/30" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Daily Insight - Premium Card */}
      <section className="max-w-4xl mx-auto w-full p-10 rounded-sm border relative overflow-hidden backdrop-blur-xl shadow-2xl bg-[var(--text-color)]/5 border-[var(--text-color)]/10" >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Moon className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--accent-color)]">{t('Daily Insight')}</h2>
          </div>
          <p className="text-2xl md:text-3xl leading-snug mb-12 font-serif italic text-[var(--text-color)] opacity-90">
            "{dailyInsight.text}"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 border-t border-[var(--border-color)] pt-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-60">
                <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-[var(--accent-color)]" /> {t('LOVE')}</span>
                <span className="text-[var(--text-color)]">{dailyInsight.love}%</span>
              </div>
              <div className="h-1 bg-[var(--card-bg)]/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${dailyInsight.love}%` }} className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-60">
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-[var(--accent-color)]" /> {t('Career')}</span>
                <span className="text-[var(--text-color)]">{dailyInsight.career}%</span>
              </div>
              <div className="h-1 bg-[var(--card-bg)]/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${dailyInsight.career}%` }} className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-60">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[var(--accent-color)]" /> {t('Health')}</span>
                <span className="text-[var(--text-color)]">{dailyInsight.health}%</span>
              </div>
              <div className="h-1 bg-[var(--card-bg)]/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${dailyInsight.health}%` }} className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signs Grid - Visual & Modern */}
      <section className="px-4">
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-color)]">{t('Choose your Sign')}</h2>
          <p className="text-sm text-[var(--text-color)] opacity-40 uppercase tracking-widest max-w-md">{t('Select your zodiac sign to reveal your personalized daily forecast by Magi Farah.')}</p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
          {signs.map((sign, index) => (
            <motion.div 
              key={index} 
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelectedSign(sign); setViewMode('daily'); }}
              className="group relative aspect-square rounded-sm border border-[var(--border-color)] flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden transition-all duration-500" 
              
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-4xl sm:text-5xl md:text-6xl mb-4 transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ color: sign.color }}>{sign.icon}</span>
                <h4 className="text-sm font-black uppercase tracking-widest text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors">{sign.name}</h4>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold mt-2 text-[var(--text-color)] opacity-30">{sign.date}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--card-bg)]/0 group-hover:bg-[var(--card-bg)]/10 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sign Detail Modal */}
      <AnimatePresence>
        {selectedSign && selectedHoroscope && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSign(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-sm border border-[var(--border-color)] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col bg-[var(--bg-color)]"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 p-8 border-b border-[var(--border-color)] flex items-center justify-between backdrop-blur-xl bg-black/40">
                <div className="flex items-center gap-6">
                  <span className="text-4xl sm:text-5xl md:text-6xl" style={{ color: selectedSign.color }}>{selectedSign.icon}</span>
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter text-[var(--text-color)]">{selectedSign.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--text-color)] opacity-40">{selectedSign.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSign(null)}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-[var(--border-color)] hover:bg-[var(--card-bg)]/5 transition-colors"
                >
                  <X className="w-6 h-6 text-[var(--text-color)]" />
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="px-10 pt-8">
                <div className="flex p-1 bg-[var(--card-bg)]/5 rounded-sm w-fit">
                  <button 
                    onClick={() => setViewMode('daily')}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${viewMode === 'daily' ? 'bg-[var(--card-bg)] text-[var(--text-color)]' : 'text-[var(--text-color)] opacity-40 hover:text-[var(--text-color)]'}`}
                  >
                    {t('Daily')}
                  </button>
                  <button 
                    onClick={() => setViewMode('weekly')}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${viewMode === 'weekly' ? 'bg-[var(--card-bg)] text-[var(--text-color)]' : 'text-[var(--text-color)] opacity-40 hover:text-[var(--text-color)]'}`}
                  >
                    {t('Weekly')}
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-10 space-y-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-[var(--accent-color)]" />
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--accent-color)]">
                          {viewMode === 'daily' ? t("Magi Farah's Daily Wisdom") : t("Weekly Theme")}
                        </h4>
                      </div>
                      <p className="text-2xl md:text-3xl leading-relaxed font-serif italic text-[var(--text-color)] opacity-90">
                        "{viewMode === 'daily' ? selectedHoroscope.text : selectedHoroscope.weeklyText}"
                      </p>
                    </div>

                    {viewMode === 'daily' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Stats */}
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-50">
                              <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-[var(--accent-color)]" /> {t('LOVE')}</span>
                              <span className="text-[var(--text-color)]">{selectedHoroscope.love}%</span>
                            </div>
                            <div className="h-1.5 bg-[var(--card-bg)]/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${selectedHoroscope.love}%` }} className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-50">
                              <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-[var(--accent-color)]" /> {t('Career')}</span>
                              <span className="text-[var(--text-color)]">{selectedHoroscope.career}%</span>
                            </div>
                            <div className="h-1.5 bg-[var(--card-bg)]/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${selectedHoroscope.career}%` }} className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-50">
                              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[var(--accent-color)]" /> {t('Health')}</span>
                              <span className="text-[var(--text-color)]">{selectedHoroscope.health}%</span>
                            </div>
                            <div className="h-1.5 bg-[var(--card-bg)]/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${selectedHoroscope.health}%` }} className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]" />
                            </div>
                          </div>
                        </div>

                        {/* Lucky Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 rounded-sm border border-[var(--border-color)] flex flex-col items-center justify-center text-center bg-[var(--card-bg)]/[0.02]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-30 mb-2">{t('Lucky Number')}</p>
                            <p className="text-3xl font-black text-[var(--accent-color)]">{selectedHoroscope.luckyNumber}</p>
                          </div>
                          <div className="p-6 rounded-sm border border-[var(--border-color)] flex flex-col items-center justify-center text-center bg-[var(--card-bg)]/[0.02]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-30 mb-2">{t('Lucky Color')}</p>
                            <p className="text-sm font-black uppercase tracking-widest text-[var(--text-color)]">{selectedHoroscope.luckyColor}</p>
                          </div>
                          <div className="p-6 rounded-sm border border-[var(--border-color)] flex flex-col items-center justify-center text-center bg-[var(--card-bg)]/[0.02]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-30 mb-2">{t('Lucky Hour')}</p>
                            <p className="text-sm font-black text-[var(--text-color)]">{selectedHoroscope.luckyHour}</p>
                          </div>
                          <div className="p-6 rounded-sm border border-[var(--border-color)] flex flex-col items-center justify-center text-center bg-[var(--card-bg)]/[0.02]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-30 mb-2">{t('Compatibility')}</p>
                            <p className="text-sm font-black uppercase tracking-widest text-[var(--text-color)]">{selectedHoroscope.compatibility}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {viewMode === 'weekly' && (
                      <div className="p-8 rounded-sm border border-[var(--border-color)] bg-[var(--card-bg)]/[0.02] space-y-6">
                        <div className="flex items-center gap-3">
                          <Compass className="w-5 h-5 text-[var(--accent-color)]" />
                          <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--text-color)]">{t('Weekly Forecast')}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-30">{t('General Theme')}</p>
                            <p className="text-lg font-bold text-[var(--text-color)]">{t('Growth & Stability')}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] opacity-30">{t('Key Date')}</p>
                            <p className="text-lg font-bold text-[var(--accent-color)]">
                              {new Date(today.getTime() + 3 * 86400000).toLocaleDateString(i18n.language === 'ar' ? 'ar-u-nu-latn' : i18n.language, { day: 'numeric', month: 'long' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Magi's Advice */}
                    <div className="p-8 rounded-sm border-l-4 border-[var(--accent-color)] bg-[var(--accent-color)]/5">
                      <div className="flex items-center gap-3 mb-4">
                        <Info className="w-5 h-5 text-[var(--accent-color)]" />
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-color)]">{t("Magi's Advice")}</h4>
                      </div>
                      <p className="text-lg font-medium italic text-[var(--text-color)] opacity-80 leading-relaxed">
                        {selectedHoroscope.advice}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weekly Forecast - Modern Banner */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          onClick={handleOpenWeekly}
          className="p-10 rounded-sm border border-[var(--border-color)] flex flex-col md:flex-row gap-8 items-center group cursor-pointer relative overflow-hidden shadow-2xl" 
          
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Compass className="w-48 h-48" />
          </div>
          <div className="w-20 h-20 rounded-full border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 backdrop-blur-md bg-[var(--card-bg)]/5">
            <Moon className="w-10 h-10 text-[var(--accent-color)]" />
          </div>
          <div className="flex-1 text-center md:text-start">
            <h4 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-color)] mb-2">{t('Weekly Forecast')}</h4>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-color)] opacity-40">{t('See what the planets have in store for you this week.')}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-color)] opacity-30 group-hover:text-[var(--text-color)] transition-colors">{t('Explore')}</span>
            <div className="w-12 h-12 rounded-full border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[var(--card-bg)] group-hover:border-white transition-all">
              <Star className="w-5 h-5 text-[var(--text-color)] group-hover:text-[var(--text-color)] transition-colors" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Horoscope News */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <LayoutGrid className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-color)]">{t('Horoscope News')}</h2>
          <div className="h-px flex-1 bg-[var(--card-bg)]/10" />
        </div>
      </section>
    </div>
  );
}
