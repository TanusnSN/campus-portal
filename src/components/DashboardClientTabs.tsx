'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardSkeleton from './DashboardSkeleton';

type Item = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  contact_info: string;
  image_url: string | null;
  status: string;
};

type Props = {
  todayStr: string;
  todayAttendance: { status: string } | null;
  items: Item[];
  markAttendance: () => Promise<void>;
};

export default function DashboardClientTabs({
  todayStr,
  todayAttendance,
  items: initialItems,
  markAttendance,
}: Props) {
  const [tab, setTab] = useState<'attendance' | 'lostfound'>('attendance');
  const [items, setItems] = useState<Item[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const switchTab = (nextTab: 'attendance' | 'lostfound') => {
    if (nextTab === tab) return;
    setIsLoading(true);
    setTimeout(() => {
      setTab(nextTab);
      setIsLoading(false);
    }, 180);
  };

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('Checking authentication...');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const contact = formData.get('contact') as string;
    const file = formData.get('photo') as File | null;

    try {
      const supabase = createClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();

      if (authErr || !user) {
        alert('Your login session expired. Please sign in again.');
        return;
      }

      let imageUrl: string | null = null;

      if (file && file.size > 0) {
        setStatusMsg('Uploading photo to Supabase...');
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('lost-found')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          alert(`Storage Error: ${uploadError.message}`);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('lost-found')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      setStatusMsg('Saving notice...');
      const { data: insertedItem, error: insertError } = await supabase
        .from('lost_found_items')
        .insert({
          title,
          description,
          category,
          location,
          contact_info: contact,
          image_url: imageUrl,
          reported_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        alert(`Database Error: ${insertError.message}`);
        return;
      }

      setItems((prev) => [insertedItem, ...prev]);
      form.reset();
      setStatusMsg('Notice posted successfully!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isLoading && <DashboardSkeleton />}

      {/* Student 2-Tab Switcher */}
      <div className="grid grid-cols-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
        <button
          type="button"
          onClick={() => switchTab('attendance')}
          className={`py-3 text-center rounded-xl font-bold text-sm transition ${
            tab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          📅 Attendance Portal
        </button>
        <button
          type="button"
          onClick={() => switchTab('lostfound')}
          className={`py-3 text-center rounded-xl font-bold text-sm transition ${
            tab === 'lostfound'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🔍 Lost & Found Portal
        </button>
      </div>

      {/* ATTENDANCE TAB */}
      {tab === 'attendance' && (
        <section className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-md p-8 rounded-2xl shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Attendance Tracker</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Record and monitor your daily presence</p>
          </div>

          <div className="p-6 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Today&apos;s Date</p>
              <p className="text-lg font-bold text-white font-mono mt-0.5">{todayStr}</p>
            </div>
            {todayAttendance ? (
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl text-sm font-semibold">
                ✓ Recorded ({todayAttendance.status})
              </div>
            ) : (
              <form action={markAttendance}>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg transition">
                  Check-In Now
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* LOST & FOUND TAB */}
      {tab === 'lostfound' && (
        <div className="space-y-8">
          <section className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-md p-8 rounded-2xl shadow-xl space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Report an Item</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Post an item you lost or found on campus</p>
            </div>

            {statusMsg && (
              <div className="p-3 text-xs font-mono rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="title"
                placeholder="Item Title (e.g. Blue Backpack)"
                required
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <input
                name="location"
                placeholder="Location (e.g. Science Library 2nd Floor)"
                required
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <select
                name="category"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
              <input
                name="contact"
                placeholder="Your Contact (Phone or Email)"
                required
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">Upload Photo (Optional)</label>
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <textarea
                name="description"
                placeholder="Item details and descriptions..."
                rows={3}
                className="sm:col-span-2 w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading notice...
                  </>
                ) : (
                  'Post Notice'
                )}
              </button>
            </form>
          </section>

          {/* Notices Feed */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">Campus Notice Feed</h2>
            <div className="grid gap-4">
              {items && items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-md p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            item.category === 'lost'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {item.category}
                        </span>
                        <h3 className="text-base font-bold text-white">{item.title}</h3>
                      </div>
                      <p className="text-xs text-zinc-400">{item.description}</p>

                      {item.image_url && (
                        <div className="pt-2">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="max-h-48 w-auto rounded-xl border border-zinc-800 object-cover"
                          />
                        </div>
                      )}

                      <p className="text-[11px] text-zinc-500 pt-1">📍 {item.location} • 📞 {item.contact_info}</p>
                    </div>
                    <span className="text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg capitalize self-start">
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-zinc-800 text-zinc-500 text-sm rounded-2xl">
                  No active notices reported yet.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
