import React from 'react';

export default function ErrorTable() {
  const dummyErrors = [
    { time: '12:02 PM', session: '1', provider: 'openai', code: '429', msg: 'Rate limit reached' },
    { time: '11:15 AM', session: '2', provider: 'google', code: '503', msg: 'Service Unavailable' }
  ];

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
          {dummyErrors.map((err, i) => (
            <tr key={i} className="hover:bg-slate-800/30">
              <td className="p-3">{err.time}</td>
              <td className="p-3 text-emerald-400">sess_{err.session}</td>
              <td className="p-3 uppercase">{err.provider}</td>
              <td className="p-3 text-rose-400">{err.code}</td>
              <td className="p-3 truncate max-w-[200px] text-slate-400">{err.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}