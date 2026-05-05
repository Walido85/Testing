
import { Link } from '../utils/navigation';
import { Home, Newspaper, Trophy, Tv, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../context/LanguageContext';

export default function BottomNav({ location: propLocation }: { location?: { pathname: string, search?: string } }) {
  const location = propLocation || { pathname: typeof window !== 'undefined' ? window.location.pathname : '' };
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const navItems = [
    { path: `/${lang}/`, icon: Home, label: t('Home') },
    { path: `/${lang}/news`, icon: Newspaper, label: t('News') },
    { path: `/${lang}/tv`, icon: Tv, label: t('TV') },
    { path: `/${lang}/radio`, icon: Radio, label: t('Radio') },
    { path: `/${lang}/sports`, icon: Trophy, label: t('Sports') },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[70] flex items-center justify-around border-t pb-[env(safe-area-inset-bottom)]"
      style={{ 
        background: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        height: 'calc(60px + env(safe-area-inset-bottom))'
      }}
    >
      {navItems.map((item) => {
        const isHomePath = item.path === `/${lang}` || item.path === `/${lang}/`;
        const isActive = location.pathname === item.path || 
          location.pathname === item.path + '/' ||
          (!isHomePath && location.pathname.startsWith(item.path));

        
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center h-[60px] flex-1 gap-1"
          >
            <item.icon 
              className="w-6 h-6" 
              style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-color)' }}
            />
            <span 
              className="text-[10px] font-bold uppercase"
              style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-color)' }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
