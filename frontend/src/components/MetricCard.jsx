import React from 'react';

export default function MetricCard({ label, value, trend }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-slate-200 mt-1">{value}</div>
      <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">{trend}</div>
    </div>
  );
}