import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/firebase';

// Server-side cache shared across all requests
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return res.status(200).json(cache.data);
  }

  const LEAGUES = [
    'Tunisia Ligue 1', 'Tunisia Cup', 'Premier League',
    'Serie A', 'Ligue 1', 'Bundesliga',
    'UEFA Champions League', 'CAF Champions League', 'La Liga',
  ];
  const DOC_TYPES = ['_fixtures', '_results', '_standings'];

  const promises = LEAGUES.flatMap(league =>
    DOC_TYPES.map(type => getDoc(doc(db, 'football', `${league}${type}`)))
  );
  const snapshots = await Promise.all(promises);

  const leagueMap = new Map<string, string>();
  snapshots.forEach(snap => {
    if (!snap.exists()) return;
    const data = snap.data();
    const name = snap.id.replace(/_(fixtures|results|standings)$/, '');
    const logo = data.league_logo || data.matches?.[0]?.league_logo || '';
    if (!leagueMap.has(name) || (!leagueMap.get(name) && logo)) {
      leagueMap.set(name, logo);
    }
  });

  const result = Array.from(leagueMap.entries())
    .map(([name, logo]) => ({ name, logo }))
    .sort((a, b) => a.name.localeCompare(b.name));

  cache = { data: result, timestamp: Date.now() };
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(result);
}
