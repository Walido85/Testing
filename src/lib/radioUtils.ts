/**
 * Generates a deterministic base listener count for a station based on its ID.
 * This ensures the same station shows the same base number across different components.
 */
export const getStationListeners = (id: string) => {
  if (!id) return 0;
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Map hash to a realistic range (e.g., 800 to 9500)
  const min = 800;
  const max = 9500;
  const range = max - min;
  
  return min + (Math.abs(hash) % range);
};
