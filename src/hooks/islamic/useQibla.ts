import { useState, useEffect } from 'react';
import { islamicCache } from '../../utils/islamicCache';

const BASE = 'https://api.aladhan.com/v1';

function round2(v: number) { return Math.round(v * 100) / 100; }

export interface QiblaState {
  direction: number | null;
  loading: boolean;
  error: string | null;
}

export function useQibla(lat: number | null, lng: number | null): QiblaState {
  const [state, setState] = useState<QiblaState>({ direction: null, loading: true, error: null });

  useEffect(() => {
    if (lat == null || lng == null) return;

    const key = `qibla_${round2(lat)}_${round2(lng)}`;
    const cached = islamicCache.get<number>(key, -1);

    if (cached !== null) {
      setState({ direction: cached, loading: false, error: null });
      return;
    }

    fetch(`${BASE}/qibla/${lat}/${lng}`)
      .then(r => r.json())
      .then(json => {
        if (json.code !== 200) throw new Error('Qibla API error');
        islamicCache.set(key, json.data.direction);
        setState({ direction: json.data.direction, loading: false, error: null });
      })
      .catch(err => setState({ direction: null, loading: false, error: err.message }));
  }, [lat, lng]);

  return state;
}
