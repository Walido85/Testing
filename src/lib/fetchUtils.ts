/**
 * Utility for fetching with automatic retries
 */
export const fetchWithRetry = async (url: string, retries = 2, delay = 1000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout to handle queued proxy requests

  try {
    console.log(`Fetching: ${url}`);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    // Retry on non-ok responses except 404
    if (!res.ok && retries > 0 && res.status !== 404) {
      console.warn(`Fetch failed for ${url} with status ${res.status}. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Fetch attempt error for ${url}:`, err);
    // Retry on network errors
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    throw err;
  }
};
