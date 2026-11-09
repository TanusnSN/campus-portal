'use client';

import { useEffect, useState } from 'react';

export default function DashboardSkeleton() {
  const [progress, setProgress] = useState(15);
  const totalBlocks = 20;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const jump = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + jump, 95);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  const filledBlocks = Math.round((progress / 100) * totalBlocks);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-mono text-white select-none">
      <div className="w-80 sm:w-96 space-y-4">
        
        {/* Top text: LOADING... and Percentage */}
        <div className="flex justify-between items-baseline font-bold tracking-widest text-base sm:text-lg">
          <span className="uppercase tracking-widest animate-pulse">LOADING...</span>
          <span className="tabular-nums">{progress}%</span>
        </div>

        {/* 8-bit Pixel Border Container */}
        <div className="p-1.5 border-4 border-white bg-black">
          {/* Segmented Block Grid */}
          <div className="flex h-7 w-full gap-1">
            {Array.from({ length: totalBlocks }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 transition-all duration-75 ${
                  i < filledBlocks ? 'bg-white' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
