import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from '../utils/navigation';
import { getCountryCode } from '../lib/countryUtils';

const getFlagUrl = (countryName: string) => {
  const code = getCountryCode(countryName);
  return `https://flagcdn.com/w80/${code}.png`;
};


export function TodayTV({ channels: initialChannels }: { channels?: any[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const [channels, setChannels] = useState<any[]>(initialChannels || []);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  useEffect(() => {
    if (initialChannels !== undefined) {
      setChannels(initialChannels);
      return;
    }

    async function loadChannels() {
      try {
        const cachedStr = sessionStorage.getItem('tuniwave_tv_today');
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < 30 * 60 * 1000) {
            setChannels(cached.data);
            return;
          }
        }

        const q = query(collection(db, 'tv'), where('status', '==', 'active'), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sessionStorage.setItem('tuniwave_tv_today', JSON.stringify({ data, timestamp: Date.now() }));
        setChannels(data);
      } catch (e) {
        console.error("Failed to load TV channels", e);
      }
    }
    loadChannels();
  }, [initialChannels]);

  const trendingChannels = channels.length > 0 ? channels.slice(0, 3) : [];

  const handleChannelClick = (e: React.MouseEvent, channel: any) => {
    e.preventDefault();
    setSelectedChannelId(channel.id);
  };

  return (
    <div className="w-full font-sans mx-auto pt-4 px-0">
      <div className="bg-[var(--card-bg)] rounded-[16px] border border-[var(--border-color)] shadow-sm backdrop-blur-xl relative overflow-hidden flex flex-col text-[var(--text-color)] w-full mb-4">
        <div className="h-[4px] w-full bg-[var(--accent-color)] shrink-0" />
        <div className="p-4 flex flex-col">
          <div className="pb-3 border-b border-[var(--border-color)] flex justify-between items-center whitespace-nowrap mb-6">
            <div className="flex items-center gap-2">
              <div className="w-[14px] h-[14px] bg-[var(--accent-color)] shrink-0 rounded-sm shadow-[0_0_8px_rgba(var(--accent-color-rgb),0.5)]"></div>
              <h2 className="text-[17px] lg:text-[19px] font-black text-[var(--text-color)] tracking-tight flex items-center gap-2">
                {t('Premium Video Hub')}
                <span className="bg-red-600 text-[10px] px-1.5 py-0.5 rounded-sm animate-pulse uppercase tracking-wider text-white">{t('On Air')}</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="relative pb-6 pt-3">
              {/* Channel Surfer */}
              <div className="mb-8">
                <h2 className="text-[14px] uppercase tracking-[0.15em] font-bold text-[var(--news-text-secondary)] mb-4 flex items-center gap-2">
                  {t('Channel Surfer: Live TV')}
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-2">
                  {channels.map((channel, idx) => (
                    <button aria-label={`${t('Play channel')} ${channel.title}`} onClick={(e) => handleChannelClick(e, channel)} key={idx} className={`text-left w-[110px] h-[150px] shrink-0 rounded-[12px] relative overflow-hidden bg-[var(--card-bg)] border-[1px] ${selectedChannelId === channel.id || (!selectedChannelId && idx === 0) ? 'border-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.2)]' : 'border-[var(--border-color)] hover:border-[var(--accent-color)]'} group transition-all duration-300`}>
                      <div className="absolute inset-0"></div>
                      {channel.logo_url && <img loading="lazy" src={channel.logo_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl group-hover:opacity-30 transition-opacity" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                      <img loading="lazy" src={channel.logo_url || "https://images.unsplash.com/photo-1533075253896-1215b4ebfdf9?auto=format&fit=crop&w=300&q=80"} alt={channel.name} className="absolute inset-0 w-full h-full object-contain p-4 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1533075253896-1215b4ebfdf9?auto=format&fit=crop&w=300&q=80"; }} />
                      <div className="absolute top-2 left-2 bg-[var(--accent-color)] text-white text-[8px] font-black px-1.5 py-[2px] rounded flex items-center gap-1 z-10 shadow-sm uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-[var(--card-bg)] rounded-full animate-pulse"></div>LIVE
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent pointer-events-none opacity-80 group-hover:opacity-90"></div>
                      
                      {/* Country Flag - Non-circular */}
                      {channel.country && channel.country !== "Global" && (
                        <div className="absolute bottom-2 right-2 z-30 pointer-events-none">
                          <div className="rounded-sm w-[16px] h-[10px] overflow-hidden shadow-sm">
                            <img
                              src={getFlagUrl(channel.country)}
                              alt={channel.country}
                              className="w-full h-full object-contain bg-slate-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://flagcdn.com/w160/un.png";
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-2 right-2 z-10">
                        <p className="text-[10px] text-[var(--text-color)] font-bold text-center drop-shadow-lg leading-tight truncate tracking-widest uppercase">{channel.name}</p>
                      </div>
                      {(selectedChannelId === channel.id || (!selectedChannelId && idx === 0)) && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-transparent">
                          <div className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]/80 w-[50%] rounded-r-full shadow-[0_0_10px_rgba(var(--accent-color-rgb),0.6)]"></div>
                        </div>
                      )}
                    </button>
                  ))}
                  {channels.length === 0 && (
                    [1, 2, 3, 4].map(i => (
                      <div key={i} className="w-[110px] h-[150px] shrink-0 rounded-[12px] relative overflow-hidden bg-[var(--card-bg)] animate-pulse border border-[var(--border-color)]"></div>
                    ))
                  )}
                </div>
              </div>

              {/* Trending Videos */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-[14px] uppercase tracking-[0.15em] font-bold text-[var(--news-text-secondary)] flex items-center gap-2">
                    {t('Trending Videos')}
                  </h2>
                  <Link to={`/${lang}/tv`} className="text-[10px] uppercase tracking-wider text-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors font-bold">{t('See All')}</Link>
                </div>
                <div className="flex flex-col gap-4">
                  {trendingChannels.map((channel, idx) => (
                    <Link to={`/${lang}/tv?channel=${channel.id}`} key={idx} className="flex gap-4 items-center group">
                      <div className="w-[140px] h-[80px] shrink-0 rounded-[8px] overflow-hidden relative shadow-lg border border-[var(--border-color)] bg-[var(--card-bg)] group-hover:border-[var(--accent-color)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-color)]/80 to-transparent z-10 pointer-events-none"></div>
                        <img loading="lazy" src={channel.logo_url} alt={channel.name} className="w-full h-full object-contain p-2 opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <div className="absolute bottom-1.5 right-1.5 bg-[var(--accent-color)] text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-[2px] rounded z-20">LIVE</div>
                        
                        {/* Country Flag - Left Bottom Corner for Trending */}
                        {channel.country && channel.country !== "Global" && (
                          <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
                            <div className="rounded-sm w-[14px] h-[9px] overflow-hidden border border-white/20 shadow-sm">
                              <img
                                src={getFlagUrl(channel.country)}
                                alt={channel.country}
                                className="w-full h-full object-contain bg-slate-800"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://flagcdn.com/w160/un.png";
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col pe-2 flex-1">
                        <h3 className="text-[13px] font-bold text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors leading-snug mb-1.5 line-clamp-2 uppercase tracking-wide">{channel.name}</h3>
                        <p className="text-[10px] text-[var(--news-text-secondary)] font-bold uppercase tracking-widest truncate">{channel.genre || 'TuniWave Originals'} <span className="mx-1 text-[var(--news-text-secondary)]">•</span> <span className="text-[var(--accent-color)]">Live Now</span></p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
