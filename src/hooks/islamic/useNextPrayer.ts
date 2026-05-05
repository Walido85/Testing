import { useState, useEffect } from 'react';
import { PrayerTimings } from './usePrayerTimes';

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function parseTime(str: string) {
  const [h, m] = str.replace(/\s*\(.*\)/, '').split(':').map(Number);
  return h * 60 + m;
}

export interface NextPrayer {
  name: string;
  time: string;
  isNextDay: boolean;
}

export function useNextPrayer(timings: PrayerTimings | null): NextPrayer | null {
  const [next, setNext] = useState<NextPrayer | null>(null);

  useEffect(() => {
    if (!timings) return;

    function compute() {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      if (!timings) return;
      const found = PRAYER_ORDER.find(p => {
        const timeStr = timings[p as keyof PrayerTimings];
        return timeStr && parseTime(timeStr) > nowMins;
      });
      
      setNext({
        name: found || 'Fajr',
        time: timings[(found as keyof PrayerTimings) || 'Fajr'],
        isNextDay: !found,
      });
    }

    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [timings]);

  return next;
}
