import { useState, useEffect } from 'react';
import { islamicCache } from '../../utils/islamicCache';

const BASE = 'https://api.aladhan.com/v1';

function todayDDMMYYYY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function round2(v: number) { return Math.round(v * 100) / 100; }

export interface PrayerTimings {
  Fajr: string; Sunrise: string; Dhuhr: string; Asr: string;
  Maghrib: string; Isha: string; Imsak: string; Midnight: string;
  Firstthird: string; Lastthird: string;
}

export interface HijriDate {
  date: string; day: string;
  month: { number: number; en: string; ar: string; };
  year: string;
  weekday: { en: string; ar: string; };
  holidays: string[];
}

export interface GregorianDate {
  date: string; day: string;
  month: { number: number; en: string; };
  year: string;
  weekday: { en: string; };
}

export interface PrayerMeta {
  latitude: number; longitude: number; timezone: string;
  method: { id: number; name: string; };
}

export interface PrayerState {
  timings: PrayerTimings | null;
  hijri: HijriDate | null;
  gregorian: GregorianDate | null;
  meta: PrayerMeta | null;
  loading: boolean;
  error: string | null;
}

export function usePrayerTimes(lat: number | null, lng: number | null, method = 3): PrayerState {
  const [state, setState] = useState<PrayerState>({
    timings: null, hijri: null, gregorian: null, meta: null,
    loading: true, error: null,
  });

  useEffect(() => {
    if (lat == null || lng == null) return;

    const today = todayDDMMYYYY();
    const key = `prayer_${today}_${round2(lat)}_${round2(lng)}_${method}`;
    const cached = islamicCache.get<any>(key);

    if (cached) {
      setState({ ...cached, loading: false, error: null });
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));

    fetch(`${BASE}/timings/${today}?latitude=${lat}&longitude=${lng}&method=${method}`)
      .then(r => r.json())
      .then(json => {
        if (json.code !== 200) throw new Error(json.data || 'AlAdhan API error');
        const { timings, date, meta } = json.data;
        const parsed = { timings, hijri: date.hijri, gregorian: date.gregorian, meta };
        islamicCache.set(key, parsed);
        setState({ ...parsed, loading: false, error: null });
      })
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })));
  }, [lat, lng, method]);

  return state;
}
