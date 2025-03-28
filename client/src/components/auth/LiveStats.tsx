import React, { useState, useEffect, useRef } from 'react';

interface LiveStat {
  label: string;
  value: number;
  increment: number;
  suffix?: string;
  interval: number; // in milliseconds
}

const LiveStats: React.FC = () => {
  // Initial stats
  const initialStats: LiveStat[] = [
    { label: 'Users', value: 23498, increment: 1, interval: 5000 },
    { label: 'Numbers Sold', value: 9862, increment: 1, interval: 8000 },
    { label: 'Countries', value: 128, increment: 0, interval: 60000 },
    { label: 'Earnings', value: 467852, increment: 10, suffix: '₦', interval: 3000 },
  ];

  // Use refs for internal values to avoid unnecessary rerenders
  const statsRef = useRef<LiveStat[]>(initialStats);
  const [displayStats, setDisplayStats] = useState<LiveStat[]>(initialStats);
  const lastUpdateRef = useRef<number[]>(initialStats.map(() => Date.now()));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateStats = (timestamp: number) => {
      let shouldUpdate = false;
      const now = Date.now();
      
      // Check each stat to see if it's time to update
      statsRef.current.forEach((stat, index) => {
        if (now - lastUpdateRef.current[index] >= stat.interval) {
          statsRef.current[index].value += stat.increment;
          lastUpdateRef.current[index] = now;
          shouldUpdate = true;
        }
      });
      
      // Only update state if at least one stat changed
      if (shouldUpdate) {
        setDisplayStats([...statsRef.current]);
      }
      
      // Continue the animation loop
      rafRef.current = requestAnimationFrame(updateStats);
    };
    
    // Start the animation loop
    rafRef.current = requestAnimationFrame(updateStats);
    
    // Clean up on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 mb-8">
      <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-5 bg-purple-950/50 p-3 rounded-md border border-purple-400/20 shadow-inner">
          <div className="relative flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            <div className="absolute w-4 h-4 bg-green-500 rounded-full opacity-30 animate-ping"></div>
          </div>
          <h2 className="text-lg text-center text-purple-100 font-semibold">Live Platform Activity</h2>
          <span className="text-green-400 text-xs font-semibold bg-green-900/40 px-3 py-1 rounded-full border border-green-500/40 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1.5"></span>
            Actively monitoring
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayStats.map((stat, index) => (
            <div key={index} className="glowing-card bg-purple-800/20 p-4 text-center relative rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="text-purple-300 text-sm mb-1.5 flex items-center justify-center gap-1">
                {stat.label}
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              </div>
              <div className="stats-value text-xl md:text-2xl font-bold text-white">
                {stat.suffix}{formatNumber(stat.value)}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 mx-auto w-fit">
                <div className="text-green-400 text-xs font-medium bg-green-900/40 py-1.5 px-4 rounded-full border border-green-500/40 flex items-center gap-1.5 shadow-md shadow-green-900/30 relative overflow-hidden hover:bg-green-900/50 transition-all duration-300">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent skeleton-wave"></span>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse relative z-10"></span>
                  <span className="relative z-10">Live Updates</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveStats;