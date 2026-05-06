import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const teamLogoCache = new Map<string, string>();
const clientCache = new Map<string, { data: any; timestamp: number }>();
const CLIENT_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const parseSportsDate = (raw: any): Date | null => {
    if (!raw) return null;
    let d: Date;
    try {
        if (typeof raw.toDate === 'function') {
            const rawDate = raw.toDate();
            d = new Date(rawDate.getTime() - 60 * 60 * 1000);
        } else if (typeof raw === 'string') {
            let utcStr = raw.replace(' ', 'T');
            if (utcStr.endsWith('Z')) {
                utcStr = utcStr.slice(0, -1) + '+01:00';
            } else if (!utcStr.includes('Z') && !utcStr.match(/[+-]\d{2}:?\d{2}$/)) {
                utcStr = utcStr + '+01:00';
            }
            d = new Date(utcStr);
        } else {
            d = new Date(raw);
        }
        if (!isNaN(d.getTime())) return d;
    } catch(e) {}
    return null;
};

function getClientCache(key: string) {
    const cached = clientCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CLIENT_CACHE_TTL) { clientCache.delete(key); return null; }
    return cached.data;
}

function setClientCache(key: string, data: any) {
    clientCache.set(key, { data, timestamp: Date.now() });
}

function cacheTeamLogos(data: any) {
    data?.matches?.forEach((m: any) => {
        if (m.home && m.home_logo) teamLogoCache.set(m.home, m.home_logo);
        if (m.away && m.away_logo) teamLogoCache.set(m.away, m.away_logo);
    });
    data?.table?.forEach((t: any) => {
        if (t.team && t.team_logo) teamLogoCache.set(t.team, t.team_logo);
    });
}

async function apiFetch(url: string, cacheKey: string) {
    const cached = getClientCache(cacheKey);
    if (cached) return cached;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    setClientCache(cacheKey, data);
    return data;
}

export const sportsService = {
  getTeamLogo(teamName: string) {
    return teamLogoCache.get(teamName);
  },

  getLeagues: async () => {
    const data = await apiFetch('/api/sports/leagues', 'leagues_list');
    return data;
  },

  getMatches: async (league: string, type: 'fixtures' | 'results' | 'standings') => {
    const key = `${league}_${type}`;
    const data = await apiFetch(
      `/api/sports/matches?league=${encodeURIComponent(league)}&type=${type}`,
      key
    );
    cacheTeamLogos(data);
    return data;
  },

  getLiveMatches: async () => {
    const data = await apiFetch('/api/sports/live', 'live');
    cacheTeamLogos(data);
    return data;
  },

  getHistory: async (category: string, date: string) => {
    const cacheKey = `${category}_history_${date}`;
    const cached = getClientCache(cacheKey);
    if (cached) return cached;

    // History is less frequent — keep direct Firestore read
    const snap = await getDoc(doc(db, 'football', `${category}_results_history`));
    if (!snap.exists()) return { matches: [] };

    const data = snap.data();
    cacheTeamLogos(data);

    const allMatches: any[] = [];
    if (data.matches && Array.isArray(data.matches)) allMatches.push(...data.matches);
    if (data.history && Array.isArray(data.history)) {
        data.history.forEach((entry: any) => {
            if (entry.data && Array.isArray(entry.data.matches)) allMatches.push(...entry.data.matches);
            else if (Array.isArray(entry.data)) allMatches.push(...entry.data);
        });
    }
    Object.values(data).forEach((entry: any) => {
        if (entry && typeof entry === 'object' && !Array.isArray(entry) && entry.timestamp) {
            if (Array.isArray(entry.data)) allMatches.push(...entry.data);
            else if (entry.data?.matches && Array.isArray(entry.data.matches)) allMatches.push(...entry.data.matches);
        }
    });

    const filteredMatches = allMatches.filter((m: any) => {
        let matchDate = m.date;
        const raw = m.kickoff_utc || m.timestamp_utc;
        if (raw) {
            try {
                const d = parseSportsDate(raw);
                if (d) matchDate = d.toISOString().split('T')[0];
            } catch(e) {}
        }
        if (!matchDate) return false;
        return matchDate === date || matchDate.includes(date);
    });

    const uniqueMatches = Array.from(
        new Map(filteredMatches.map(m => [m.match_id || `${m.home}-${m.away}-${m.time}`, m])).values()
    );

    const result = { matches: uniqueMatches };
    setClientCache(cacheKey, result);
    return result;
  },
};
