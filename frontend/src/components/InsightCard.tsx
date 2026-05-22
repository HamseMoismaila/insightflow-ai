import { Info } from "lucide-react";

import type { DashboardInsight } from "../types";

interface InsightCardProps {
  insight: DashboardInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded border border-blue-100 bg-blue-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-blue-800">
            <Info className="h-2.5 w-2.5 shrink-0" />
            Insight
          </span>

          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600">
            <Info className="h-3.5 w-3.5" />
          </div>
        </div>

        <h4 className="mb-1 text-xs font-bold leading-snug text-slate-900">{insight.title}</h4>
        <p className="text-[11px] leading-relaxed text-slate-500">{insight.description}</p>
      </div>
    </div>
  );
}
