import React, { useState, useEffect } from 'react';

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

  const [stats, setStats] = useState<LiveStat[]>(initialStats);

  useEffect(() => {
    // Create separate intervals for each stat
    const intervals = stats.map((stat, index) => {
      return setInterval(() => {
        setStats(prevStats => {
          const newStats = [...prevStats];
          newStats[index] = {
            ...newStats[index],
            value: newStats[index].value + newStats[index].increment
          };
          return newStats;
        });
      }, stat.interval);
    });

    // Clear intervals on unmount
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 mb-8">
      <h2 className="text-lg text-center text-purple-200 mb-4">Live Platform Activity</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="glowing-card p-4 text-center">
            <div className="text-purple-300 text-sm mb-1">{stat.label}</div>
            <div className="stats-value text-xl md:text-2xl font-bold">
              {stat.suffix}{formatNumber(stat.value)}
            </div>
            <div className="text-purple-400 text-xs mt-1 opacity-70">Live Updates</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveStats;