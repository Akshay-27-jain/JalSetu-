import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export const PwaOfflineBadge: React.FC = () => {
  const { isOnline } = usePwaInstall();
  const [showReconnected, setShowReconnected] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setShowReconnected(false);
    } else if (hasBeenOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setHasBeenOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-bounce">
        <div className="flex items-center gap-2 rounded-full bg-rose-600/90 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 border border-rose-400/30">
          <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          <span>Offline Mode — Serving cached data</span>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
        <div className="flex items-center gap-2 rounded-full bg-emerald-600/90 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Back Online — Data synced</span>
        </div>
      </div>
    );
  }

  return null;
};
