import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FOOTBALL_COLLECTION = 'football';

const teamLogoCache = new Map<string, string>();
const firestoreCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const parseSportsDate = (raw: any): Date | null => {
    if (!raw) return null;
    let d: Date;
    try {
        if (typeof raw.toDate === 'function') {
            const rawDate = raw.toDate();
            // The scraper incorrectly saves Tunis local time (UTC+1) as if it were UTC.
            // E.g. 15:30 Tunis time is saved as 15:30 UTC. We must subtract 1 hour to get true UTC (14:30 UTC).
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
        
        if (!isNaN(d.getTime())) {
            return d;
        }
    } catch(e) {}
    return null;
};

export const sportsService = {
  getCache(key: string) {
    const cached = firestoreCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      firestoreCache.delete(key);
      return null;
    }
    return cached.data;
  },

  setCache(key: string, data: any) {
    firestoreCache.set(key, { data, timestamp: Date.now() });
  },

  cacheTeamLogos(data: any) {
    if (data.matches && Array.isArray(data.matches)) {
        data.matches.forEach((m: any) => {
            if (m.home && m.home_logo) teamLogoCache.set(m.home, m.home_logo);
            else if (m.team && m.team_logo) teamLogoCache.set(m.team, m.team_logo); // Also from standings potentially in "matches" var but table below
            
            if (m.away && m.away_logo) teamLogoCache.set(m.away, m.away_logo);
        });
    }
    if (data.table && Array.isArray(data.table)) {
        data.table.forEach((t: any) => {
            if (t.team && t.team_logo) teamLogoCache.set(t.team, t.team_logo);
        });
    }
  },
  
  getTeamLogo(teamName: string) {
    return teamLogoCache.get(teamName);
  },

  getLeagues: async () => {
    const cacheKey = 'leagues_list';
    const cached = sportsService.getCache(cacheKey);
    if (cached) return cached;

    const LEAGUES = [
        'Tunisia Ligue 1',
        'Tunisia Cup',
        'Premier League',
        'Serie A',
        'Ligue 1',
        'Bundesliga',
        'UEFA Champions League',
        'CAF Champions League',
        'La Liga'
    ];
    const DOC_TYPES = ['_fixtures', '_results', '_standings'];
    const leagueMap = new Map<string, string>();
    
    // Fetch all needed documents in parallel
    const promises = [];
    for (const league of LEAGUES) {
        for (const type of DOC_TYPES) {
            const docId = `${league}${type}`;
            promises.push(getDoc(doc(db, FOOTBALL_COLLECTION, docId)));
        }
    }

    const snapshots = await Promise.all(promises);
    
    snapshots.forEach(docSnap => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const lName = docSnap.id.split('_')[0];
            const logo = data.league_logo || data.matches?.[0]?.league_logo || data.table?.[0]?.team_logo || '';
            
            if (!leagueMap.has(lName)) {
                leagueMap.set(lName, logo);
            } else if (!leagueMap.get(lName) && logo) {
                leagueMap.set(lName, logo);
            }
        }
    });

    const result = Array.from(leagueMap.entries())
        .map(([name, logo]) => ({ name, logo }))
        .sort((a,b) => a.name.localeCompare(b.name));
    
    sportsService.setCache(cacheKey, result);
    return result;
  },

  getMatches: async (league: string, type: 'fixtures' | 'results' | 'standings') => {
    const cacheKey = `${league}_${type}`;
    const cached = sportsService.getCache(cacheKey);
    if (cached) return cached;

    const docRef = doc(db, FOOTBALL_COLLECTION, cacheKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        sportsService.cacheTeamLogos(data);
        sportsService.setCache(cacheKey, data);
        return data;
    }
    return { matches: [], table: [] };
  },

  getLiveMatches: async () => {
    const cacheKey = 'live';
    const cached = sportsService.getCache(cacheKey);
    if (cached) return cached;

    const docRef = doc(db, FOOTBALL_COLLECTION, cacheKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Ensure matches exists and is an array
        if (data.matches) {
            if (typeof data.matches === 'object' && !Array.isArray(data.matches)) {
                 // Convert object {0: {}, 1: {}} to Array
                data.matches = Object.values(data.matches);
            }
        } else {
            data.matches = [];
        }

        sportsService.cacheTeamLogos(data);
        sportsService.setCache(cacheKey, { ...data, status: 'success' });
        return { ...data, status: 'success' };
    }
    return { matches: [], status: 'missing' };
  },
  
  getHistory: async (category: string, date: string) => {
    const cacheKey = `${category}_history_${date}`;
    const cached = sportsService.getCache(cacheKey);
    if (cached) return cached;

    // category could be a league name or 'live'
    const docRef = doc(db, FOOTBALL_COLLECTION, `${category}_results_history`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return { matches: [] };
    
    const data = docSnap.data();
    sportsService.cacheTeamLogos(data);
    
    const allMatches: any[] = [];
    
    // ... same logic ...
    if (data.matches && Array.isArray(data.matches)) {
        allMatches.push(...data.matches);
    }
    
    if (data.history && Array.isArray(data.history)) {
        data.history.forEach((entry: any) => {
            if (entry.data && Array.isArray(entry.data.matches)) {
                allMatches.push(...entry.data.matches);
            } else if (Array.isArray(entry.data)) {
                allMatches.push(...entry.data);
            }
        });
    }

    Object.values(data).forEach((entry: any) => {
        if (entry && typeof entry === 'object' && !Array.isArray(entry) && entry.timestamp) {
            if (Array.isArray(entry.data)) {
                allMatches.push(...entry.data);
            } else if (entry.data?.matches && Array.isArray(entry.data.matches)) {
                allMatches.push(...entry.data.matches);
            }
        }
    });

    const filteredMatches = allMatches.filter((m: any) => {
        let matchDate = m.date;
        const raw = m.kickoff_utc || m.timestamp_utc;
        if (raw) {
            try {
                const d = parseSportsDate(raw);
                if (d) {
                    matchDate = d.toISOString().split('T')[0];
                }
            } catch(e) {}
        }
        if (!matchDate) return false;
        return matchDate === date || matchDate.includes(date);
    });

    const uniqueMatches = Array.from(
        new Map(filteredMatches.map(m => [m.match_id || `${m.home}-${m.away}-${m.time}`, m])).values()
    );

    const finalResult = { matches: uniqueMatches };
    sportsService.setCache(cacheKey, finalResult);
    return finalResult;
  }
};
