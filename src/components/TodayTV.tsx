import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useAstroNavigate } from '../utils/navigation';
import { getCountryCode } from '../lib/countryUtils';

const getFlagUrl = (countryName: string) => {
  const code = getCountryCode(countryName);
  return `https://flagcdn.com/w80/${code}.png`;
};

const MiniPlayer = ({ streamUrl, logoUrl, name, channelId, onClick }: { streamUrl: string, logoUrl?: string, name?: string, channelId?: string, onClick?: () => void }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    setIsLoading(false);
    setHasStarted(false);
    setError(null);
  }, [channelId]);

  useEffect(() => {
    if (!streamUrl || !videoRef.current || !hasStarted) return;

    setIsLoading(true);

    if (streamUrl.includes('youtube.com') || streamUrl.includes('youtu.be')) {
      return;
    }

    const isHls = streamUrl.toLowerCase().endsWith('.m3u8') || streamUrl.includes('.m3u8');

    // Fast start timeout fallback
    const timeout = setTimeout(() => {
      if (isLoading && !error) setIsLoading(false);
    }, 3000);

    const handleCanPlay = () => setIsLoading(false);
    videoRef.current.addEventListener('canplay', handleCanPlay);

    const initHls = async (retry: boolean) => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      try {
        const HlsModule = await import('hls.js');
        const Hls: any = HlsModule.default || HlsModule;

        if (Hls && Hls.isSupported()) {
          // Worker-related bugs can cause blank screens, removing some worker options
          const hls = new Hls({
            xhrSetup: (xhr: any) => { xhr.withCredentials = false; },
            lowLatencyMode: true,
            liveSyncDurationCount: 2,
            liveMaxLatencyDurationCount: 3,
          });

          hls.loadSource(streamUrl);
          hls.attachMedia(videoRef.current!);
          hlsRef.current = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            setError(null);
            videoRef.current?.play().catch(() => { });
          });

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (!retry) {
                    initHls(true); // try once
                  } else {
                    setError('Network error');
                    setIsLoading(false);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Failed to load stream');
                  setIsLoading(false);
                  break;
              }
            }
          });
        } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = streamUrl;
        }
      } catch (err) {
        console.error("Failed to load hls.js dynamically", err);
        setError("Playback error");
        setIsLoading(false);
      }
    };

    if (isHls) {
      initHls(false);
    } else {
      videoRef.current.src = streamUrl;
      videoRef.current?.play().catch(() => { });
    }

    const currentVideoRef = videoRef.current;
    return () => {
      clearTimeout(timeout);
      currentVideoRef?.removeEventListener('canplay', handleCanPlay);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, hasStarted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = !isMuted ? 'mute' : 'unMute';
      iframeRef.current.contentWindow.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const startPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setHasStarted(true);
  };

  if (!streamUrl) {
    return (
      <div className="absolute inset-0 bg-[var(--bg-color)]" onClick={onClick}>
        {logoUrl && (
          <>
            <img loading="lazy" src={logoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-125" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <img loading="lazy" src={logoUrl} alt={name} className="absolute inset-0 w-full h-full object-contain p-2 drop-shadow-2xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </>
        )}
      </div>
    );
  }

  const isYoutube = streamUrl.includes('youtube.com') || streamUrl.includes('youtu.be');
  const videoId = isYoutube ? (streamUrl.split("v=")[1]?.split("&")[0] || streamUrl.split("youtu.be/")[1]?.split(/[?#]/)[0]) : null;

  return (
    <div ref={containerRef} className="absolute inset-0 bg-transparent group pointer-events-auto cursor-default">
      {(!hasStarted || isLoading) && (
        <div className="absolute inset-0 z-20 bg-[var(--bg-color)] flex items-center justify-center">
          {logoUrl && (
            <img loading="lazy" src={logoUrl} alt={name} className={`relative z-10 w-32 h-32 object-contain drop-shadow-2xl ${isLoading ? 'animate-pulse' : ''}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}
          <div className="absolute inset-0 opacity-40 bg-black/60" />
          {logoUrl && (
            <img loading="lazy" src={logoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-125 pointer-events-none" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}

          {!hasStarted ? (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
              <button aria-label={t('Play')} type="button" onClick={startPlayback} className="bg-[var(--accent-color)] hover:opacity-90 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all flex items-center justify-center group-hover:animate-pulse cursor-pointer">
                <Play className="w-8 h-8 ms-1 rtl:-scale-x-100" />
              </button>
            </div>
          ) : (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`absolute inset-0 ${isFullscreen ? 'pointer-events-auto bg-black' : 'pointer-events-none'}`}>
        {error ? (
          <div className="absolute inset-0 bg-[var(--bg-color)] flex items-center justify-center z-20 pointer-events-auto">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-color)]/10 flex items-center justify-center mb-3">
                <VolumeX className="w-6 h-6 text-[var(--accent-color)]" />
              </div>
              <p className="text-[var(--text-color)] font-medium text-sm">{t('Stream temporarily unavailable')}</p>
              <p className="text-[var(--text-color)]/50 text-xs mt-1">{error}</p>
            </div>
          </div>
        ) : isYoutube && videoId && hasStarted ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&enablejsapi=1`}
            className={isFullscreen ? "w-full h-full relative z-10 pointer-events-auto" : "absolute top-1/2 left-1/2 w-[180%] h-[180%] -translate-x-1/2 -translate-y-1/2 z-10"}
            allow="autoplay; fullscreen"
            onLoad={() => setIsLoading(false)}
          />
        ) : hasStarted ? (
          <video
            ref={videoRef}
            className={`w-full h-full relative z-10 ${isFullscreen ? 'object-contain pointer-events-auto bg-black' : 'object-cover'}`}
            autoPlay
            muted={isMuted}
            playsInline
          />
        ) : null}
      </div>

      {/* Controls Overlay */}
      {hasStarted && !isLoading && !error && (
        <div className="absolute inset-0 z-30 opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none shadow-[inset_0px_50px_40px_-20px_rgba(0,0,0,0.5),inset_0px_-50px_40px_-20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-end pointer-events-auto">
            <button aria-label={t('Toggle Fullscreen')} onClick={toggleFullscreen} className="bg-[var(--card-bg)] hover:bg-[var(--accent-color)] text-[var(--text-color)] hover:text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95">
              <Maximize className="w-[18px] h-[18px]" />
            </button>
          </div>
          <div className="flex justify-start pointer-events-auto">
            <button aria-label={t('Toggle Mute')} onClick={toggleMute} className="bg-[var(--card-bg)] hover:bg-[var(--accent-color)] text-[var(--text-color)] hover:text-white p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export function TodayTV({ channels: initialChannels }: { channels?: any[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const navigate = useAstroNavigate();
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

  const mainChannel = channels.find(c => c.id === selectedChannelId) || (channels.length > 0 ? channels[0] : null);
  const trendingChannels = channels.length > 0 ? channels.slice(0, 3) : [];

  const getPlayerUrl = (channel: any) => {
    if (!channel) return '';
    if (channel.youtube_link?.trim()) {
      const url = channel.youtube_link.trim();
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
        if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
      }
      return url;
    }
    const stream = channel.stream_link?.trim() || "";
    if (stream.includes("youtu.be/")) {
      const videoId = stream.split("youtu.be/")[1]?.split(/[?#]/)[0];
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return stream;
  };

  const streamUrl = getPlayerUrl(mainChannel);

  const handleChannelClick = (e: React.MouseEvent, channel: any) => {
    e.preventDefault();
    setSelectedChannelId(channel.id);
  };

  const handlePlayerClick = () => {
    if (mainChannel) {
      navigate(`/${lang}/tv?channel=${mainChannel.id}`);
    }
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
