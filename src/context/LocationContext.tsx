import React, { createContext, useContext, useState, useEffect } from 'react';
import tzlookup from 'tz-lookup';

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  manual: boolean;
}

interface LocationContextType {
  location: LocationData;
  updateLocation: (data: Partial<LocationData>) => void;
  searchLocationByCity: (city: string) => Promise<boolean>;
  loading: boolean;
  detectLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default to Tunis but with local timezone
const DEFAULT_LOCATION: LocationData = {
  city: 'Tunis',
  country: 'Tunisia',
  latitude: 36.8065,
  longitude: 10.1815,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Tunis',
  manual: false,
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('user_location');
      if (saved) {
        setLocation(JSON.parse(saved));
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
  }, []);

  const updateLocation = (data: Partial<LocationData>) => {
    const newLocation = { ...location, ...data, manual: true };
    setLocation(newLocation);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user_location', JSON.stringify(newLocation));
    }
  };

  const searchLocationByCity = async (cityName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          const newLocation: LocationData = {
            city: result.name,
            country: result.country || 'Unknown',
            latitude: result.latitude,
            longitude: result.longitude,
            timezone: result.timezone || tzlookup(result.latitude, result.longitude) || Intl.DateTimeFormat().resolvedOptions().timeZone,
            manual: true,
          };
          setLocation(newLocation);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user_location', JSON.stringify(newLocation));
          }
          setLoading(false);
          return true;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    return false;
  };

  const detectLocation = async () => {
    setLoading(true);
    let detected = false;

    // IP-based detection (Fallback)
    if (!detected) {
      const ipApis = [
        'https://ipwho.is/',
        'https://ipapi.co/json/',
        'https://freeipapi.com/api/json'
      ];

      for (const api of ipApis) {
        if (detected) break;
        try {
          const res = await fetch(api, { cache: 'no-store' });
          if (!res.ok) continue;
          const data = await res.json();
          
          let locationData: LocationData | null = null;
          
          if (api.includes('ipwho.is')) {
            locationData = {
              city: data.city || 'Tunis',
              country: data.country || 'Tunisia',
              latitude: data.latitude,
              longitude: data.longitude,
              timezone: data.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
              manual: false,
            };
          } else if (api.includes('ipapi.co')) {
            locationData = {
              city: data.city,
              country: data.country_name,
              latitude: data.latitude,
              longitude: data.longitude,
              timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              manual: false,
            };
          } else if (api.includes('freeipapi')) {
            locationData = {
              city: data.cityName,
              country: data.countryName,
              latitude: data.latitude,
              longitude: data.longitude,
              timezone: data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              manual: false,
            };
          }

          if (locationData && locationData.city) {
            setLocation(locationData);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('user_location', JSON.stringify(locationData));
            }
            detected = true;
          }
        } catch (err) {
          // Silent fail for background detection
        }
      }
    }

    setLoading(false);
  };

  const checkTimestamp = () => {
    if (typeof localStorage === 'undefined') return false;
    const lastCheck = localStorage.getItem('user_location_last_check');
    if (lastCheck && Date.now() - parseInt(lastCheck, 10) < 24 * 60 * 60 * 1000) {
      return true; // Already checked in the last 24 hours
    }
    return false;
  };

  useEffect(() => {
    if (!location.manual) {
      if (checkTimestamp()) {
        setLoading(false);
        return;
      }
      const timer = setTimeout(() => {
        detectLocation().then(() => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user_location_last_check', Date.now().toString());
          }
        });
      }, 2000);
      return () => clearTimeout(timer);
    } else {
        setLoading(false);
    }
  }, [location.manual]);

  return (
    <LocationContext.Provider value={{ location, updateLocation, searchLocationByCity, loading, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

const LOCATION_DEFAULTS: LocationContextType = {
  location: DEFAULT_LOCATION,
  updateLocation: () => {},
  searchLocationByCity: async () => false,
  loading: false,
  detectLocation: async () => {},
};

export const useLocation = () => useContext(LocationContext) ?? LOCATION_DEFAULTS;
