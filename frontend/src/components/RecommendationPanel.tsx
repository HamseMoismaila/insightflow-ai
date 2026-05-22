import { Lightbulb } from "lucide-react";

interface RecommendationPanelProps {
  recommendations: string[];
}

export default function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  return (
    <div className="rounded-2xl border border-indigo-950 bg-indigo-950 p-5 text-white shadow-xl shadow-indigo-950/20 sm:p-6">
      <div className="mb-5 flex items-center gap-2.5 border-b border-indigo-800 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-800">
          <Lightbulb className="h-4.5 w-4.5 text-indigo-300" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-tight text-white">Recommendations</h3>
          <p className="font-mono text-[10px] font-semibold tracking-wider text-indigo-300">V1 ACTION PANEL</p>
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={`${recommendation}-${index}`}
              className="rounded-xl border border-indigo-800/60 bg-indigo-900/40 p-3.5"
            >
              <h4 className="mb-2 text-xs font-bold text-white">Recommendation {index + 1}</h4>
              <p className="text-xs font-medium leading-relaxed text-indigo-150">{recommendation}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-indigo-800 bg-indigo-900/20 p-4 text-xs leading-relaxed text-indigo-200">
          No recommendations are available yet. Once the backend returns them, they will appear here.
        </div>
      )}
    </div>
  );
}
