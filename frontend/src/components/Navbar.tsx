import { BarChart3, CloudLightning, RefreshCw, Upload } from "lucide-react";

interface NavbarProps {
  currentView: "upload" | "dashboard";
  onNavigate: (view: "upload" | "dashboard") => void;
  hasDashboard: boolean;
  onReset: () => void;
  datasetName?: string;
}

export default function Navbar({
  currentView,
  onNavigate,
  hasDashboard,
  onReset,
  datasetName,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-200/50">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold leading-none tracking-tight text-slate-900">
              InsightFlow <span className="text-blue-600 italic">AI</span>
            </span>
            <span className="rounded bg-blue-50 px-1 text-[9px] font-bold uppercase tracking-wider text-blue-600">
              v1
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {datasetName ? (
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 md:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-slate-600">
                Dataset: <span className="font-semibold">{datasetName}</span>
              </span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => onNavigate("upload")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              currentView === "upload"
                ? "border border-blue-100 bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasDashboard) {
                onNavigate("dashboard");
              }
            }}
            disabled={!hasDashboard}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              currentView === "dashboard"
                ? "border border-blue-100 bg-blue-50 text-blue-700"
                : hasDashboard
                ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                : "cursor-not-allowed text-slate-300 opacity-50"
            }`}
          >
            <CloudLightning className="h-3.5 w-3.5" />
            Dashboard
          </button>

          {hasDashboard ? (
            <button
              type="button"
              onClick={onReset}
              className="ml-1.5 flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition-all hover:border-blue-100 hover:text-blue-600"
              title="Start over"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
