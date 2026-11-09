import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { markAttendance } from '@/app/actions/portal';
import { logout } from '@/app/actions/auth';
import ThreeCanvas from '@/components/ThreeCanvas';
import DashboardClientTabs from '@/components/DashboardClientTabs';

async function DashboardContent() {
  await connection();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', todayStr)
    .maybeSingle();

  const { data: items } = await supabase
    .from('lost_found_items')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/80 border border-zinc-800 backdrop-blur-md p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-black text-white">Campus Portal</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Logged in as <span className="text-indigo-400 font-mono">{user.email}</span>
          </p>
        </div>
        <form action={logout}>
          <button className="text-xs font-semibold px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition">
            Sign Out
          </button>
        </form>
      </header>

      {/* Student Tabs: Attendance + Report */}
      <DashboardClientTabs
        todayStr={todayStr}
        todayAttendance={todayAttendance}
        items={items || []}
        markAttendance={markAttendance}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <ThreeCanvas />
      <Suspense fallback={<div className="relative z-20 p-10 text-center font-mono text-xs text-zinc-400">Loading portal...</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
