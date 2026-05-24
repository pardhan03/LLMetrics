import React from 'react';
import { X } from 'lucide-react';
import { mockLogDetails } from '../utils/contant';

export default function LogDrawer({ logId, onClose }) {
  if (!logId) return null;
  const log = mockLogDetails[logId];

  return (
    <div className="absolute top-0 right-0 w-[450px] h-full bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col p-6 animate-in slide-in-from-right duration-200">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <h3 className="font-bold text-slate-200">Inference Pipeline Metadata</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      {log ? (
        <div className="space-y-6 text-sm overflow-y-auto flex-1 pr-1">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Scope Metadata</h4>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Log ID:</span><span className="text-slate-300">{log.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Provider:</span><span className="text-emerald-400 font-bold uppercase">{log.provider}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Model:</span><span className="text-slate-300">{log.model}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SDK Metrics Output</h4>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800"><div className="text-xs text-slate-500">Total Latency</div><div className="text-lg font-bold text-slate-200 mt-1">{log.latencyMs}ms</div></div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800"><div className="text-xs text-slate-500">TTFT Stream</div><div className="text-lg font-bold text-slate-200 mt-1">{log.ttftMs}ms</div></div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800"><div className="text-xs text-slate-500">Prompt Tokens</div><div className="text-base font-bold text-slate-300 mt-1">{log.promptTokens}</div></div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800"><div className="text-xs text-slate-500">Completion Tokens</div><div className="text-base font-bold text-slate-300 mt-1">{log.completionTokens}</div></div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Redacted Prompt Preview</h4>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {log.inputPreview}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">No log data mapped for this key identifier.</p>
      )}
    </div>
  );
}