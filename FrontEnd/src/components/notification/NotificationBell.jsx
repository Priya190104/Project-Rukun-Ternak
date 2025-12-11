import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';

const MOCK_KEY = 'rukun_notifications_v1';

function defaultNotifications() {
  return [
    { id: 'n1', title: 'Laporan baru masuk dari Kelompok A', time: '2 jam lalu', read: false },
    { id: 'n2', title: 'Laporan #120 disetujui', time: '1 hari lalu', read: true },
    { id: 'n3', title: 'Kelompok B meminta akses', time: '3 hari lalu', read: false },
  ];
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem(MOCK_KEY);
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch (e) { setItems(defaultNotifications()); }
    } else {
      const d = defaultNotifications();
      setItems(d);
      localStorage.setItem(MOCK_KEY, JSON.stringify(d));
    }
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const unreadCount = items.filter((i) => !i.read).length;

  const toggle = (e) => {
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const markAllRead = () => {
    const updated = items.map((i) => ({ ...i, read: true }));
    setItems(updated);
    localStorage.setItem(MOCK_KEY, JSON.stringify(updated));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative p-2 rounded hover:bg-emerald-50">
        <Bell size={20} className="text-emerald-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="text-sm font-medium text-emerald-900">Notifikasi</div>
            <button onClick={markAllRead} className="text-xs text-emerald-600">Tandai semua dibaca</button>
          </div>

          <div className="max-h-64 overflow-auto">
            {items.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">Tidak ada notifikasi</div>
            ) : (
              items.map((it) => (
                <div key={it.id} className={`p-3 border-b ${it.read ? 'bg-white' : 'bg-emerald-50'}`}>
                  <div className="text-sm text-emerald-800">{it.title}</div>
                  <div className="text-xs text-gray-500">{it.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
