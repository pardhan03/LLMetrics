import React from 'react';
import ErrorTable from '../components/ErrorTable';
import MetricCard from '../components/MetricCard';
import { usePipelineQueries } from '../hooks/usePipelineQueries';
import { Loader2, BarChart4 } from 'lucide-react';

export default function Dashboard() {
  const { useGetAnalyticsSummary, useGetAnalyticsErrors } = usePipelineQueries();

  // Execute analytical caches
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: errorPayload, isLoading: isLoadingErrors } = useGetAnalyticsErrors();

  if (isLoadingSummary || isLoadingErrors) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6 bg-slate-950 text-slate-100">
      <h2 className="text-lg font-bold text-slate-100">Telemetry Performance Monitor</h2>

      {/* Metric Cards Grid Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Inference Requests"
          value={`${summary?.total_requests?.toLocaleString() || 0} logs`}
          trend="Total pre-aggregated operations"
        />
        <MetricCard
          label="Mean Execution Delta"
          value={`${Math.round(summary?.avg_latency_ms || 0)} ms`}
          trend="Real-time latency rolling metric"
        />
        <MetricCard
          label="Token Bandwidth"
          value={`${((summary?.total_tokens || 0) / 1000000).toFixed(2)}M units`}
          trend="Accumulated operational volume"
        />
        <MetricCard
          label="Edge Failure Rate"
          value={`${summary?.error_count || 0} exceptions`}
          trend="Aggregated failure instance tracking"
        />
      </div>

      {/* Visual Charting Placeholder Canvas */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center text-center text-xs text-slate-500 gap-2">
        <BarChart4 className="h-5 w-5 text-slate-600" />
        <span>Pre-Aggregated Hourly Snapshot Chart Framework Mounted</span>
      </div>

      {/* Recent Errors Table Block */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent System Exceptions</h3>
        {/* Pass your real data down directly into the presentation component */}
        <ErrorTable errors={errorPayload?.recent_errors || []} />
      </div>
    </div>
  );
}