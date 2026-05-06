import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Link } from '../src/utils/navigation';

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <h1 className="text-8xl font-black text-[var(--accent-color)] mb-4">404</h1>
      <p className="text-xl font-bold mb-8 opacity-70">{t('Page Not Found')}</p>
      <Link to="/ar" className="px-8 py-3 bg-[var(--accent-color)] text-white font-bold rounded-full hover:opacity-90 transition-opacity">
        {t('Home')}
      </Link>
    </div>
  );
}
