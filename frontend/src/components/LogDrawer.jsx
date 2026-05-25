import React from 'react';
import { X, Loader2, Cpu, Clock, Layers } from 'lucide-react';
import { usePipelineQueries } from '../hooks/usePipelineQueries';

export default function LogDrawer({ logId, onClose }) {
  const { useGetLogDetail } = usePipelineQueries();
  const { data: log, isLoading } = useGetLogDetail(logId);

  if (!logId) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header Layout */}
      <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/40">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Transaction Trace Insight</h3>
          <p className="text-[10px] font-mono text-slate-500">{logId}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content Rendering Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
          </div>
        ) : !log ? (
          <div className="text-center text-slate-500">Failed to locate targeted transaction log detail record.</div>
        ) : (
          <>
            {/* Core Metrics Summary Banner */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono">
              <div>
                <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Latency</div>
                <div className="text-slate-200 font-bold">{log.latency_ms}ms</div>
              </div>
              <div>
                <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">TTFT</div>
                <div className="text-slate-200 font-bold">{log.ttft_ms || 'N/A'}ms</div>
              </div>
              <div>
                <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Tokens</div>
                <div className="text-slate-200 font-bold">{log.total_tokens || 0}</div>
              </div>
            </div>

            {/* Model Router Details Metadata Block */}
            <div className="space-y-2 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div className="flex justify-between items-center border-b border-slate-800/40 pb-1.5">
                <span className="text-slate-500">Model Provider</span>
                <span className="font-mono text-slate-200 uppercase font-semibold">{log.provider}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/40 pb-1.5">
                <span className="text-slate-500">Target Model Type</span>
                <span className="font-mono text-slate-200">{log.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status Vector</span>
                <span className={`font-semibold ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {log.status}
                </span>
              </div>
            </div>

            {/* Text Ingestion Scraped Cache Inputs (PII Shield Screen Validated) */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">PII Filtered Prompt Preview</label>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-slate-300 leading-relaxed max-h-36 overflow-y-auto break-all">
                {log.input_preview || <span className="text-slate-600 italic">No input data trace cached.</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">PII Filtered Output Preview</label>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-slate-300 leading-relaxed max-h-36 overflow-y-auto break-all">
                {log.output_preview || <span className="text-slate-600 italic">No output completion data trace cached.</span>}
              </div>
            </div>

            {/* Exception Metadata Sub-section Banner block */}
            {log.status === 'error' && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-1">
                <div className="font-bold text-rose-400 uppercase tracking-wide text-[10px]">Exception Code: {log.error_code || 'UNSPECIFIED'}</div>
                <div className="text-rose-300 font-mono text-[11px] leading-relaxed">{log.error_message || 'An anonymous engine exception context was registered.'}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}