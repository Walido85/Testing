import { useState, useEffect } from 'react';
import { islamicCache } from '../../utils/islamicCache';

const BASE = 'https://api.aladhan.com/v1';

export interface CalendarDay {
  hijri: {
    date: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    holidays: string[];
  };
  gregorian: {
    date: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
  };
}

export function useIslamicCalendar(month: number, year: number) {
  const [data, setData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `calendar_${month}_${year}`;
    const cached = islamicCache.get<CalendarDay[]>(key);

    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${BASE}/gToHCalendar/${month}/${year}`)
      .then(r => r.json())
      .then(json => {
        if (json.code !== 200) throw new Error(json.data || 'AlAdhan API error');
        islamicCache.set(key, json.data);
        setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [month, year]);

  return { data, loading, error };
}
