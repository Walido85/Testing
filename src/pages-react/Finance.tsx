import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useMarketData, StockQuote } from '../hooks/useMarketData';
import { Loader2, ChevronRight, Briefcase, Landmark, Cpu, Factory, ShoppingBag, FlaskConical, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useMemo, useState, useEffect } from 'react';
import { useIsClient } from '../hooks/useIsClient';

export default function Finance() {
  const isClient = useIsClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const isArabic = i18n.language === 'ar';
  const { exchangeRates, tunisiaStocks, globalIndices, loading } = useMarketData();

  // Simulated "Real Mode" live pulse effect
  const [pulseIndices, setPulseIndices] = useState<Record<number, 'up' | 'down' | null>>({});

  useEffect(() => {
    if (!isClient || globalIndices.length === 0) return;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * globalIndices.length);
      const direction = Math.random() > 0.5 ? 'up' : 'down';
      
      setPulseIndices(prev => ({ ...prev, [randomIndex]: direction }));
      
      setTimeout(() => {
        setPulseIndices(prev => ({ ...prev, [randomIndex]: null }));
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, [globalIndices, isClient]);

  const groupedStocks = useMemo(() => {
    return tunisiaStocks.reduce((acc, stock) => {
      const cat = stock.category || 'OTHER';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(stock);
      return acc;
    }, {} as Record<string, StockQuote[]>);
  }, [tunisiaStocks]);

  const categories = Object.keys(groupedStocks).sort();

  const isMarketOpen = () => {
    if (!isClient) return false;
    // Tunis Stock Exchange hours: Mon-Fri, 09:00 - 15:10
    const now = new Date();
    // Get time in Tunis (GMT+1)
    const tunisTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Tunis',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short'
    }).formatToParts(now);

    const day = tunisTime.find(p => p.type === 'weekday')?.value;
    const hour = parseInt(tunisTime.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(tunisTime.find(p => p.type === 'minute')?.value || '0');

    if (day === 'Sat' || day === 'Sun') return false;
    
    const timeInMinutes = hour * 60 + minute;
    return timeInMinutes >= 9 * 60 && timeInMinutes <= 15 * 60 + 10;
  };

  const [convertAmount, setConvertAmount] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');

  const convertedValue = useMemo(() => {
    const rate = exchangeRates.find(r => r.currency === selectedCurrency);
    if (!rate) return '0.00';
    return (convertAmount * parseFloat(rate.value)).toFixed(3);
  }, [convertAmount, selectedCurrency, exchangeRates]);

  const getCategoryIcon = (cat: string) => {
    const c = cat.toUpperCase();
    if (c.includes('FINANCIAL')) return <Landmark className="w-4 h-4" />;
    if (c.includes('TECH')) return <Cpu className="w-4 h-4" />;
    if (c.includes('INDUSTRIAL')) return <Factory className="w-4 h-4" />;
    if (c.includes('CONSUMER')) return <ShoppingBag className="w-4 h-4" />;
    if (c.includes('HEALTH')) return <FlaskConical className="w-4 h-4" />;
    if (c.includes('OIL') || c.includes('GAS') || c.includes('BASIC')) return <Zap className="w-4 h-4" />;
    return <Briefcase className="w-4 h-4" />;
  };

  const getFlagUrl = (currency: string) => {
    const codeMap: Record<string, string> = {
      'USD': 'us',
      'EUR': 'eu',
      'GBP': 'gb',
      'SAR': 'sa',
      'CAD': 'ca',
      'JPY': 'jp',
      'CHF': 'ch',
      'AED': 'ae',
      'KWD': 'kw',
      'QAR': 'qa',
      'TND': 'tn'
    };
    const code = codeMap[currency] || 'un';
    return `https://flagcdn.com/w80/${code}.png`;
  };

  const getIndexLogo = (name: string) => {
    const n = name.toUpperCase();
    
    // US Indices
    if (n.includes('S&P') || n.includes('DOW') || n.includes('NASDAQ') || n.includes('US 500') || n.includes('US TECH') || n.includes('US 30')) 
      return 'us';
    
    // Europe Specific
    if (n.includes('FTSE MIB')) return 'it';
    if (n.includes('FTSE')) return 'gb';
    if (n.includes('DAX')) return 'de';
    if (n.includes('CAC')) return 'fr';
    if (n.includes('IBEX')) return 'es';
    if (n.includes('AEX')) return 'nl';
    if (n.includes('SMI')) return 'ch';
    if (n.includes('PSI')) return 'pt';
    if (n.includes('BEL 20')) return 'be';
    if (n.includes('OMX STOCKHOLM') || n.includes('OMXS')) return 'se';
    if (n.includes('OMX COPENHAGEN')) return 'dk';
    if (n.includes('OMX HELSINKI')) return 'fi';
    if (n.includes('MOEX') || n.includes('RTSI')) return 'ru';
    
    // Asia/Other
    if (n.includes('NIKKEI') || n.includes('TOPIX')) return 'jp';
    if (n.includes('HANG SENG')) return 'hk';
    if (n.includes('SHANGHAI') || n.includes('SZSE') || n.includes('CHINA')) return 'cn';
    if (n.includes('ASX')) return 'au';
    if (n.includes('NIFTY') || n.includes('SENSEX')) return 'in';
    if (n.includes('TSX')) return 'ca';
    if (n.includes('KOSPI')) return 'kr';
    if (n.includes('SET')) return 'th';
    if (n.includes('ASEAN')) return 'asia'; // Special case
    
    // Regional / Multi-country
    if (n.includes('EURO STOXX') || n.includes('STOXX') || n.includes('EUROPE')) return 'eu';
    
    // Local
    if (n.includes('TUNIS') || n.includes('TUNINDEX')) return 'tn';
    
    return null;
  };

  if (loading && exchangeRates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" style={{ color: 'var(--text-color)' }}>
        <Loader2 className="w-12 h-12 animate-spin opacity-50" />
        <p className="text-sm font-black uppercase tracking-widest opacity-60">{t('Connecting to Financial Markets...')}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-10 font-sans h-full bg-transparent ${isArabic ? 'rtl' : 'ltr'}`} style={{ color: 'var(--text-color)' }}>
      <SEO 
        title={t('Financial Dashboard')}
        description={t('Real-time monitoring of exchange rates and stock market data.')}
        canonical={`https://tuniwave.com/${lang}/finance`}
      />

      <div className="w-full">
        {/* Header section */}
        <div className="pt-2 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] sm:text-[12px] font-bold opacity-50 tracking-[0.2em] uppercase mb-2"
            >
              {t('FINANCIAL INTELLIGENCE')}
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl sm:text-5xl font-black uppercase leading-none tracking-tighter"
            >
              {t('Tunisia')}<br/>{t('MARKETS')}
            </motion.h1>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isClient && isMarketOpen() ? 'border-[var(--success-color)]/30 text-[var(--success-color)] bg-[var(--success-color)]/5' : 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-color)]/5'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isClient && isMarketOpen() ? 'bg-[var(--success-color)] animate-pulse' : 'bg-[var(--accent-color)]'}`} />
              {isClient ? (isMarketOpen() ? t('BVMT OPEN') : t('BVMT CLOSED')) : t('BVMT STATUS')}
            </div>
            {isClient && (
              <span className="text-[9px] font-bold opacity-30 uppercase tracking-tight">
                {t('Last Updated')}: {new Date().toLocaleTimeString(i18n.language === 'ar' ? 'ar-u-nu-latn' : undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Currency Converter + FX Rates Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Converter Tool */}
          <section className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1.5 h-4 rounded-full bg-[var(--success-color)]" />
              <h2 className="text-xs font-black uppercase tracking-widest opacity-80">{t('Converter')}</h2>
            </div>
            <div className="p-6 rounded-2xl border flex flex-col gap-4 shadow-xl backdrop-blur-md" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t('Amount')}</label>
                  <input 
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[var(--card-bg)]/5 border-none rounded-xl px-4 py-3 text-lg font-black focus:ring-2 focus:ring-[var(--success-color)]"
                    style={{ color: 'var(--text-color)' }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t('From')}</label>
                    <select 
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full bg-[var(--card-bg)]/5 border-none rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-[var(--success-color)] appearance-none"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {exchangeRates.map(r => (
                        <option key={r.currency} value={r.currency} className="bg-[var(--bg-color)]">{r.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-5 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 opacity-20" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t('To')}</label>
                    <div className="w-full bg-[var(--card-bg)]/5 border-none rounded-xl px-4 py-3 text-sm font-black flex items-center justify-between">
                      <span>TND</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t flex flex-col gap-1" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{t('RESULT')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[var(--success-color)]">{convertedValue}</span>
                  <span className="text-sm font-black opacity-30 uppercase">{t('DINARS')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* FX Carousel */}
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1.5 h-4 rounded-full bg-[var(--success-color)]" />
              <h2 className="text-xs font-black uppercase tracking-widest opacity-80">{t('FX RATES')}</h2>
            </div>
            
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-4 pb-4">
                {exchangeRates.map((rate, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="flex-shrink-0 p-5 rounded-2xl border transition-all duration-300 min-w-[200px] flex flex-col gap-4 group shadow-lg"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border-color)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <img loading="lazy" 
                          src={getFlagUrl(rate.currency)} 
                          alt={rate.currency}
                          className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-[var(--border-color)] relative z-10"
                          referrerPolicy="no-referrer"
                        />
                        <img loading="lazy" 
                          src={getFlagUrl('TND')} 
                          alt="TND"
                          className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-[var(--border-color)] relative z-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black opacity-80">{rate.currency}</span>
                        <span className="text-[9px] font-black opacity-20 uppercase">/ TND</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{t('RATE')}</span>
                      <span className="text-2xl font-black tracking-tighter">{rate.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Tunisia Stocks INTERACTIVE EXPLORER */}
        <section className="mb-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-1.5 h-4 rounded-full bg-[var(--success-color)]" />
            <h2 className="text-xs font-black uppercase tracking-widest opacity-80">{t('SECTOR EXPLORER')}</h2>
          </div>

          <SectorExplorer categories={categories} groupedStocks={groupedStocks} getCategoryIcon={getCategoryIcon} t={t} />

          {tunisiaStocks.length === 0 && (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed flex flex-col items-center gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
              <Briefcase className="w-8 h-8 opacity-20 mb-2" />
              <span className="text-xs font-black uppercase tracking-widest opacity-30">
                {t('Market Data Streams Offline')}
              </span>
            </div>
          )}
        </section>

        {/* Global Indices */}
        <section className="mb-12">
           <div className="mb-6 flex items-center gap-3">
            <div className="w-1.5 h-4 rounded-full bg-[var(--success-color)]" />
            <h2 className="text-xs font-black uppercase tracking-widest opacity-80">{t('GLOBAL BENCHMARKS')}</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6">
            {globalIndices.map((index, idx) => {
              const changeVal = parseFloat(index.change || '0');
              const isPositive = changeVal > 0;
              const isPulsing = pulseIndices[idx];
              
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -4, scale: 1.01 }}
                  animate={isPulsing ? {
                    backgroundColor: isPulsing === 'up' ? 'rgba(var(--success-color-rgb), 0.08)' : 'rgba(var(--accent-color-rgb), 0.08)',
                  } : {}}
                  className="p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] transition-all relative overflow-hidden backdrop-blur-md bg-[var(--card-bg)]/5 flex flex-col justify-between gap-3 sm:gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[var(--card-bg)]/5 flex items-center justify-center border border-[var(--border-color)] shrink-0 relative group overflow-hidden shadow-2xl">
                       {getIndexLogo(index.name) ? (
                         <>
                           <img loading="lazy" 
                            src={`https://flagcdn.com/w160/${getIndexLogo(index.name)}.png`} 
                            alt={index.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                           />
                           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                         </>
                       ) : (
                         <Globe className="w-6 h-6 sm:w-10 sm:h-10 text-[var(--text-color)]/20" />
                       )}
                       <div className={`absolute bottom-1 right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[var(--bg-color)] ${isPositive ? 'bg-[var(--success-color)]' : 'bg-[var(--accent-color)]'} shadow-[0_0_10px_rgba(var(--success-color-rgb),0.3)] z-10`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-black text-[10px] sm:text-lg uppercase italic tracking-tighter text-[var(--text-color)] leading-tight truncate">{index.name}</h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                        <span className="text-[7px] sm:text-[10px] font-black text-[var(--text-color)] opacity-30 tracking-widest uppercase truncate">{t('Index')}</span>
                        <div className={`w-1 h-1 rounded-full shrink-0 ${isPositive ? 'bg-[var(--success-color)]' : 'bg-[var(--accent-color)]'}`} />
                        <span className={`text-[8px] sm:text-[10px] font-black uppercase ${isPositive ? 'text-[var(--success-color)]' : 'text-[var(--accent-color)]'}`}>
                          {isPositive ? '+' : ''}{index.change}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-0.5 sm:gap-1">
                    <span className={`text-xl sm:text-4xl font-black tracking-tighter text-[var(--text-color)] transition-colors duration-500 ${isPulsing === 'up' ? 'text-[var(--success-color)]' : isPulsing === 'down' ? 'text-[var(--accent-color)]' : ''}`}>
                      {index.value}
                    </span>
                    {/* Simulated Sparkline */}
                    <div className="w-16 h-4 sm:w-24 sm:h-8 mt-1 sm:mt-2 opacity-30">
                      <svg viewBox="0 0 100 30" className="w-full h-full">
                        <path 
                          d={isPositive ? "M0 25 L20 20 L40 22 L60 10 L80 15 L100 5" : "M0 5 L20 15 L40 12 L60 25 L80 20 L100 28"} 
                          fill="none" 
                          stroke={isPositive ? "var(--success-color)" : "var(--accent-color)"} 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

interface SectorExplorerProps {
  categories: string[];
  groupedStocks: Record<string, StockQuote[]>;
  getCategoryIcon: (cat: string) => React.ReactNode;
  t: (key: string) => string;
}

function SectorExplorer({ categories, groupedStocks, getCategoryIcon, t }: SectorExplorerProps) {
  const [activeCategory, setActiveCategory] = React.useState(categories[0] || '');
  const detailViewRef = React.useRef<HTMLDivElement>(null);

  // Sync active category when data arrives
  React.useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    
    // Smooth scroll to the list on mobile
    if (window.innerWidth < 1024 && detailViewRef.current) {
      detailViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
      {/* SIDEBAR NAVIGATION */}
      <div className="lg:w-1/4 flex flex-col gap-2 overflow-y-auto pr-2 max-h-[400px] lg:max-h-[600px] hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group ${
              activeCategory === cat 
                ? 'bg-[var(--success-color)]/10 border-[var(--success-color)] shadow-[var(--success-color)]/10' 
                : 'bg-[var(--card-bg)]/5 border-[var(--border-color)] hover:bg-[var(--card-bg)]/10 hover:border-[var(--border-color)]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 ${
              activeCategory === cat ? 'bg-[var(--success-color)] text-white' : 'bg-[var(--card-bg)]/5 text-[var(--text-color)]/40'
            }`}>
              {getCategoryIcon(cat)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-sm font-black uppercase tracking-tighter truncate ${activeCategory === cat ? 'text-[var(--success-color)]' : 'text-[var(--text-color)]/60'}`}>
                {t(cat.toUpperCase())}
              </span>
              <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                {groupedStocks[cat].length} {t('COMPANIES')}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* DETAIL VIEW / WATCHLIST */}
      <div ref={detailViewRef} className="lg:flex-1 flex flex-col gap-4 scroll-mt-20">
        <div className="p-6 rounded-3xl border bg-[var(--card-bg)]/5 border-[var(--border-color)] backdrop-blur-md h-full shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--success-color)]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--success-color)] text-whiteflex items-center justify-center shadow-lg shadow-[var(--success-color)]/20">
                {getCategoryIcon(activeCategory)}
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--text-color)]">{t(activeCategory.toUpperCase())}</h3>
                <span className="text-[11px] font-black opacity-30 uppercase tracking-[0.2em]">{t('Sector Watchlist')}</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-[var(--card-bg)]/5 rounded-full border border-[var(--border-color)] hidden sm:block">
               <span className="text-[10px] font-black text-[var(--text-color)]/40 uppercase tracking-widest">{groupedStocks[activeCategory]?.length || 0} {t('UNITS')}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                {groupedStocks[activeCategory]?.map((stock, idx) => (
                  <motion.div 
                    key={`${stock.name}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]/5 hover:bg-[var(--card-bg)]/[0.08] hover:border-[var(--border-color)] transition-all cursor-crosshair"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[var(--text-color)] group-hover:text-[var(--success-color)] transition-colors">{stock.name}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-[var(--text-color)]/30 tracking-widest">{stock.acronym}</span>
                         <div className="w-1 h-1 rounded-full bg-[var(--card-bg)]/10" />
                         <span className="text-[10px] font-bold text-[var(--text-color)]/20 uppercase tracking-tighter">{t('Bourse de Tunis')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-[var(--text-color)] tracking-tighter">{stock.value}</span>
                      <span className="text-[9px] font-black text-[var(--text-color)]/20 uppercase tracking-widest">{t('TND')} / {t('UNIT')}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
