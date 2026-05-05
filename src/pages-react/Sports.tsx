import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { sportsService, parseSportsDate } from '../services/sportsService';
import { CalendarDays, History, TrendingUp, PlayCircle, Trophy, Clock, Activity, Target, Shield, Hash, Award, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsClient } from '../hooks/useIsClient';

const toLatinNumerals = (str: string | number) => {
    if (!str) return '';
    return String(str).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

const LEAGUE_GRADIENTS: Record<string, string> = {
    'Premiere League': 'linear-gradient(135deg, var(--accent-color), var(--success-color))',
    'La Liga': 'linear-gradient(135deg, var(--accent-color), var(--accent-color))',
    'Serie A': 'linear-gradient(135deg, var(--accent-color), var(--bg-color))',
    'Bundesliga': 'linear-gradient(135deg, var(--accent-color), var(--bg-color))',
    'Ligue 1 Pro': 'linear-gradient(135deg, var(--accent-color), var(--bg-color))',
    'Champions League': 'linear-gradient(135deg, var(--success-color), var(--bg-color))'
};

const LEAGUE_RULES: Record<string, (position: number, total: number) => { color: string, label: string } | null> = {
    'Premiere League': (pos, total) => {
        if (pos <= 4) return { color: 'bg-green-600', label: 'UCL' };
        if (pos === 5 || pos === 6) return { color: 'bg-blue-600', label: 'UEL' };
        if (pos > total - 3) return { color: 'bg-red-600', label: 'REL' };
        return null;
    },
    'Premier League': (pos, total) => {
        if (pos <= 4) return { color: 'bg-green-600', label: 'UCL' };
        if (pos === 5 || pos === 6) return { color: 'bg-blue-600', label: 'UEL' };
        if (pos > total - 3) return { color: 'bg-red-600', label: 'REL' };
        return null;
    },
    'La Liga': (pos, total) => {
        if (pos <= 4) return { color: 'bg-green-600', label: 'UCL' };
        if (pos === 5 || pos === 6) return { color: 'bg-blue-600', label: 'UEL' };
        if (pos > total - 3) return { color: 'bg-red-600', label: 'REL' };
        return null;
    },
    'Serie A': (pos, total) => {
        if (pos <= 4) return { color: 'bg-green-600', label: 'UCL' };
        if (pos === 5 || pos === 6) return { color: 'bg-blue-600', label: 'UEL' };
        if (pos > total - 3) return { color: 'bg-red-600', label: 'REL' };
        return null;
    },
    'Bundesliga': (pos, total) => {
        if (pos <= 4) return { color: 'bg-green-600', label: 'UCL' };
        if (pos >= 5 && pos <= 6) return { color: 'bg-blue-600', label: 'UEL' };
        if (pos > total - 3) return { color: 'bg-red-600', label: 'REL' };
        return null;
    },
    'Tunisia Ligue 1': (pos, total) => {
        if (pos <= 2) return { color: 'bg-yellow-600', label: 'CAF' };
        if (pos > total - 3) return { color: 'bg-red-600', label: 'REL' };
        return null;
    }
};

const getQualificationMarker = (leagueName: string, position: number, total: number) => {
    const rules = LEAGUE_RULES[leagueName];
    if (rules) return rules(position, total);
    return null;
};

const getMatchDate = (m: any) => {
    try {
        const raw = m.kickoff_utc || m.timestamp_utc || m.date;
        if (raw) {
            const d = parseSportsDate(raw);
            if (d) {
                const correctedDate = new Date(d.getTime() - (60 * 60 * 1000));
                return correctedDate.toLocaleDateString('en-US', { timeZone: 'Africa/Tunis', weekday: 'long', day: 'numeric', month: 'short' });
            }
        }
    } catch(e) {}
    return m.date?.split(' ')[0] || '-';
};

const getMatchTime = (m: any) => {
    try {
        const raw = m.kickoff_utc || m.timestamp_utc;
        if (raw) {
            const d = parseSportsDate(raw);
            if (d) {
                const correctedDate = new Date(d.getTime() - (60 * 60 * 1000));
                return correctedDate.toLocaleTimeString('en-GB', { timeZone: 'Africa/Tunis', hour: '2-digit', minute: '2-digit', hour12: false });
            }
        }
        if (m.date && m.date.includes(' ')) {
            const timePart = m.date.split(' ')[1];
            if (timePart) return timePart.substring(0, 5);
        }
    } catch(e) {}
    return m.matchTime || m.time || '-';
};

const TeamLogo = ({ name, src, className = "w-5 h-5" }: { name: string, src?: string, className?: string }) => {
    const isTunisianLeague = name === 'Tunisia Ligue 1' || name?.includes('Tunisi') || name === 'Ligue 1 Pro';
    const finalSrc = isTunisianLeague ? 'https://www.citypng.com/public/uploads/preview/hd-tunisia-national-football-team-logo-png-701751694775499ye48wylwud.png' : (src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=64&background=f3f4f6&color=002D72`);
    
    return (
        <img loading="lazy" 
            src={finalSrc} 
            alt={name} 
            className={`${className} object-contain flex-shrink-0`}
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=64&background=f3f4f6&color=002D72`; }}
        />
    );
};

