import React, { useState, useEffect } from 'react';
import { Loader2, Server } from 'lucide-react';

export const ServerStatusBanner: React.FC = () => {
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    const handleWakingUp = (e: any) => {
      if (e.detail?.connected) {
        setIsWakingUp(false);
      } else {
        setIsWakingUp(true);
      }
    };

    window.addEventListener('server-waking-up', handleWakingUp);
    return () => window.removeEventListener('server-waking-up', handleWakingUp);
  }, []);

  if (!isWakingUp) return null;

  return (
    <div id="server-status-banner" className="bg-amber-500 text-white px-4 py-2 text-xs font-medium flex items-center justify-center space-x-2 shadow-md transition-all duration-300 z-50">
      <Loader2 className="w-4 h-4 animate-spin" />
      <Server className="w-4 h-4" />
      <span>Waking up server from cold start. Please wait a moment...</span>
    </div>
  );
};
