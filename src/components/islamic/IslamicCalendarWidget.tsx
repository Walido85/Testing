import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, X } from 'lucide-react';
import { useIslamicCalendar, CalendarDay } from '../../hooks/islamic';

export function IslamicCalendarWidget() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  const { data, loading, error } = useIslamicCalendar(month, year);
  
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const startDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const renderCalendar = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (error) {
       return <div className="p-4 text-[var(--accent-color)] text-center text-sm">{t('Error loading calendar')}</div>;
    }
    if (!data) return null;
    
    // Aladhan API sometimes returns a few days of the previous month if not careful? No, gToHCalendar for month/year gives exactly that Gregorian month.
    
    const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => (
      <div key={`blank-${i}`} className="p-1 md:p-2 border border-transparent bg-transparent"></div>
    ));
    
    const todayStr = new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '-');

    const days = data.map((dayData, idx) => {
      const isToday = dayData.gregorian.date === todayStr;
      const hasHoliday = dayData.hijri.holidays.length > 0;
      
      return (
        <button 
           key={idx} 
           onClick={() => setSelectedDay(dayData)}
           className={`relative p-1 md:p-2 min-h-[50px] md:min-h-[80px] border border-black/5 rounded-xl flex flex-col items-center md:items-stretch md:gap-1 transition-colors hover:bg-[var(--accent-color)]/5 ${isToday ? 'bg-[var(--success-color)]/5 border-[var(--success-color)]/20 shadow-sm' : 'bg-[var(--card-bg)]'}`}
        >
          <div className="flex flex-col md:flex-row md:justify-between items-center w-full gap-0.5 md:gap-0">
            <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-[var(--success-color)]' : 'text-[var(--text-color)]'}`}>
               {dayData.gregorian.day}
            </span>
            <span className={`text-[9px] md:text-[10px] px-1 md:px-1.5 py-0 md:py-0.5 rounded text-[var(--accent-color)] font-semibold bg-[var(--accent-color)]/10 ${isArabic ? 'font-arabic' : ''}`} dir="auto">
               {dayData.hijri.day}
            </span>
          </div>
          <div className="mt-auto hidden md:block text-left w-full">
             <span className={`text-[10px] capitalize block truncate ${isToday ? 'text-[var(--success-color)]/70 font-semibold' : 'text-[var(--news-text-secondary)]'}`}>
               {isArabic ? dayData.hijri.month.ar : dayData.hijri.month.en}
             </span>
             {hasHoliday && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {dayData.hijri.holidays.map(h => (
                    <span key={h} className="text-[9px] bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-1 py-0.5 rounded block truncate w-full" title={h}>
                      {h}
                    </span>
                  ))}
                </div>
             )}
          </div>
          
          {hasHoliday && (
            <div className="md:hidden mt-auto flex justify-center w-full pb-1">
               <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full"></div>
            </div>
          )}
          
          {isToday && (
            <div className="absolute top-0 -mr-1 -mt-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-[var(--success-color)] rounded-full border border-white" style={{ [isArabic ? 'left' : 'right']: 0 }} />
          )}
        </button>
      );
    });

    return (
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weekDays.map(d => (
          <div key={d} className={`text-center text-[10px] md:text-[11px] font-bold py-1 md:py-2 uppercase tracking-wider ${d === 'Fri' ? 'text-[var(--success-color)]' : 'text-[var(--news-text-secondary)]'}`}>
            {t(d)}
          </div>
        ))}
        {blanks.concat(days)}
      </div>
    );
  };
  
  return (
    <div className="bg-[var(--card-bg)] rounded-3xl p-4 md:p-6 shadow-xl border border-black/5 flex flex-col relative overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 md:mb-6 gap-3 relative z-10">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-[var(--success-color)]/10 flex items-center justify-center shrink-0">
             <CalendarIcon className="w-5 h-5 text-[var(--success-color)]" />
           </div>
           <div>
             <h2 className={`text-lg md:text-xl font-bold text-[var(--success-color)] leading-tight ${isArabic ? 'font-arabic' : 'font-serif'}`}>
               {t('Islamic Calendar')}
             </h2>
             <p className="text-sm text-[var(--news-text-secondary)] capitalize">
               {currentDate.toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'long', year: 'numeric' })}
             </p>
           </div>
         </div>
         
         <div className="flex border border-black/10 rounded-lg overflow-hidden bg-[var(--card-bg)] text-[var(--news-text-secondary)] self-start sm:self-auto">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-[var(--hover-bg)] transition-colors focus:ring-2 inset-ring-[var(--accent-color)]">
              {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <div className="w-[1px] bg-[var(--hover-bg)]" />
            <button onClick={handleNextMonth} className="p-2 hover:bg-[var(--hover-bg)] transition-colors focus:ring-2 inset-ring-[var(--accent-color)]">
              {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
         </div>
      </div>
      
      <div className="relative z-10 flex-1">
        {renderCalendar()}
      </div>
      
      {/* Events section */}
      {!loading && !error && data && (
          <div className="mt-6 pt-5 border-t border-black/5 relative z-10 bg-[var(--card-bg)]/50 hidden md:block">
           <h3 className={`text-xs font-bold text-[var(--news-text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2 ${isArabic ? 'font-arabic' : ''}`}>
             <Info className="w-3.5 h-3.5 text-[var(--accent-color)]" />
             {t('Events This Month')}
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.filter(d => d.hijri.holidays.length > 0).map(d => (
                 <div key={d.gregorian.date} className="flex items-center gap-4 bg-[var(--card-bg)] p-3 rounded-xl border border-black/5 hover:border-[var(--accent-color)]/30 transition-colors">
                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg text-[var(--accent-color)] shrink-0">
                       <span className="text-sm font-black leading-none">{d.gregorian.day}</span>
                       <span className="text-[9px] uppercase font-bold mt-0.5">{d.gregorian.month.en.slice(0,3)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold text-[var(--success-color)] truncate ${isArabic ? 'font-arabic' : ''}`}>
                         {d.hijri.holidays.join(', ')}
                      </p>
                      <p className="text-[10px] text-[var(--news-text-secondary)] mt-0.5 truncate uppercase tracking-wide">
                         {t('Hijri')}: {d.hijri.day} {isArabic ? d.hijri.month.ar : d.hijri.month.en} {d.hijri.year}
                      </p>
                    </div>
                 </div>
              ))}
              {data.filter(d => d.hijri.holidays.length > 0).length === 0 && (
                <p className="text-xs text-[var(--news-text-secondary)] py-3">{t('No major events this month.')}</p>
              )}
           </div>
         </div>
      )}

      {/* Modal for Mobile Details */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--hover-bg)]0 p-4 md:hidden">
          <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-[var(--success-color)]/5 flex justify-between items-start border-b border-black/5">
              <div>
                <h3 className="font-bold text-[var(--success-color)] text-lg">
                  {selectedDay.gregorian.day} {selectedDay.gregorian.month.en} {selectedDay.gregorian.year}
                </h3>
                <p className="text-sm text-[var(--accent-color)] font-semibold mt-1" dir="auto">
                  {selectedDay.hijri.day} {isArabic ? selectedDay.hijri.month.ar : selectedDay.hijri.month.en} {selectedDay.hijri.year}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-1 text-[var(--news-text-secondary)] hover:text-[var(--text-color)] bg-[var(--card-bg)] rounded-full shadow-sm">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-4">
              {selectedDay.hijri.holidays.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold text-[var(--news-text-secondary)] uppercase tracking-wider mb-2">{t('Events')}</h4>
                  <div className="flex flex-col gap-2">
                    {selectedDay.hijri.holidays.map(h => (
                      <div key={h} className="bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-3 py-2 rounded-lg text-sm font-medium border border-[var(--accent-color)]/20 text-center" dir="auto">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                 <p className="text-[var(--news-text-secondary)] text-center text-sm py-4">{t('No events on this day.')}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[var(--success-color)]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
