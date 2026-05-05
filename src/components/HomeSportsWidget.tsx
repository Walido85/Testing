import React, { useState, useEffect } from 'react';
import { Link } from '../utils/navigation';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { Radio, CalendarDays, Trophy, Sparkles, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { sportsService, parseSportsDate } from '../services/sportsService';
import { LazyLoad } from './LazyLoad';

export const HomeSportsWidget = () => {
    const { t, i18n } = useTranslation();
    const { lang } = useLanguage();
    const isArabic = i18n.language === 'ar';

    const [activeSportsTab, setActiveSportsTab] = useState<'live'|'fixtures'|'results'>('live');
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [upcomingFix, setUpcomingFix] = useState<any[]>([]);
    const [resultsMatches, setResultsMatches] = useState<any[]>([]);
    const [sportsLoading, setSportsLoading] = useState(true);

    useEffect(() => {
        const fetchSports = async () => {
            setSportsLoading(true);
            try {
                const liveData = await sportsService.getLiveMatches().catch(() => ({ matches: [] }));
                
                const sortedLive = (liveData?.matches || []).sort((a: any, b: any) => {
                    const minA = parseInt(a.minute) || 0;
                    const minB = parseInt(b.minute) || 0;
                    return minB - minA;
                });
                setLiveMatches(sortedLive);
                
                // Fetch secondary league data
                try {
                   const leagues = await sportsService.getLeagues();
                   if (leagues && leagues.length > 0) {
                       const priorityKeywords = ['tunisia', 'ligue 1 prof', 'champions', 'premier', 'laliga', 'serie a'];
                       const sortedLeagues = [...leagues].sort((a, b) => {
                           const aScore = priorityKeywords.findIndex(k => a.name.toLowerCase().includes(k));
                           const bScore = priorityKeywords.findIndex(k => b.name.toLowerCase().includes(k));
                           if (aScore !== -1 && bScore !== -1) return aScore - bScore;
                           if (aScore !== -1) return -1;
                           if (bScore !== -1) return 1;
                           return 0;
                       });
                       
                       const topLeaguesToFetch = sortedLeagues.slice(0, 3);
                       const leaguePromises = topLeaguesToFetch.flatMap(lg => {
                         return [
                           sportsService.getMatches(lg.name, 'fixtures').catch(() => ({ matches: [] })),
                           sportsService.getMatches(lg.name, 'results').catch(() => ({ matches: [] }))
                         ];
                       });
                       
                       const leagueResults = await Promise.all(leaguePromises);
                       const allFixt: any[] = [];
                       const allResults: any[] = [];
                       
                       leagueResults.forEach((res, i) => {
                         if (i % 2 === 0) allFixt.push(...(res?.matches?.filter((m: any) => m.status !== 'live') || []));
                         else allResults.push(...(res?.matches || []));
                       });
                       
                       const now = Date.now();
                       const futureFixtures = allFixt.filter(m => {
                           const raw = m.kickoff_utc || m.timestamp_utc;
                           const ts = raw ? (parseSportsDate(raw)?.getTime() || 0) : 0;
                           return ts === 0 || ts > now - 12 * 60 * 60 * 1000;
                       }).sort((a, b) => {
                           const tsA = (a.kickoff_utc || a.timestamp_utc) ? (parseSportsDate(a.kickoff_utc || a.timestamp_utc)?.getTime() || 0) : 0;
                           const tsB = (b.kickoff_utc || b.timestamp_utc) ? (parseSportsDate(b.kickoff_utc || b.timestamp_utc)?.getTime() || 0) : 0;
                           if (tsA === 0 && tsB === 0) return 0;
                           if (tsA === 0) return 1;
                           if (tsB === 0) return -1;
                           return tsA - tsB;
                       });
                       
                       const recentResults = allResults.sort((a, b) => {
                           const tsA = (a.kickoff_utc || a.timestamp_utc) ? (parseSportsDate(a.kickoff_utc || a.timestamp_utc)?.getTime() || 0) : 0;
                           const tsB = (b.kickoff_utc || b.timestamp_utc) ? (parseSportsDate(b.kickoff_utc || b.timestamp_utc)?.getTime() || 0) : 0;
                           if (tsA === 0 && tsB === 0) return 0;
                           if (tsA === 0) return 1;
                           if (tsB === 0) return -1;
                           return tsB - tsA;
                       });
                       
                       setUpcomingFix(futureFixtures.slice(0, 5));
                       setResultsMatches(recentResults.slice(0, 5));
                   }
                } catch (e) {
                   console.error("League error", e);
                }
            } catch (err) {
                console.error("Sports fetch error:", err);
            } finally {
                setSportsLoading(false);
            }
        };
        fetchSports();
    }, [i18n.language]);

    return (
      <LazyLoad rootMargin="300px" minHeight="500px">
        <div className="rounded-[16px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[var(--border-color)] bg-[var(--card-bg)] w-full mt-3 mb-2 relative z-10 transition-shadow">
          {/* Banner Area */}
          <div className="relative h-[220px] bg-[var(--card-bg)] flex flex-col justify-end pb-4 text-center overflow-hidden">
            <div className="absolute inset-0 bg-black/10 dark:bg-transparent">
               <img loading="lazy" src="https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80" className="absolute w-full h-full object-cover opacity-60 dark:opacity-40" alt="Football Stadium" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-[var(--card-bg)]/80 to-[var(--card-bg)]/20 dark:to-[var(--card-bg)]/30"></div>
            
            <div className="relative z-10 px-2 mt-auto">
              <div className="flex justify-between items-end mb-4 px-1 sm:px-4">
                <div className="flex flex-col items-center w-[25%] -ms-1">
                   <div className="w-12 h-12 bg-[var(--card-bg)] rounded-full p-1 shadow-lg mb-1 relative flex items-center justify-center overflow-hidden">
                     <div className="w-full h-full rounded-full border border-[var(--accent-color)] flex items-center justify-center p-1">
                       <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/en/e/ef/Federation_Tunisienne_de_Football_logo.svg" className="w-full h-full object-contain" alt="Tunisia L1" onError={(e) => { e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Tunisia.svg' }} />
                     </div>
                   </div>
                   <span className="text-[11px] text-[var(--text-color)] font-bold leading-tight uppercase font-sans tracking-wide">LIGUE 1</span>
                </div>
                <div className="flex flex-col items-center w-[25%]">
                   <div className="w-12 h-12 bg-[var(--card-bg)] rounded-full p-1.5 shadow-lg mb-1 flex items-center justify-center">
                     <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" className="w-full h-full object-contain" alt="Premier League" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                   </div>
                   <span className="text-[11px] text-[var(--text-color)] font-bold leading-tight uppercase font-sans tracking-wide">Premier<br/>League</span>
                </div>
                <div className="flex flex-col items-center w-[25%]">
                   <div className="w-12 h-12 bg-[var(--card-bg)] rounded-full p-1.5 shadow-lg mb-1 flex items-center justify-center">
                     <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg" className="w-full h-full object-contain" alt="LaLiga" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                   </div>
                   <span className="text-[11px] text-[var(--text-color)] font-bold leading-tight uppercase font-sans tracking-wide">LaLiga</span>
                </div>
                <div className="flex flex-col items-center w-[25%] me-1">
                   <div className="w-12 h-12 bg-[var(--card-bg)] rounded-full p-1 shadow-lg mb-1 flex items-center justify-center">
                     <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/en/e/e1/Serie_A_logo_%282022%29.svg" className="w-full h-full object-contain" alt="Serie A" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                   </div>
                   <span className="text-[11px] text-[var(--text-color)] font-bold leading-tight uppercase relative font-sans tracking-wide">SERIE A</span>
                </div>
              </div>
              <h2 className="text-[var(--text-color)] font-[900] text-2xl tracking-widest leading-tight mb-1 drop-shadow-md">{t('PREMIUM LEAGUES')}</h2>
              <p className="text-[var(--accent-color)] font-bold text-[12px] tracking-wide drop-shadow-md">{t('Tunisia')} <span className="text-[var(--text-color)]/30 mx-0.5">|</span> {t('England')} <span className="text-[var(--text-color)]/30 mx-0.5">|</span> {t('Spain')} <span className="text-[var(--text-color)]/30 mx-0.5">|</span> {t('Italy')}</p>
            </div>
          </div>

          <div className="flex bg-[var(--card-bg)] text-[var(--text-color)] border-t border-[var(--border-color)]">
            <button onClick={() => setActiveSportsTab('live')} className={`flex-1 py-2 flex flex-col items-center justify-center cursor-pointer transition-colors w-full ${activeSportsTab === 'live' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-color)] opacity-70 hover:opacity-100'}`}>
               <span className="relative flex h-4 w-4 mb-0.5 items-center justify-center">
                 <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeSportsTab === 'live' ? 'bg-white' : 'bg-[var(--text-color)]'}`}></span>
                 <Radio className={`relative inline-flex rounded-full h-4 w-4 ${activeSportsTab === 'live' ? 'text-white' : 'text-[var(--text-color)]'}`} />
               </span>
               <span className="text-[10px] font-bold tracking-wider">{t('Live')}</span>
            </button>
            <button onClick={() => setActiveSportsTab('fixtures')} className={`flex-1 py-2 flex flex-col items-center justify-center cursor-pointer transition-colors w-full ${activeSportsTab === 'fixtures' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-color)] opacity-70 hover:opacity-100'}`}>
               <CalendarDays className="w-4 h-4 mb-0.5" />
               <span className="text-[10px] font-bold tracking-wider">{t('Fixtures')}</span>
            </button>
            <button onClick={() => setActiveSportsTab('results')} className={`flex-1 py-2 flex flex-col items-center justify-center cursor-pointer transition-colors w-full ${activeSportsTab === 'results' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-color)] opacity-70 hover:opacity-100'}`}>
               <Trophy className="w-4 h-4 mb-0.5" />
               <span className="text-[10px] font-bold tracking-wider">{t('Results')}</span>
            </button>
          </div>

          <div className="py-3 bg-[var(--card-bg)]">
             {activeSportsTab === 'live' && (
                 <>
                 <div className="flex justify-between items-center mb-2.5 px-3">
                <h3 className="font-semibold uppercase tracking-[0.2em] text-[11px] lg:text-[12px] text-[var(--text-color)]/70 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[var(--accent-color)] " /> {t('Live Matches')}</h3>
                {liveMatches.length > 0 && <span className="text-[11px] text-[var(--news-text-secondary)] font-medium flex items-center gap-1 drop-shadow-sm"><Radio className="w-3.5 h-3.5 text-[var(--accent-color)] animate-pulse" /> {liveMatches.length} {t('Live')}</span>}
                 </div>
                 
                 <div className="relative group/carousel">
                   <button aria-label={t('Scroll left')} onClick={(e) => { e.preventDefault(); const c = document.getElementById('sports-carousel'); if (c) c.scrollBy({ left: isArabic ? 280 : -280, behavior: 'smooth' }); }} className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 text-[var(--text-color)]/50 hover:text-[var(--text-color)] bg-[var(--card-bg)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[var(--border-color)] p-1.5 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                     {isArabic ? <ChevronRight className="w-4 h-4" strokeWidth={2.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />}
                   </button>
                   <div id="sports-carousel" className="flex overflow-x-auto hide-scrollbar gap-3 snap-x pb-2 px-1 sm:px-3">
                    {sportsLoading ? (
                      Array(2).fill(0).map((_, i) => (
                        <div key={`live-sk-${i}`} className="snap-center bg-[var(--hover-bg)] animate-pulse min-w-[280px] h-[160px] rounded-2xl flex flex-col gap-3 shrink-0"></div>
                      ))
                    ) : liveMatches.length > 0 ? liveMatches.slice(0, 4).map((m, idx) => {
                        const scoreHome = m.score ? m.score.split(/[:-]/)[0]?.trim() : '-';
                        const scoreAway = m.score ? m.score.split(/[:-]/)[1]?.trim() : '-';
                        return (
                            <div key={`live-n-${idx}`} className="snap-center bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--accent-color)] min-w-[280px] rounded-[24px] p-5 flex flex-col gap-3 shrink-0 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-lg">
                                {/* Dynamic Background Effect */}
                                <div className={`absolute inset-0 bg-[var(--card-bg)]`} />
                                <div className="absolute -top-10 -right-10 w-48 h-48 bg-[var(--accent-color)] opacity-10 blur-3xl rounded-full pointer-events-none animate-pulse" />
                                
                                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse shadow-[0_0_8px_var(--accent-color)]" />
                                            <span className="text-[10px] font-black text-[var(--news-text-secondary)] uppercase tracking-widest truncate">{m.leagueName || m.league}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col items-center gap-3 flex-1 min-w-0 group-hover:scale-105 transition-transform duration-500">
                                            <div className="relative p-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-inner">
                                                <img loading="lazy" src={m.home_logo || sportsService.getTeamLogo(m.home) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.home)}&size=64`} alt={m.home} className="w-10 h-10 drop-shadow-md object-contain bg-[var(--card-bg)] rounded-lg" />
                                            </div>
                                            <span className="text-[10px] text-[var(--text-color)] text-center truncate w-full font-black uppercase">{m.home}</span>
                                        </div>
                                        
                                        <div className="flex flex-col items-center justify-center shrink-0 w-max sm:w-20 px-2">
                                            <div className="px-2 sm:px-3 py-1 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 rounded-full mb-2 flex items-center justify-center whitespace-nowrap">
                                                <span className="text-[9px] sm:text-[10px] font-black text-[var(--accent-color)] animate-pulse tracking-widest">{m.minute || m.time || m.matchTime ? `${String(m.minute || m.time || m.matchTime).replace("'", "")}'` : t('Live')}</span>
                                            </div>
                                            <div dir="ltr" className="text-3xl font-black font-sans tracking-tighter flex items-center justify-center gap-1 text-[var(--text-color)]">
                                                <span className={scoreHome !== '0' && scoreHome !== '-' ? 'text-[var(--accent-color)] drop-shadow-sm' : ''}>{scoreHome}</span>
                                                <span className="opacity-20 mx-1">:</span>
                                                <span className={scoreAway !== '0' && scoreAway !== '-' ? 'text-[var(--accent-color)] drop-shadow-sm' : ''}>{scoreAway}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-center gap-3 flex-1 min-w-0 group-hover:scale-105 transition-transform duration-500">
                                            <div className="relative p-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-inner">
                                                <img loading="lazy" src={m.away_logo || sportsService.getTeamLogo(m.away) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.away)}&size=64`} alt={m.away} className="w-10 h-10 drop-shadow-md object-contain bg-[var(--card-bg)] rounded-lg" />
                                            </div>
                                            <span className="text-[10px] text-[var(--text-color)] text-center truncate w-full font-black uppercase">{m.away}</span>
                                        </div>
                                    </div>
                                    
                                    <Link to={`/${lang}/sports`} className="mt-2 bg-[var(--hover-bg)] hover:bg-[var(--news-text-secondary)]/10 border border-[var(--border-color)] text-[var(--text-color)] font-bold py-2 rounded-[14px] flex justify-center items-center gap-1.5 cursor-pointer text-center transition-colors">
                                       <Radio className="w-3.5 h-3.5 text-[var(--accent-color)] animate-pulse" />
                                       <span className="text-[10px] tracking-wider uppercase">{t('Live Stream')}</span>
                                    </Link>
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-[var(--accent-color)] w-0 group-hover:w-full transition-all duration-700 opacity-50" />
                            </div>
                        )
                    }) : (
                      <div className="w-full text-center text-[var(--news-text-secondary)] py-6 text-xs font-medium border border-dashed border-[var(--border-color)] rounded-lg">{t('No live matches currently')}</div>
                    )}
                   </div>
                   <button aria-label={t('Scroll right')} onClick={(e) => { e.preventDefault(); const c = document.getElementById('sports-carousel'); if (c) c.scrollBy({ left: isArabic ? -280 : 280, behavior: 'smooth' }); }} className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-[var(--text-color)]/50 hover:text-[var(--text-color)] bg-[var(--card-bg)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[var(--border-color)] p-1.5 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                     {isArabic ? <ChevronLeft className="w-4 h-4" strokeWidth={2.5} /> : <ChevronRight className="w-4 h-4" strokeWidth={2.5} />}
                   </button>
                 </div>
                 </>
             )}

             {activeSportsTab === 'fixtures' && (
                 <>
                 <div className="flex justify-between items-center mb-2.5 px-3">
                <h3 className="font-semibold uppercase tracking-[0.2em] text-[11px] lg:text-[12px] text-[var(--text-color)]/70 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-[var(--accent-color)] " /> {t('Upcoming Fixtures')}</h3>
                   {upcomingFix.length > 0 && (
                     <Link to={`/${lang}/sports`} className="text-[11px] text-[var(--news-text-secondary)] font-medium flex items-center gap-0.5 drop-shadow-sm hover:text-[var(--text-color)] transition-colors">
                       {t('See More')} <ChevronRight className="w-3.5 h-3.5" />
                     </Link>
                   )}
                 </div>
                 
                 <div className="flex flex-col border-t border-[var(--border-color)]">
                     {upcomingFix.length > 0 ? Object.entries(upcomingFix.reduce((acc: any, fix) => {
                       let matchDate = fix.date || fix.status;
                       let matchTime = fix.time || '-';
                       
                       const raw = fix.kickoff_utc || fix.timestamp_utc;
                       if (raw) {
                         try {
                           const d = parseSportsDate(raw);
                           if (d && !isNaN(d.getTime())) {
                             const correctedDate = new Date(d.getTime() - (60 * 60 * 1000));
                             matchDate = correctedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'Africa/Tunis' });
                             matchTime = correctedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Tunis' });
                           }
                         } catch (e) {}
                       }
                       if (!acc[matchDate]) acc[matchDate] = [];
                       acc[matchDate].push({ ...fix, displayTime: matchTime });
                       return acc;
                     }, {})).map(([date, matches]: [string, any], groupIdx) => (
                       <React.Fragment key={groupIdx}>
                          <div className="bg-[var(--hover-bg)] px-3 py-1.5 flex items-center gap-2 border-b border-[var(--border-color)]">
                              <CalendarDays className="w-3 h-3 text-[var(--accent-color)] opacity-80" />
                              <span className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest">{date}</span>
                          </div>
                          {matches.map((fix: any, i: number) => (
                              <div key={`fix-${groupIdx}-${i}`} className="flex items-center px-3 py-2.5 border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer group">
                                  <div className="w-12 shrink-0 flex flex-col items-center justify-center border-e border-[var(--border-color)] pe-2">
                                      <div className="flex items-center gap-1 mb-0.5 opacity-50">
                                          <Clock className="w-2.5 h-2.5 text-[var(--text-color)]" />
                                      </div>
                                      <span className="text-[10px] font-black text-[var(--text-color)]">{fix.displayTime}</span>
                                  </div>
                                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-2 ps-2 overflow-hidden" dir="ltr">
                                      <div className="flex items-center justify-end gap-1.5 sm:gap-2 overflow-hidden">
                                          <span className="font-bold text-[11px] text-[var(--text-color)] text-right truncate">{fix.home}</span>
                                          <img loading="lazy" src={fix.home_logo || sportsService.getTeamLogo(fix.home) || `https://ui-avatars.com/api/?name=${encodeURIComponent(fix.home)}&size=32&background=random`} alt={fix.home} className="w-5 h-5 object-contain bg-[var(--card-bg)] rounded-full p-0.5 shadow-sm shrink-0" />
                                      </div>
                                      <div className="flex flex-col items-center justify-center min-w-[20px]">
                                          <span className="text-[9px] text-[var(--news-text-secondary)] font-medium lowercase">vs</span>
                                      </div>
                                      <div className="flex items-center justify-start gap-1.5 sm:gap-2 overflow-hidden">
                                          <img loading="lazy" src={fix.away_logo || sportsService.getTeamLogo(fix.away) || `https://ui-avatars.com/api/?name=${encodeURIComponent(fix.away)}&size=32&background=random`} alt={fix.away} className="w-5 h-5 object-contain bg-[var(--card-bg)] rounded-full p-0.5 shadow-sm shrink-0" />
                                          <span className="font-bold text-[11px] text-[var(--text-color)] text-left truncate">{fix.away}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                       </React.Fragment>
                     )) : (
                       <div className="text-center text-[var(--news-text-secondary)] py-4 text-xs font-medium border-b border-[var(--border-color)]">{t('No upcoming fixtures')}</div>
                     )}
                 </div>
                 </>
             )}
             
             {activeSportsTab === 'results' && (
                 <>
                 <div className="flex justify-between items-center mb-2.5 px-3">
                <h3 className="font-semibold uppercase tracking-[0.2em] text-[11px] lg:text-[12px] text-[var(--text-color)]/70 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-[var(--accent-color)] " /> {t('Latest Results')}</h3>
                   {resultsMatches.length > 0 && (
                     <Link to={`/${lang}/sports`} className="text-[11px] text-[var(--news-text-secondary)] font-medium flex items-center gap-0.5 drop-shadow-sm hover:text-[var(--text-color)] transition-colors">
                       {t('See More')} <ChevronRight className="w-3.5 h-3.5" />
                     </Link>
                   )}
                 </div>
                 
                 <div className="flex flex-col border-t border-[var(--border-color)]">
                     {resultsMatches.length > 0 ? Object.entries(resultsMatches.reduce((acc: any, resMatch) => {
                       let matchDate = resMatch.date || resMatch.status;
                       const raw = resMatch.kickoff_utc || resMatch.timestamp_utc;
                       if (raw) {
                         try {
                           const d = parseSportsDate(raw);
                           if (d && !isNaN(d.getTime())) {
                             const correctedDate = new Date(d.getTime() - (60 * 60 * 1000));
                             matchDate = correctedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'Africa/Tunis' });
                           }
                         } catch (e) {}
                       }
                       if (!acc[matchDate]) acc[matchDate] = [];
                       acc[matchDate].push(resMatch);
                       return acc;
                     }, {})).map(([date, matches]: [string, any], groupIdx) => (
                       <React.Fragment key={`res-group-${groupIdx}`}>
                          <div className="bg-[var(--hover-bg)] px-3 py-1.5 flex items-center gap-2 border-b border-[var(--border-color)]">
                              <CalendarDays className="w-3 h-3 text-[var(--accent-color)] opacity-80" />
                              <span className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest">{date}</span>
                          </div>
                          {matches.map((resMatch: any, i: number) => (
                              <div key={`res-${groupIdx}-${i}`} className="flex items-center px-3 py-2.5 border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer group">
                                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-2 overflow-hidden" dir="ltr">
                                      <div className="flex items-center justify-end gap-1.5 sm:gap-2 overflow-hidden">
                                          <span className="font-bold text-[11px] text-[var(--text-color)] text-right truncate">{resMatch.home}</span>
                                          <img loading="lazy" src={resMatch.home_logo || sportsService.getTeamLogo(resMatch.home) || `https://ui-avatars.com/api/?name=${encodeURIComponent(resMatch.home)}&size=32&background=random`} alt={resMatch.home} className="w-5 h-5 object-contain bg-[var(--card-bg)] rounded-full p-0.5 shadow-sm shrink-0" />
                                      </div>
                                      <div className="flex flex-col items-center justify-center min-w-[28px]">
                                          <span className="text-[10px] text-[var(--text-color)] font-black px-1.5 py-0.5 bg-[var(--hover-bg)] border border-[var(--border-color)] rounded tracking-wider">{resMatch.score}</span>
                                      </div>
                                      <div className="flex items-center justify-start gap-1.5 sm:gap-2 overflow-hidden">
                                          <img loading="lazy" src={resMatch.away_logo || sportsService.getTeamLogo(resMatch.away) || `https://ui-avatars.com/api/?name=${encodeURIComponent(resMatch.away)}&size=32&background=random`} alt={resMatch.away} className="w-5 h-5 object-contain bg-[var(--card-bg)] rounded-full p-0.5 shadow-sm shrink-0" />
                                          <span className="font-bold text-[11px] text-[var(--text-color)] text-left truncate">{resMatch.away}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                       </React.Fragment>
                     )) : (
                       <div className="text-center text-[var(--news-text-secondary)] py-4 text-xs font-medium border-b border-[var(--border-color)]">{t('No results')}</div>
                     )}
                 </div>
                 </>
             )}
          </div>
        </div>
      </LazyLoad>
    );
};
