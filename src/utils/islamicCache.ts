const PREFIX = 'tw_islamic_';
const DAY_MS = 86_400_000;

export const islamicCache = {
  set(key: string, data: any): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* ignore */ }
  },
  
  get<T = any>(key: string, ttlMs: number = DAY_MS): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (ttlMs !== -1 && Date.now() - ts > ttlMs) {
        localStorage.removeItem(PREFIX + key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },
  
  clear(key: string): void {
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  },
};
