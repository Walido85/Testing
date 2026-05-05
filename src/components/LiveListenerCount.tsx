import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

interface LiveListenerCountProps {
  stationId: string;
  baseCount: number;
  className?: string;
}

export const LiveListenerCount = ({ stationId, baseCount, className = "" }: LiveListenerCountProps) => {
  const [count, setCount] = useState(baseCount);

  useEffect(() => {
    const updateCount = () => {
      // Use a 3-second window for synchronization across all components
      const timeBucket = Math.floor(Date.now() / 3000);
      const seed = stationId + timeBucket;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      // Fluctuation between -5 and +5
      const fluctuation = (Math.abs(hash) % 11) - 5;
      setCount(Math.max(100, baseCount + fluctuation));
    };

    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, [stationId, baseCount]);

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${className}`} style={{ background: className.includes('!bg-transparent') ? 'transparent' : 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
      <div className="relative flex items-center justify-center">
        <Activity className="w-3 h-3 text-[var(--accent-color)]" />
        <motion.div 
          className="absolute inset-0 bg-[var(--accent-color)] rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <span className="text-[9px] font-black tabular-nums" style={{ color: 'var(--text-color)' }}>
        {count.toLocaleString('en-US')}
      </span>
    </div>
  );
};
