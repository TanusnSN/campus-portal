import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions/auth';
import ThreeCanvas from '@/components/ThreeCanvas';
import AdminClientPortal from '@/components/AdminClientPortal';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: items } = await supabase
    .from('lost_found_items')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: attendanceLogs } = await supabase
    .from('attendance')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });

  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      <ThreeCanvas />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 space-y-8">
        <header className="flex justify-between items-center bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-black text-white">Admin Management Portal</h1>
            <p className="text-xs text-zinc-400 mt-1">Signed in as Admin: {user.email}</p>
          </div>
          <form action={logout}>
            <button className="text-xs font-semibold px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
              Sign Out
            </button>
          </form>
        </header>

        <section className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl">
          <AdminClientPortal
            initialItems={items || []}
            attendanceLogs={attendanceLogs || []}
          />
        </section>
      </div>
    </main>
  );
}
