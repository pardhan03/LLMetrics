import React from 'react';

function formatTimestamp(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function ErrorTable({ errors = [] }) {
  if (errors.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500">
        No error logs recorded.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-950 text-slate-400 font-mono text-xs uppercase border-b border-slate-800">
          <tr>
            <th className="p-3">Timestamp</th>
            <th className="p-3">Session</th>
            <th className="p-3">Provider</th>
            <th className="p-3">Error Code</th>
            <th className="p-3">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 font-mono text-xs text-slate-300">
          {errors.map((err) => (
            <tr key={err.id} className="hover:bg-slate-800/30">
              <td className="p-3">{formatTimestamp(err.created_at)}</td>
              <td className="p-3 text-emerald-400 truncate max-w-[120px]">{err.session_id?.slice(0, 8)}…</td>
              <td className="p-3 uppercase">{err.provider}</td>
              <td className="p-3 text-rose-400">{err.error_code || 'UNKNOWN'}</td>
              <td className="p-3 truncate max-w-[200px] text-slate-400">{err.error_message || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
