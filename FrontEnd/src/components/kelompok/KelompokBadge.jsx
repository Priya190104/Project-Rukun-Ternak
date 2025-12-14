import React from 'react';
import { Users } from 'lucide-react';

export default function KelompokBadge({ kelompokName }) {
  if (!kelompokName) return null;
  
  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-lg px-4 py-3 shadow-sm inline-flex items-center gap-3">
      <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
        <Users size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Kelompok</p>
        <p className="text-sm font-bold text-gray-900 truncate">{kelompokName}</p>
      </div>
    </div>
  );
}
