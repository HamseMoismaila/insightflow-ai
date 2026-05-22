import { FileType2, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  onActionClick: () => void;
}

export default function EmptyState({ onActionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <FileType2 className="h-7 w-7 animate-pulse" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">No dashboard data yet</h3>
      <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-gray-500">
        Upload a CSV or XLSX file and run analysis to populate the dashboard with insights and charts.
      </p>

      <button
        type="button"
        onClick={onActionClick}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
      >
        <PlusCircle className="h-4 w-4" />
        Upload dataset
      </button>
    </div>
  );
}
