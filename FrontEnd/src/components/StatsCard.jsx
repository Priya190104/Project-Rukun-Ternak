import React from 'react';

export default function StatsCard({ title, value, icon, color = 'bg-emerald-100 text-emerald-600' }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
