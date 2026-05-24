import React from 'react';

export default function Settings() {
  return (
    <div className="p-6 overflow-y-auto h-full max-w-lg space-y-6">
      <h2 className="text-lg font-bold text-slate-100">System Parameters</h2>
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-200">Asynchronous Client PII Redaction Filter</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Scrubs credentials and identification arrays before pushing payloads to the SDK ingestion point.</div>
        </div>
        <div className="h-5 w-8 bg-emerald-500 rounded-full p-0.5 cursor-pointer flex justify-end">
          <div className="h-4 w-4 bg-slate-950 rounded-full" />
        </div>
      </div>
    </div>
  );
}