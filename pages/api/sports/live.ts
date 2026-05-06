import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/firebase';

// Live scores: shorter cache — 5 minutes
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return res.status(200).json(cache.data);
  }

  const snap = await getDoc(doc(db, 'football', 'live'));
  let data = snap.exists() ? snap.data() : { matches: [] };

  if (data.matches && typeof data.matches === 'object' && !Array.isArray(data.matches)) {
    data = { ...data, matches: Object.values(data.matches) };
  }
  if (!data.matches) data = { ...data, matches: [] };

  cache = { data: { ...data, status: 'success' }, timestamp: Date.now() };
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json(cache.data);
}
