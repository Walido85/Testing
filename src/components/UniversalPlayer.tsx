import React, { lazy, Suspense } from 'react';
import { AlertTriangle } from 'lucide-react';

const ReactPlayer = lazy(() => import('react-player'));

interface UniversalPlayerProps {
  url: string;
}

const Player = ReactPlayer as any;

export default function UniversalPlayer({ url }: UniversalPlayerProps) {
  if (!url) return null;

  // Handle Mixed Content: If HTTP, use a CORS proxy
  const isHttp = url.toLowerCase().startsWith('http://');
  const safeUrl = isHttp ? `https://corsproxy.io/?url=${encodeURIComponent(url)}` : url;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] p-4 border-t border-[var(--border-color)] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {isHttp && (
          <div className="text-[var(--accent-color)] flex items-center gap-2 text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Insecure Stream</span>
          </div>
        )}
        <div className="flex-1">
          <Suspense fallback={null}>
            <Player
              url={safeUrl}
              playing={true}
              controls={true}
              width="100%"
              height="50px"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