export default function Sports() {
  const isClient = useIsClient();
  const { t, i18n } = useTranslation();
  const langPrefix = i18n.language.slice(0, 2).toLowerCase();
  const isArabic = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState<'fixtures' | 'results'>('fixtures');
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<any | null>(null);
  const [leagueData, setLeagueData] = useState<any>({ groups: [], standings: [], loading: false });
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  const fetchLiveMatches = useCallback(async () => {
      try {
          const liveData = await sportsService.getLiveMatches();
          setLiveMatches(liveData.matches || []);
      } catch (e) {}
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    sportsService.getLeagues().then((res) => {
        setLeagues(res);
        if (res.length > 0) setSelectedLeague(res[0]);
    });
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 60000);
    return () => clearInterval(interval);
  }, [fetchLiveMatches]);

  const fetchLeagueData = useCallback(async () => {
    if (!selectedLeague) return;
    setLeagueData({ groups: [], standings: [], loading: true });
    try {
        const [tabData, stdData] = await Promise.all([
            sportsService.getMatches(selectedLeague.name, activeTab),
            sportsService.getMatches(selectedLeague.name, 'standings')
        ]);
        setLeagueData({ 
            groups: [{ league: selectedLeague.name, ...tabData }], 
            standings: [{ league: selectedLeague.name, ...stdData }],
            loading: false 
        });
    } catch (e) {
        setLeagueData({ groups: [], standings: [], loading: false });
    }
  }, [activeTab, selectedLeague]);

  useEffect(() => {
    fetchLeagueData();
  }, [fetchLeagueData]);

  const activeGradient = selectedLeague ? (LEAGUE_GRADIENTS[selectedLeague.name] || 'linear-gradient(135deg, var(--accent-color), var(--bg-color))') : 'linear-gradient(135deg, var(--accent-color), var(--bg-color))';

  const groupedLiveMatches = useMemo(() => {
      return liveMatches.reduce((acc, match) => {
          const league = match.league || match.leagueName || 'Other';
          if (!acc[league]) acc[league] = [];
          acc[league].push(match);
          return acc;
      }, {} as Record<string, any[]>);
  }, [liveMatches]);

  return (
    <div className={`min-h-screen bg-transparent text-[var(--text-color)] ${isArabic ? 'rtl' : 'ltr'} font-sans pb-10`} dir={isArabic ? 'rtl' : 'ltr'}>
      <SEO title={t('Sports Center | TuniWave')} canonical={`https://tuniwave.com/${langPrefix}/sports`} />
      
      {liveMatches.length > 0 && (
          <div className="max-w-[1400px] mx-auto mt-2 sm:mt-4 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm rounded-lg overflow-hidden">
              <div className="bg-red-600 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                    <h2 className="text-[11px] font-black text-white uppercase tracking-widest leading-none m-0 flex items-center gap-2">
                        {t('Live Now')}
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-white bg-white/20 px-2 py-0.5 rounded-full">
                      <Trophy className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{liveMatches.length}</span>
                  </div>
              </div>
              <div className="flex flex-col max-h-[320px] overflow-y-auto bg-[var(--bg-color)] hide-scrollbar">
                  {Object.entries(groupedLiveMatches).map(([leagueName, matches]: [string, any], groupIdx) => (
                      <div key={groupIdx} className="mb-1">
                          <div className="bg-[var(--card-bg)] border-y border-[var(--border-color)] px-3 py-2 flex items-center gap-2 sticky top-0 z-10">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
                              <span className="text-[10px] font-black text-[var(--text-color)] uppercase tracking-widest">{leagueName}</span>
                          </div>
                          <div className="flex flex-col divide-y divide-[var(--border-color)] bg-[var(--card-bg)]">
                              {matches.map((m: any, idx: number) => (
                                  <div key={idx} className="p-2 md:p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 hover:bg-[var(--hover-bg)] transition-colors" dir="ltr">
                                      <div className="flex items-center gap-1.5 sm:gap-2 justify-end overflow-hidden">
                                          <span className="text-[11px] sm:text-[13px] font-bold text-[var(--text-color)] truncate">{m.home}</span>
                                          <TeamLogo name={m.home} src={m.home_logo} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                      </div>
                                      <div className="px-2 sm:px-4 flex flex-col items-center justify-center min-w-[50px] sm:min-w-[70px] shrink-0">
                                          <span className="text-base sm:text-lg font-black text-[var(--accent-color)] tabular-nums leading-tight">{isClient ? toLatinNumerals(m.score || '-') : '-'}</span>
                                          <span className="text-[9px] font-bold text-[var(--accent-color)] animate-pulse leading-none mt-0.5">{isClient && m.minute ? `${toLatinNumerals(m.minute)}'` : t('Live')}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 sm:gap-2 justify-start overflow-hidden">
                                          <TeamLogo name={m.away} src={m.away_logo} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                          <span className="text-[11px] sm:text-[13px] font-bold text-[var(--text-color)] truncate">{m.away}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* SOLID BLUE TOP LEAGUE SELECTOR */}
      <div className="bg-[var(--bg-color)] border-b border-[var(--border-color)] sticky top-[60px] md:top-[80px] z-30 shadow-sm mt-4">
          <div className="max-w-[1400px] mx-auto px-4">
              <div className="flex gap-2 overflow-x-auto py-2 hide-scrollbar">
                  {leagues.map((lg) => (
                      <button 
                          key={lg.name}
                          onClick={() => setSelectedLeague(lg)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors ${selectedLeague?.name === lg.name ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-color)] opacity-70 hover:opacity-100 hover:bg-[var(--hover-bg)]'}`}
                      >
                          <TeamLogo name={lg.name} src={lg.logo} className={`w-4 h-4 ${selectedLeague?.name === lg.name ? '' : 'grayscale opacity-80 brightness-200'}`} />
                          <span className="text-[11px] font-bold uppercase tracking-wider">{t(lg.name)}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-2 sm:mt-4">
          
          {/* CINEMATIC HERO HEADER */}
          <AnimatePresence mode="wait">
          {selectedLeague && (
              <motion.div 
                  key={selectedLeague.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-[100px] md:h-[180px] rounded-none sm:rounded-xl overflow-hidden shadow-sm mb-2 sm:mb-4"
                  style={{ background: activeGradient }}
              >
                  {/* Dynamic Watermark Logo */}
                  <div className="absolute right-[-5%] top-[50%] -translate-y-1/2 opacity-10 dark:opacity-15 pointer-events-none grayscale">
                      <TeamLogo name={selectedLeague.name} src={selectedLeague.logo} className="w-[150px] h-[150px] md:w-[350px] md:h-[350px] blur-[2px]" />
                  </div>
                  
                  <div className="absolute inset-0 p-3 md:p-6 flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-20 md:h-20 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md md:rounded-lg flex items-center justify-center shadow-sm shrink-0 p-1 md:p-2 z-10">
                          <TeamLogo name={selectedLeague.name} src={selectedLeague.logo} className="w-full h-full" />
                      </div>
                      <div className="flex flex-col z-10">
                          <span className="text-[var(--accent-color)] text-[9px] md:text-xs font-black uppercase tracking-[0.2em] mb-0 flex items-center gap-1.5"><Trophy className="w-3 h-3" /> {t('Official Tournament')}</span>
                          <h1 className="text-lg md:text-4xl font-black text-[var(--text-color)] uppercase tracking-tight leading-none">{t(selectedLeague.name)}</h1>
                      </div>
                  </div>
              </motion.div>
          )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4">
              
              <div className="lg:col-span-8 flex flex-col gap-4">

                  <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm overflow-hidden">
                      <div className="flex border-b border-[var(--border-color)] bg-[var(--hover-bg)]">
                          {[
                              { id: 'fixtures', icon: <CalendarDays className="w-3.5 h-3.5" />, label: t('Fixtures') },
                              { id: 'results', icon: <History className="w-3.5 h-3.5" />, label: t('Results') }
                          ].map(tab => (
                              <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab.id ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] bg-[var(--card-bg)]' : 'text-[var(--news-text-secondary)] hover:text-[var(--text-color)]'}`}
                              >
                                  {tab.icon} {tab.label}
                              </button>
                          ))}
                      </div>

                      <div className="p-0">
                          {leagueData.loading ? (
                              <div className="p-10 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-[var(--accent-color)] border-t-transparent animate-spin" /></div>
                          ) : leagueData.groups.length > 0 && leagueData.groups[0].matches?.length > 0 ? (
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                                className="flex flex-col divide-y divide-[var(--border-color)]"
                              >
                                  {Object.entries(
                                      leagueData.groups[0].matches.reduce((acc: any, m: any) => {
                                          const dateStr = getMatchDate(m);
                                          if (!acc[dateStr]) acc[dateStr] = [];
                                          acc[dateStr].push(m);
                                          return acc;
                                      }, {})
                                  ).map(([date, matches]: [string, any], groupIdx) => (
                                      <React.Fragment key={groupIdx}>
                                          <div className="bg-[var(--hover-bg)] px-3 py-1.5 flex items-center gap-2 border-b border-[var(--border-color)]">
                                              <CalendarDays className="w-3.5 h-3.5 text-[var(--accent-color)] opacity-80" />
                                              <span className="text-[9px] sm:text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">{date}</span>
                                          </div>
                                          {matches.map((m: any, mIdx: number) => (
                                              <motion.div 
                                                variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                                                key={`${groupIdx}-${mIdx}`} 
                                                className="flex items-center p-2 hover:bg-[var(--hover-bg)] transition-colors gap-2 sm:gap-3 group cursor-pointer"
                                                dir="ltr"
                                              >
                                                  <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center justify-center border-r border-[var(--border-color)] pr-2 sm:pr-3">
                                                      <div className="flex items-center gap-1 mb-0.5 opacity-50">
                                                          {activeTab === 'results' ? <Target className="w-2.5 h-2.5 text-[var(--text-color)]" /> : <Clock className="w-2.5 h-2.5 text-[var(--text-color)]" />}
                                                      </div>
                                                      <span className="text-[10px] sm:text-[12px] font-black text-[var(--text-color)]">{activeTab === 'results' ? 'FT' : (isClient ? getMatchTime(m) : '--:--')}</span>
                                                  </div>
                                          <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3 overflow-hidden">
                                              <div className="flex items-center justify-end gap-1.5 sm:gap-2 overflow-hidden">
                                                  <span className={`text-[11px] sm:text-[12px] truncate text-right ${m.score && parseInt(m.score.split(/[:-]/)[0]) > parseInt(m.score.split(/[:-]/)[1]) ? 'font-black text-[var(--text-color)]' : 'font-semibold text-[var(--news-text-secondary)]'}`}>{m.home}</span>
                                                  <TeamLogo name={m.home} src={m.home_logo} className="w-4 h-4 shrink-0" />
                                              </div>
                                              <div className="shrink-0 flex justify-center">
                                                  <div className="bg-[var(--bg-color)] px-1.5 sm:px-2 py-0.5 rounded border border-[var(--border-color)] min-w-[40px] sm:min-w-[44px] text-center group-hover:bg-[var(--accent-color)] transition-colors">
                                                      {m.score ? (
                                                          <span className="text-[11px] sm:text-[12px] font-black text-[var(--text-color)] tracking-wider group-hover:text-white transition-colors">{toLatinNumerals(m.score.replace(/-/g, ' - '))}</span>
                                                      ) : (
                                                          <span className="text-[9px] sm:text-[10px] font-bold text-[var(--news-text-secondary)] group-hover:text-white transition-colors">VS</span>
                                                      )}
                                                  </div>
                                              </div>
                                              <div className="flex items-center justify-start gap-1.5 sm:gap-2 overflow-hidden">
                                                  <TeamLogo name={m.away} src={m.away_logo} className="w-4 h-4 shrink-0" />
                                                  <span className={`text-[11px] sm:text-[12px] truncate text-left ${m.score && parseInt(m.score.split(/[:-]/)[1]) > parseInt(m.score.split(/[:-]/)[0]) ? 'font-black text-[var(--text-color)]' : 'font-semibold text-[var(--news-text-secondary)]'}`}>{m.away}</span>
                                              </div>
                                          </div>
                                          <div className="w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                              <PlayCircle className="w-4 h-4 text-[var(--accent-color)]" />
                                          </div>
                                              </motion.div>
                                          ))}
                                      </React.Fragment>
                                  ))}
                              </motion.div>
                          ) : (
                              <div className="p-8 text-center text-[11px] font-bold text-[var(--news-text-secondary)] uppercase tracking-widest">{t('No Matches Available')}</div>
                          )}
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4">
                  <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm overflow-hidden sticky top-[140px]">
                      <div className="bg-[var(--trending-bg)] px-3 py-2 flex items-center gap-2 border-b border-[var(--border-color)]">
                          <TrendingUp className="w-4 h-4 text-[var(--text-color)] opacity-80" />
                          <h2 className="text-xs font-black text-[var(--text-color)] uppercase tracking-widest leading-none m-0">{t('Standings')}</h2>
                      </div>
                      <div className="p-0">
                          {leagueData.loading ? (
                              <div className="p-10 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-[var(--accent-color)] border-t-transparent animate-spin" /></div>
                          ) : leagueData.standings && leagueData.standings.length > 0 ? (
                              <div className="overflow-x-auto" dir="ltr">
                                  <table className="w-full text-left">
                                      <thead>
                                          <tr className="bg-[var(--bg-color)] border-b border-[var(--border-color)]">
                                              <th className="px-2 py-2 text-center text-[9px] font-black text-[var(--news-text-secondary)] uppercase tracking-wider"><Hash className="w-3 h-3 inline-block opacity-60" /></th>
                                              <th className="px-1 py-2 text-left text-[9px] font-black text-[var(--news-text-secondary)] uppercase tracking-wider"><Shield className="w-3 h-3 inline-block mr-1 opacity-60" />{t('Team')}</th>
                                              <th className="px-1 py-2 text-center text-[9px] font-black text-[var(--news-text-secondary)] uppercase tracking-wider" title={t('Played')}><Activity className="w-3 h-3 inline-block opacity-60" /></th>
                                              <th className="px-1 py-2 text-center text-[9px] font-black text-[var(--news-text-secondary)] uppercase tracking-wider" title={t('Goal Difference')}><Target className="w-3 h-3 inline-block opacity-60" /></th>
                                              <th className="px-2 py-2 text-center text-[9px] font-black text-[var(--text-color)] uppercase tracking-wider" title={t('Points')}><Award className="w-3.5 h-3.5 inline-block text-[var(--accent-color)]" /></th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[var(--border-color)]">
                                          {typeof leagueData.standings[0].table === 'object' && !Array.isArray(leagueData.standings[0].table) 
                                            ? Object.entries(leagueData.standings[0].table).map(([subGroup, teams]: any, subIdx) => (
                                                <React.Fragment key={subIdx}>
                                                    {subGroup !== 'default' && subGroup !== 'Standings' && (
                                                        <tr className="bg-[var(--hover-bg)]"><td colSpan={5} className="px-2 py-1 font-black text-[9px] text-[var(--accent-color)] uppercase tracking-wider">{subGroup}</td></tr>
                                                    )}
                                                    {Array.isArray(teams) && teams.map((team: any, i: number) => {
                                                        const pos = team.position || i + 1;
                                                        const marker = getQualificationMarker(selectedLeague?.name || '', pos, teams.length);
                                                        return (
                                                            <tr key={i} className="hover:bg-[var(--hover-bg)] transition-colors">
                                                                <td className={`px-2 py-1.5 text-center text-[10px] font-bold ${marker ? 'text-white' : 'text-[var(--news-text-secondary)]'} ${marker ? marker.color : ''}`}>
                                                                    {pos}
                                                                    {marker && <span className="block text-[7px] leading-[8px] uppercase">{marker.label}</span>}
                                                                </td>
                                                                <td className="px-1 py-1.5 flex items-center gap-1.5">
                                                                    <TeamLogo name={team.team} src={team.logo || team.team_logo} className="w-3.5 h-3.5 shrink-0" />
                                                                    <span className="font-bold text-[11px] text-[var(--text-color)] truncate max-w-[100px] sm:max-w-[140px] lg:max-w-[100px] xl:max-w-[140px]">{team.team}</span>
                                                                </td>
                                                                <td className="px-1 py-1.5 text-center text-[10px] text-[var(--news-text-secondary)]">{team.played}</td>
                                                                <td className="px-1 py-1.5 text-center text-[10px] text-[var(--news-text-secondary)] font-medium">{team.goals_diff || 0}</td>
                                                                <td className="px-2 py-1.5 text-center font-black text-[12px] text-[var(--accent-color)]">{team.points}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))
                                            : Array.isArray(leagueData.standings[0].table) && leagueData.standings[0].table.map((team: any, i: number) => {
                                                const pos = team.position || i + 1;
                                                const marker = getQualificationMarker(selectedLeague?.name || '', pos, leagueData.standings[0].table.length);
                                                return (
                                                    <tr key={i} className="hover:bg-[var(--hover-bg)] transition-colors">
                                                        <td className={`px-2 py-1.5 text-center text-[10px] font-bold ${marker ? 'text-white' : 'text-[var(--news-text-secondary)]'} ${marker ? marker.color : ''}`}>
                                                            {pos}
                                                            {marker && <span className="block text-[7px] leading-[8px] uppercase">{marker.label}</span>}
                                                        </td>
                                                        <td className="px-1 py-1.5 flex items-center gap-1.5">
                                                            <TeamLogo name={team.team} src={team.logo || team.team_logo} className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="font-bold text-[11px] text-[var(--text-color)] truncate max-w-[100px] sm:max-w-[140px] lg:max-w-[100px] xl:max-w-[140px]">{team.team}</span>
                                                        </td>
                                                        <td className="px-1 py-1.5 text-center text-[10px] text-[var(--news-text-secondary)]">{team.played}</td>
                                                        <td className="px-1 py-1.5 text-center text-[10px] text-[var(--news-text-secondary)] font-medium">{team.goals_diff || 0}</td>
                                                        <td className="px-2 py-1.5 text-center font-black text-[12px] text-[var(--accent-color)]">{team.points}</td>
                                                    </tr>
                                                );
                                            })
                                          }
                                      </tbody>
                                  </table>
                              </div>
                          ) : (
                              <div className="p-8 text-center text-[11px] font-bold text-[var(--news-text-secondary)] uppercase tracking-widest">{t('No Data')}</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
