'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Item = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  contact_info: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

type AttendanceRecord = {
  id: string;
  user_id: string;
  date: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
};

export default function AdminClientPortal({
  initialItems = [],
  attendanceLogs = [],
}: {
  initialItems?: Item[];
  attendanceLogs?: AttendanceRecord[];
}) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'items'>('attendance');
  const [items, setItems] = useState<Item[]>(initialItems);
  const [logs, setLogs] = useState<AttendanceRecord[]>(attendanceLogs);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getStoragePathFromUrl = (url: string) => {
    const marker = '/storage/v1/object/public/lost-found/';
    const idx = url.indexOf(marker);
    return idx !== -1 ? decodeURIComponent(url.substring(idx + marker.length)) : null;
  };

  const handleDeleteItem = async (itemId: string, imageUrl: string | null) => {
    if (!confirm('Permanently delete this notice and clear its photo from storage?')) return;
    setDeletingId(itemId);
    try {
      const supabase = createClient();
      if (imageUrl) {
        const filePath = getStoragePathFromUrl(imageUrl);
        if (filePath) await supabase.storage.from('lost-found').remove([filePath]);
      }
      await supabase.from('lost_found_items').delete().eq('id', itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAttendance = async (logId: string) => {
    if (!confirm('Delete this attendance entry?')) return;
    setDeletingId(logId);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('attendance').delete().eq('id', logId);
      if (error) {
        alert('Database error: ' + error.message);
        return;
      }
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete attendance record.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`py-3 text-center rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          📋 Attendance Logs ({logs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`py-3 text-center rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
            activeTab === 'items'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🗑️ Delete Items ({items.length})
        </button>
      </div>

      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Student Attendance Check-Ins</h2>
            <span className="text-xs font-mono text-zinc-500">Total present: {logs.length}</span>
          </div>
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900/40">
                        <td className="py-3 px-4 font-mono font-medium text-white">
                          {log.profiles?.full_name || log.user_id}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400">{log.date}</td>
                        <td suppressHydrationWarning className="py-3 px-4 font-mono text-zinc-500">
                          {formatTime(log.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            disabled={deletingId === log.id}
                            onClick={() => handleDeleteAttendance(log.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition disabled:opacity-50"
                          >
                            {deletingId === log.id ? '...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        No attendance logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Moderate Lost & Found Notices</h2>
          <div className="grid gap-3">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/30">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-zinc-400">{item.description || 'No description'}</p>
                    {item.image_url && (
                      <div className="pt-1">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-20 w-32 object-cover rounded-lg border border-zinc-800"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    disabled={deletingId === item.id}
                    onClick={() => handleDeleteItem(item.id, item.image_url)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50 shrink-0"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete & Clear Storage'}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
                No items to delete.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
