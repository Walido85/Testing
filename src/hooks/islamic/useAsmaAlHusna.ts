import { useState, useEffect } from 'react';
import { islamicCache } from '../../utils/islamicCache';

const BASE = 'https://api.aladhan.com/v1';

export interface AsmaAlHusnaName {
  number: number;
  name: string;
  transliteration: string;
  en: { meaning: string };
}

export interface AsmaAlHusnaState {
  data: AsmaAlHusnaName | AsmaAlHusnaName[] | null;
  loading: boolean;
  error: string | null;
}

export function useAsmaAlHusna(number: number | null = null): AsmaAlHusnaState {
  const [state, setState] = useState<AsmaAlHusnaState>({ data: null, loading: true, error: null });

  useEffect(() => {
    const key = number != null ? `asma_${number}` : 'asma_all';
    const cached = islamicCache.get<AsmaAlHusnaName | AsmaAlHusnaName[]>(key, -1);

    if (cached !== null) {
      setState({ data: cached, loading: false, error: null });
      return;
    }

    const url = number != null
      ? `${BASE}/asmaAlHusna/${number}`
      : `${BASE}/asmaAlHusna`;

    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.code !== 200) throw new Error('Asma API error');
        const finalData = number != null && Array.isArray(json.data) ? json.data[0] : json.data;
        islamicCache.set(key, finalData);
        setState({ data: finalData as (AsmaAlHusnaName | AsmaAlHusnaName[]), loading: false, error: null });
      })
      .catch(err => setState({ data: null, loading: false, error: err.message }));
  }, [number]);

  return state;
}
