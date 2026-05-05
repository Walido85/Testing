import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAstroNavigate } from '../utils/navigation';
import { 
  User as UserIcon, 
  Globe, 
  Moon, 
  Sun,
  Bell, 
  Trophy, 
  FileText, 
  Trash2,
  Info,
  LogOut,
  MapPin,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import i18nInstance from '../i18n';

type SettingsView = 'main' | 'language';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useAstroNavigate();
  const { user, loginWithGoogle, loginWithFacebook, loginWithApple, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { location, detectLocation, updateLocation, loading: loadingLocation } = useLocation();
  const [view, setView] = useState<SettingsView>('main');

  // State for toggles
  const [alertInfo, setAlertInfo] = useState(true);
  const [sportsNotify, setSportsNotify] = useState(true);
  const [prayerNotify, setPrayerNotify] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const languages = [
    { code: 'fr', name: t('French'), flag: '🇫🇷' },
    { code: 'ar', name: t('Arabic'), flag: '🇹🇳' },
    { code: 'en', name: t('English'), flag: '🇬🇧' },
  ];

  const Toggle = ({ enabled, setEnabled }: { enabled: boolean, setEnabled: (v: boolean) => void }) => (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${enabled ? 'bg-[var(--accent-color)]' : 'bg-[var(--hover-bg)]'}`}
    >
      <div className={`bg-[var(--card-bg)] w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  const renderMain = () => {
    return (
    <div className="h-full pb-4" style={{ background: 'var(--bg-color)' }}>
      {/* Header */}
      <div className="px-4 py-6 flex justify-between items-center border-b sticky top-0 z-10" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Settings')}</h1>
        <button 
          onClick={() => navigate(-1)}
          className="font-bold text-lg hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent-color)' }}
        >
          {t('Close')}
        </button>
      </div>

      <div className="w-full p-4 space-y-8">
        {/* COMPTE */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-3 ml-4" style={{ color: 'var(--text-color)', opacity: 0.5 }}>{t('ACCOUNT')}</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
            {user ? (
              <div className="p-4 flex items-center gap-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--border-color)' }}>
                  <img loading="lazy" 
                    src={user.photoURL || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black" style={{ color: 'var(--text-color)' }}>{user.displayName || 'Utilisateur'}</h3>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-color)', opacity: 0.6 }}>{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>{t('Connected')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-2 text-[var(--news-text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                  title={t('Logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="p-6 text-center border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-lg font-black mb-4" style={{ color: 'var(--text-color)' }}>{t('Log in')}</h3>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => loginWithGoogle()}
                    className="w-12 h-12 bg-[var(--card-bg)] rounded-full border flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-sm"
                    style={{ borderColor: 'var(--border-color)' }}
                    title="Google"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </button>
                  <button 
                    onClick={() => loginWithFacebook()}
                    className="w-12 h-12 bg-[var(--accent-color)] rounded-full border flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-sm"
                    style={{ borderColor: 'var(--border-color)' }}
                    title="Facebook"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </button>
                  <button 
                    onClick={() => loginWithApple()}
                    className="w-12 h-12 bg-black rounded-full border flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-sm"
                    style={{ borderColor: 'var(--border-color)' }}
                    title="Apple"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M17.05 20.28c-.96.95-2.04 1.72-3.24 1.72-1.16 0-1.54-.71-2.89-.71-1.36 0-1.78.7-2.89.7-1.16 0-2.32-.82-3.32-1.82-2.04-2.04-3.13-5.73-3.13-8.86 0-3.13 1.63-5.3 4.08-5.3 1.16 0 2.04.41 2.72.41.68 0 1.7-.41 3.03-.41 1.16 0 2.21.31 3.03 1.05-2.62 1.43-2.21 5.3.41 6.53-.78 1.87-1.77 3.61-2.69 4.69zM12.03 5.07c-.03-2.69 2.21-4.93 4.86-5.07.24 2.76-2.14 5.17-4.86 5.07z"/></svg>
                  </button>
                </div>
              </div>
            )}
            <button 
              onClick={() => alert(t('Manage account') + '...')}
              className="w-full p-4 flex items-center gap-4 hover:bg-[var(--card-bg)] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-[var(--card-bg)] transition-colors" style={{ background: 'var(--trending-bg)' }}>
                <UserIcon className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Manage account')}</span>
            </button>
          </div>
        </section>

        {/* GÉNÉRAL */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-3 ml-4" style={{ color: 'var(--text-color)', opacity: 0.5 }}>{t('General')}</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm divide-y" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--hover-bg)] transition-colors"
              onClick={() => setView('language')}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                  <Globe className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                </div>
                <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Language')}</span>
              </div>
              <div className="flex items-center gap-2">
                {languages.map(l => (
                  <span key={l.code} className={`text-xl ${i18n.language === l.code ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>{l.flag}</span>
                ))}
              </div>
            </button>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                  {isDarkMode ? <Moon className="w-5 h-5" style={{ color: 'var(--accent-color)' }} /> : <Sun className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />}
                </div>
                <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Dark Mode')}</span>
              </div>
              <Toggle enabled={isDarkMode} setEnabled={toggleDarkMode} />
            </div>
          </div>
        </section>

        {/* REGION & LOCATION */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-3 ml-4" style={{ color: 'var(--text-color)', opacity: 0.5 }}>{t('REGION & LOCATION')}</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm divide-y" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                  <MapPin className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Current Location')}</span>
                  <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest" style={{ color: 'var(--text-color)' }}>
                    {location.city}, {location.country}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => updateLocation({ 
                    city: 'Tunis', 
                    country: 'Tunisia', 
                    latitude: 36.8065, 
                    longitude: 10.1815, 
                    timezone: 'Africa/Tunis' 
                  })}
                  className="px-3 py-1.5 flex-1 text-center rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-[var(--accent-color)] text-[var(--accent-color)] border border-[var(--accent-color)]"
                >
                  {t('Reset to Tunisia')}
                </button>
                <button 
                  onClick={() => detectLocation()}
                  disabled={loadingLocation}
                  className="flex flex-1 justify-center items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-[var(--trending-bg)] hover:bg-[var(--hover-bg)]"
                  style={{ color: 'var(--accent-color)' }}
                >
                  <RefreshCw className={`w-3 h-3 ${loadingLocation ? 'animate-spin' : ''}`} />
                  {loadingLocation ? t('Detecting...') : t('Detect')}
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                    <Edit3 className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Manual Override')}</span>
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest" style={{ color: 'var(--text-color)' }}>
                      {t('Set your location manually')}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const city = prompt(t('Enter your city name') + '...', location.city);
                    if (city) updateLocation({ city, manual: true });
                  }}
                  className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-[var(--trending-bg)] hover:bg-[var(--hover-bg)]"
                  style={{ color: 'var(--accent-color)' }}
                >
                  {t('Change')}
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                  <Globe className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Timezone')}</span>
                  <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest" style={{ color: 'var(--text-color)' }}>
                    {location.timezone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-3 ml-4" style={{ color: 'var(--text-color)', opacity: 0.5 }}>{t('NOTIFICATIONS')}</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm divide-y" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                  <Bell className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                </div>
                <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Breaking News')}</span>
              </div>
              <Toggle enabled={alertInfo} setEnabled={setAlertInfo} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                  <Trophy className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                </div>
                <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Sports')}</span>
              </div>
              <Toggle enabled={sportsNotify} setEnabled={setSportsNotify} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                  <Info className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                </div>
                <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Prayer Times')}</span>
              </div>
              <Toggle enabled={prayerNotify} setEnabled={setPrayerNotify} />
            </div>
            <button 
              onClick={() => alert(t('Manage notifications') + '...')}
              className="w-full p-4 flex items-center gap-4 hover:bg-[var(--hover-bg)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                <Bell className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Manage notifications')}</span>
            </button>
          </div>
        </section>

        {/* CONFIDENTIALITÉ */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-3 ml-4" style={{ color: 'var(--text-color)', opacity: 0.5 }}>{t('Privacy')}</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm divide-y" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
            <button 
              onClick={() => navigate('/about')}
              className="w-full p-4 flex items-center gap-4 hover:bg-[var(--card-bg)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                <UserIcon className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Personal data')}</span>
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="w-full p-4 flex items-center gap-4 hover:bg-[var(--card-bg)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Terms of use')}</span>
            </button>
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-[var(--card-bg)] transition-colors"
             >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--trending-bg)' }}>
                <Trash2 className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Clear cache')}</span>
            </button>
          </div>
        </section>

        {/* Custom Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6" style={{ background: 'var(--header-bg)', border: '1px solid var(--border-color)' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-[var(--accent-color)]/10">
                  <Trash2 className="w-8 h-8 text-[var(--accent-color)]" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{t('Clear cache')}</h3>
                <p className="text-sm font-medium opacity-70" style={{ color: 'var(--text-color)' }}>
                  {t('Are you sure you want to clear the cache? The app will reload.')}
                </p>
                <div className="flex flex-col w-full gap-3 mt-4">
                  <button 
                    onClick={async () => {
                      localStorage.clear();
                      sessionStorage.clear();
                      if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(cacheNames.map(name => caches.delete(name)));
                      }
                      if ('serviceWorker' in navigator) {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                          await registration.unregister();
                        }
                      }
                      window.location.reload();
                    }}
                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)] transition-colors"
                  >
                    {t('Confirm')}
                  </button>
                  <button 
                    onClick={() => setShowClearConfirm(false)}
                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest bg-[var(--hover-bg)] transition-colors"
                    style={{ color: 'var(--text-color)' }}
                  >
                    {t('Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-color)', opacity: 0.5 }}>
            {t('App version')}: 3.0.0 (Cache Fixed)
          </p>
        </div>
      </div>
    </div>
  );
};

  const renderLanguage = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--hover-bg)]0 backdrop-blur-sm" onClick={() => setView('main')}>
      <div className="w-full max-w-sm border rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ background: 'var(--trending-bg)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-color)' }}>{t('Language')}</h2>
          <button onClick={() => setView('main')} className="text-[10px] font-black uppercase tracking-widest hover:underline" style={{ color: 'var(--accent-color)' }}>{t('Close')}</button>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {languages.map((lang) => (
            <button 
              key={lang.code}
              className={`w-full flex items-center justify-between p-6 hover:bg-[var(--card-bg)] transition-colors`}
              style={{ background: i18n.language === lang.code ? 'var(--trending-bg)' : 'transparent' }}
              onClick={() => {
                i18nInstance.changeLanguage(lang.code);
                setView('main');
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-color)' }}>{lang.name}</span>
              </div>
              {i18n.language === lang.code && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-color)' }}></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full">
      {renderMain()}
      {view === 'language' && renderLanguage()}
    </div>
  );
}
