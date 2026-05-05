import { useState, useEffect } from 'react';

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    lat: null, lng: null, loading: true, error: null,
  });

  useEffect(() => {
    // Geolocation prompt removed. We can rely on default location (Tunis) or IP detection from LocationContext 
    // to avoid bothering the user.
    setState(s => ({ ...s, loading: false, error: 'Geolocation disabled to avoid prompt' }));
    return;
  }, []);

  return state;
}
