import React from 'react';
import ErrorTable from '../components/ErrorTable';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      <h2 className="text-lg font-bold text-slate-100">Telemetry Performance Monitor</h2>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Inference Requests" value="2,840 logs" trend="↑ 4.2% velocity" />
        <MetricCard label="Mean Execution Delta" value="342 ms" trend="↓ 12ms latency optimization" />
        <MetricCard label="Token Bandwidth" value="4.8M units" trend="Stable throughput metric" />
        <MetricCard label="Edge Failure Rate" value="0.12%" trend="Zero fatal runs logged" />
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-xs text-slate-500">
        [Visual Charting Canvas Space - Active Endpoint Recharts Bindings Ready]
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent System Exceptions</h3>
        <ErrorTable />
      </div>
    </div>
  );
}