import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
const ReactPlayer = lazy(() => import('react-player'));
import { Play, Pause, X, Share2, Volume2, VolumeX, Timer, Heart, Activity } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { getStationListeners } from '../lib/radioUtils';
import { LiveListenerCount } from './LiveListenerCount';

const Player = ReactPlayer as any;
const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@latest';

export default function PersistentPlayer() {
  const { t } = useTranslation();
  const { 
    currentStream, 
    stationInfo, 
    isPlaying, 
    isExpanded, 
    togglePlay, 
    toggleExpand, 
    closePlayer,
    favorites,
    toggleFavorite,
    sleepTimer,
    setSleepTimer,
    accentColor,
    setAccentColor,
    volume,
    setVolume
  } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showSleepOptions, setShowSleepOptions] = useState(false);

  // Extract color from logo
  useEffect(() => {
    if (!stationInfo?.logo_url) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = stationInfo.logo_url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      // Ensure color isn't too dark or too light for visibility
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness < 40) {
        setAccentColor('#ff4e00'); // Fallback to brand orange if too dark
      } else {
        setAccentColor(`rgb(${r}, ${g}, ${b})`);
      }
    };
    img.onerror = () => setAccentColor('#ff4e00');
  }, [stationInfo?.logo_url, setAccentColor]);

  // Media Session API for Lock Screen & Notifications
  useEffect(() => {
    if (!('mediaSession' in navigator) || !stationInfo) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: stationInfo.name,
      artist: t('Tunisian Live Radio'),
      album: stationInfo.genre,
      artwork: [
        { src: stationInfo.logo_url, sizes: '96x96', type: 'image/png' },
        { src: stationInfo.logo_url, sizes: '128x128', type: 'image/png' },
        { src: stationInfo.logo_url, sizes: '192x192', type: 'image/png' },
        { src: stationInfo.logo_url, sizes: '256x256', type: 'image/png' },
        { src: stationInfo.logo_url, sizes: '384x384', type: 'image/png' },
        { src: stationInfo.logo_url, sizes: '512x512', type: 'image/png' },
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (!isPlaying) togglePlay();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      if (isPlaying) togglePlay();
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      closePlayer();
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
    };
  }, [stationInfo, isPlaying, togglePlay, closePlayer, t]);

  // Update playback state in Media Session
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  const getPlayerType = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.toLowerCase().endsWith('.m3u8') || url.includes('.m3u8')) return 'hls';
    return 'native';
  };

  // Handle stream loading for native/HLS
  useEffect(() => {
    if (!currentStream || !audioRef.current) return;
    
    const type = getPlayerType(currentStream);
    const isHttp = currentStream.toLowerCase().startsWith('http://');
    
    // Use a public CORS proxy for all streams to handle CORS and Mixed Content issues in the browser.
    const safeUrl = `https://corsproxy.io/?url=${encodeURIComponent(currentStream)}`;

    if (type === 'youtube') return; // Handled by ReactPlayer

    if (type === 'hls') {
      const loadHls = async () => {
        try {
          const HlsModule = await import('hls.js');
          const Hls: any = HlsModule.default || HlsModule;
          
          if (Hls.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(safeUrl);
            hls.attachMedia(audioRef.current!);
            hlsRef.current = hls;
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (isPlaying) {
                audioRef.current?.play().catch(e => console.warn("HLS Play failed:", e));
              }
            });
          } else if (audioRef.current && audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            audioRef.current.src = safeUrl;
            audioRef.current.load();
            if (isPlaying) {
              audioRef.current.play().catch(e => console.warn("Native HLS Play failed:", e));
            }
          }
        } catch (error) {
          console.error("Failed to load hls.js dynamically", error);
        }
      };

      loadHls();
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      const playNative = (url: string) => {
        if (!audioRef.current) return;
        audioRef.current.src = url;
        audioRef.current.load(); // Required when changing src
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => console.warn(`Native Play failed for ${url}:`, e));
          }
        }
      };

      // Play the stream directly to avoid HTTPS upgrade timeout delays (which take 6-7 seconds)
      playNative(currentStream);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStream]);

  // Handle play/pause state changes for native/HLS
  useEffect(() => {
    if (!audioRef.current || !currentStream) return;
    const type = getPlayerType(currentStream);
    if (type === 'youtube') return;

    if (isPlaying) {
      audioRef.current.play().catch(e => console.warn("Play failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentStream]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleShare = async () => {
    if (navigator.share && stationInfo) {
      try {
        await navigator.share({
          title: `Listening to ${stationInfo.name}`,
          text: `Check out ${stationInfo.name} on Radio Portal!`,
          url: window.location.href,
        });
      } catch (err) {
        console.warn("Share failed:", err);
      }
    }
  };

  if (!currentStream || !stationInfo) return null;

  const isHttp = currentStream.toLowerCase().startsWith('http://');
  const safeUrl = isHttp ? `https://corsproxy.io/?url=${encodeURIComponent(currentStream)}` : currentStream;
  const isYoutube = getPlayerType(safeUrl) === 'youtube';

  return (
    <>
      {/* Hidden Audio Player */}
      <div className="hidden">
        {isYoutube ? (
          <Suspense fallback={null}>
            <Player 
              url={safeUrl} 
              playing={isPlaying} 
              volume={isMuted ? 0 : volume}
              width="0" 
              height="0" 
              playsinline 
            />
          </Suspense>
        ) : (
          <audio ref={audioRef} preload="auto" />
        )}
      </div>

      <AnimatePresence>
        {/* Expanded Player */}
        {isExpanded && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[1000] bg-[var(--bg-color)] flex flex-col"
          >
            {/* Dynamic Gradient Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 blur-[120px] scale-125"
              style={{ backgroundImage: `url(${stationInfo.logo_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black" />
            
            <div className="relative z-10 flex flex-col h-full p-6 md:p-8 pb-40 md:pb-8 safe-area-top safe-area-bottom">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <button 
                  onClick={() => {
                    handleShare();
                  }}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={() => {
                    toggleExpand();
                  }}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </button>

                <button 
                  onClick={() => {
                    toggleFavorite(stationInfo.id);
                  }}
                  className={`p-2 transition-colors ${favorites.includes(stationInfo.id) ? 'text-[var(--accent-color)]' : 'text-white/40 hover:text-white'}`}
                >
                  <Heart className={`w-6 h-6 ${favorites.includes(stationInfo.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-12 max-w-lg mx-auto w-full">
                {/* Large Station Logo with Soft Glow */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className="w-64 h-64 md:w-80 md:h-80 bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-sm p-6 md:p-10 rounded-[40px] md:rounded-[60px] shadow-[0_0_80px_rgba(var(--accent-color-rgb),0.3)] flex items-center justify-center relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[40px] md:rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  {stationInfo.logo_url ? (
                    <img loading="lazy" 
                      src={stationInfo.logo_url} 
                      alt={stationInfo.name} 
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] font-black text-8xl uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                      {stationInfo.name.charAt(0)}
                    </div>
                  )}
                </motion.div>
                
                <div className="text-center space-y-1 md:space-y-4 w-full">
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white line-clamp-2 italic drop-shadow-2xl"
                  >
                    {stationInfo.name}
                  </motion.h2>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2 md:gap-3"
                  >
                    <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-[10px] font-black uppercase tracking-widest text-white/80">
                      {stationInfo.genre}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest animate-pulse" style={{ color: accentColor }}>
                      {t('Live Streaming')}
                    </span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="flex justify-center"
                  >
                    <LiveListenerCount 
                      key={`player-listeners-${stationInfo.id}`}
                      stationId={stationInfo.id}
                      baseCount={getStationListeners(stationInfo.id)} 
                      className="!bg-[var(--card-bg)]/5 !px-4 !py-2 !rounded-xl"
                    />
                  </motion.div>
                </div>
                
                {/* Sleep Timer Indicator */}
                {sleepTimer !== null && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-sm text-[10px] font-black uppercase tracking-widest text-[var(--text-color)]/60">
                    <Timer className="w-3 h-3" />
                    {sleepTimer} {t('min left')}
                  </div>
                )}
                
                {/* Volume Slider */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-full flex items-center gap-4 md:gap-6 px-4"
                >
                  <button 
                    onClick={() => {
                      setIsMuted(!isMuted);
                    }}
                    className="text-[var(--text-color)]/40 hover:text-[var(--text-color)] transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  <div className="flex-1 relative h-1.5 bg-[var(--card-bg)]/10 rounded-full overflow-hidden group">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[var(--card-bg)] transition-all duration-100"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </motion.div>
                
                {/* Controls */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-8 md:gap-12 w-full relative"
                >
                  <div className="relative">
                    <div className="flex flex-col items-center gap-2">
                      <button 
                        onClick={() => {
                          setShowSleepOptions(!showSleepOptions);
                        }}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-sm flex items-center justify-center transition-all ${sleepTimer ? 'text-[var(--accent-color)] border-[var(--accent-color)]' : 'text-[var(--text-color)]/60 hover:text-[var(--text-color)]'}`}
                        style={{ color: sleepTimer ? accentColor : undefined, borderColor: sleepTimer ? accentColor : undefined }}
                      >
                        <Timer className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-color)]/40">{t('Sleep')}</span>
                    </div>
                    
                    <AnimatePresence>
                      {showSleepOptions && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-sm rounded-2xl p-2 flex flex-col gap-1 min-w-[100px]"
                        >
                          {[15, 30, 60].map(mins => (
                            <button 
                              key={mins}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                setSleepTimer(mins);
                                setShowSleepOptions(false);
                              }}
                              className="px-4 py-2 hover:bg-[var(--card-bg)]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
                            >
                              {mins} {t('min')}
                            </button>
                          ))}
                          {sleepTimer && (
                            <button 
                              onPointerDown={(e) => {
                                e.preventDefault();
                                setSleepTimer(null);
                                setShowSleepOptions(false);
                              }}
                              className="px-4 py-2 hover:bg-[var(--card-bg)]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]"
                            >
                              {t('Off')}
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => {
                      togglePlay();
                    }}
                    className="w-24 h-24 md:w-28 md:h-28 bg-[var(--card-bg)] rounded-full flex items-center justify-center text-[var(--accent-color)] hover:scale-105 active:scale-95 transition-all shadow-xl border border-[var(--border-color)]"
                  >
                    {isPlaying ? <Pause className="w-10 h-10 md:w-12 md:h-12 fill-current" /> : <Play className="w-10 h-10 md:w-12 md:h-12 ml-2 fill-current" />}
                  </button>

                  <button 
                    onClick={() => {
                      closePlayer();
                    }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-sm flex items-center justify-center text-[var(--text-color)]/60 hover:text-[var(--accent-color)] hover:bg-[var(--card-bg)]/10 transition-all"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Player */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,16px)+8px)] md:bottom-4 left-0 right-0 md:left-auto md:right-4 md:w-96 z-[60] cursor-pointer px-2 md:px-0" 
            onClick={toggleExpand}
          >
            <div 
              onClick={() => {
                toggleExpand();
              }}
              className="mx-2 md:mx-0 overflow-hidden rounded-2xl border border-[var(--border-color)] shadow-[0_8px_30px_rgba(0,0,0,0.5)] bg-[var(--card-bg)]/80 backdrop-blur-xl"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl"
                style={{ backgroundImage: `url(${stationInfo.logo_url})` }}
              />
              
              <div className="relative z-10 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-[var(--card-bg)]/10 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 shadow-inner">
                    {stationInfo.logo_url ? (
                      <img loading="lazy" 
                        src={stationInfo.logo_url} 
                        alt={stationInfo.name} 
                        className="w-full h-full object-contain drop-shadow-md" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] font-black text-2xl uppercase drop-shadow-md">
                        {stationInfo.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[var(--text-color)] truncate">{stationInfo.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: accentColor }}>{stationInfo.genre}</span>
                      {sleepTimer !== null && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-[var(--text-color)]/40 uppercase tracking-widest">
                          <Timer className="w-2 h-2" />
                          {sleepTimer}m
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[8px] font-black text-[var(--text-color)]/40 uppercase tracking-widest">
                        <Activity className="w-2 h-2 text-[var(--accent-color)]/60" />
                        {getStationListeners(stationInfo.id).toLocaleString('en-US')}
                      </div>
                      {isPlaying && (
                        <div className="flex items-end gap-[1px] h-2">
                          <motion.div animate={{ height: [2, 8, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-[2px] bg-[var(--card-bg)]/40" />
                          <motion.div animate={{ height: [4, 2, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-[2px] bg-[var(--card-bg)]/40" />
                          <motion.div animate={{ height: [8, 4, 2] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-[2px] bg-[var(--card-bg)]/40" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 pr-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(stationInfo.id);
                    }}
                    className={`w-10 h-10 flex items-center justify-center transition-colors ${favorites.includes(stationInfo.id) ? 'text-[var(--accent-color)]' : 'text-[var(--text-color)]/50 hover:text-[var(--text-color)]'}`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(stationInfo.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="w-10 h-10 bg-[var(--card-bg)]/10 rounded-full flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--card-bg)]/20 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-1 fill-current" />}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      closePlayer();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-[var(--text-color)]/50 hover:text-[var(--text-color)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
