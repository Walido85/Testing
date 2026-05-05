import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface ExchangeRate {
  currency: string;
  value: string;
  change?: string;
}

export interface StockQuote {
  name: string;
  value: string;
  change: string;
  category?: string;
  acronym?: string;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: string;
}

const CACHE_KEY = 'tuniwave_finance_v1';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  } catch (e) {}
  return null;
}

function saveToCache(data: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
}

export function useMarketData() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [tunisiaStocks, setTunisiaStocks] = useState<StockQuote[]>([]);
  const [globalIndices, setGlobalIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = useCallback(async (forceRefresh = false) => {
    // Check localStorage cache first
    if (!forceRefresh) {
      const cached = getFromCache();
      if (cached) {
        setExchangeRates(cached.exchangeRates || []);
        setTunisiaStocks(cached.tunisiaStocks || []);
        setGlobalIndices(cached.globalIndices || []);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      // 3 reads total — only when cache is stale (once per hour)
      const [ratesSnap, stocksSnap, indicesSnap] = await Promise.all([
        getDoc(doc(db, "finance", "exchange_rates")),
        getDoc(doc(db, "finance", "tunisia_stocks")),
        getDoc(doc(db, "finance", "international_indices"))
      ]);

      let newRates: ExchangeRate[] = [];
      let newStocks: StockQuote[] = [];
      let newIndices: MarketIndex[] = [];

      if (ratesSnap.exists()) {
        const data = ratesSnap.data();
        if (data.tnd_rates) {
          newRates = data.tnd_rates.map((r: any) => ({
            currency: r.currency || 'N/A',
            value: r.value || '0.00',
            change: '0.00'
          }));
        }
      }

      if (stocksSnap.exists()) {
        const data = stocksSnap.data();
        if (data.stocks) {
          newStocks = data.stocks.map((s: any) => ({
            name: s.name || s.last,
            value: s.date || '0.00',
            change: '0.00',
            acronym: s.last || '',
            category: s.change_pct || 'EQUITY'
          }));
        }
      }

      if (indicesSnap.exists()) {
        const data = indicesSnap.data();
        if (data.indices) {
          newIndices = data.indices.map((i: any) => {
            let value = "0.00";
            let change = "0.00";
            const match = String(i.chg_pct).match(/^([\d,.]+).*?\(([-+.\d]+)%\)$/);
            if (match) {
              value = match[1];
              change = match[2];
            } else {
              value = String(i.chg_pct).split(/[+-]/)[0] || "0.00";
            }
            return { name: i.last || i.name, value, change };
          });
        }
      }

      setExchangeRates(newRates);
      setTunisiaStocks(newStocks);
      setGlobalIndices(newIndices);

      // Save to localStorage cache
      saveToCache({ exchangeRates: newRates, tunisiaStocks: newStocks, globalIndices: newIndices });

    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
    // Refresh every hour (matches cache TTL)
    const interval = setInterval(() => fetchFinanceData(true), CACHE_TTL);
    return () => clearInterval(interval);
  }, [fetchFinanceData]);

  return { exchangeRates, tunisiaStocks, globalIndices, loading };
}
