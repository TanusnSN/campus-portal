'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSkeleton from './DashboardSkeleton';

export default function ModuleSwitcher({ currentTab }: { currentTab: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (view: string) => {
    if (view === currentTab) return;

    // Show retro loader instantly
    setIsLoading(true);

    // Trigger URL change and data fetch right away without any delay
    router.push(`/dashboard?view=${view}`);

    // Auto-dismiss the loader as soon as the view flips
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  return (
    <>
      {isLoading && <DashboardSkeleton />}

      <div className="grid grid-cols-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
        <button
          type="button"
          onClick={() => handleTabChange('attendance')}
          className={`py-3 text-center rounded-xl font-bold text-sm transition ${
            currentTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          📅 Attendance Portal
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('lostfound')}
          className={`py-3 text-center rounded-xl font-bold text-sm transition ${
            currentTab === 'lostfound'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🔍 Lost & Found Portal
        </button>
      </div>
    </>
  );
}
