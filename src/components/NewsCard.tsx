import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { NewsItem } from '../services/newsService';
import { useTranslation } from 'react-i18next';

interface NewsCardProps {
  item: NewsItem;
  activeLang: 'fr' | 'ar';
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, activeLang }) => {
  const { t } = useTranslation();
  const isArabic = activeLang === 'ar';

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 1) return t('Just now');
      if (hours < 24) return `${hours}h ${t('ago')}`;
      return date.toLocaleDateString(isArabic ? 'ar-TN-u-nu-latn' : 'fr-TN', {
        day: 'numeric',
        month: 'short'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <a 
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-sm border overflow-hidden transition-all group active:scale-[0.99] hover:bg-[var(--hover-bg)]"
      style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}
    >
      <div className={`flex p-4 gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
        <div className="w-24 h-24 rounded-sm overflow-hidden flex-shrink-0 relative border" style={{ background: 'var(--trending-bg)', borderColor: 'var(--border-color)' }}>
          <img loading="lazy" 
            src={item.imageUrl || item.thumbnail || `https://images.weserv.nl/?url=https://picsum.photos/seed/${encodeURIComponent(item.guid)}/400/250`} 
            alt="" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://images.weserv.nl/?url=https://picsum.photos/seed/${encodeURIComponent(item.guid)}/400/250`;
            }}
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className={`flex items-center gap-2 mb-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
              {item.isPremium && (
                <span className="text-[9px] font-black uppercase tracking-widest px-1 py-0.5 rounded bg-[var(--accent-color)]/20 text-[var(--accent-color)]">
                  {t('Exclusive')}
                </span>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]" style={{ color: 'var(--accent-color)' }}>
                {item.source}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-color)', opacity: 0.3 }}>•</span>
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${isArabic ? 'flex-row-reverse' : ''}`} style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                <Clock className="w-2.5 h-2.5" />
                {formatDate(item.pubDate)}
              </div>
            </div>
            <h3 className={`text-sm font-bold leading-snug line-clamp-2 transition-colors ${
              isArabic ? 'text-right' : ''
            }`} style={{ color: 'var(--text-color)' }}>
              <span className="group-hover:text-[var(--accent-color)] transition-colors">
                {item.title}
              </span>
            </h3>
          </div>
          
          <div className={`flex items-center justify-end mt-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <ExternalLink className="w-3.5 h-3.5 transition-colors group-hover:text-[var(--accent-color)]" style={{ color: 'var(--text-color)', opacity: 0.4 }} />
          </div>
        </div>
      </div>
    </a>
  );
};
