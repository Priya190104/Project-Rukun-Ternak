import React from 'react';
import { User } from 'lucide-react';

export default function UserCard({ user, appRole }) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
          <User size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">User Info</p>
          <p className="text-sm font-bold text-gray-900 mt-1 truncate">{user?.full_name || user?.name || 'User'}</p>
          <p className="text-xs text-gray-600 truncate">{user?.username || 'username'}</p>
          <div className="flex gap-2 items-center mt-2">
            <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold ${
              appRole === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'
            }`}>
              {appRole === 'admin' ? 'Admin' : 'Kelompok'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
