import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/firebase';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { league, type } = req.query as { league: string; type: string };
  if (!league || !type) return res.status(400).json({ error: 'Missing league or type' });

  const key = `${league}_${type}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  const snap = await getDoc(doc(db, 'football', key));
  const data = snap.exists() ? snap.data() : { matches: [], table: [] };

  cache.set(key, { data, timestamp: Date.now() });
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(data);
}
