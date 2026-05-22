import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  title?: string;
}

export default function ErrorState({
  message,
  onRetry,
  title = "Something went wrong",
}: ErrorStateProps) {
  return (
    <div className="mx-auto my-6 max-w-lg rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="mb-1 text-md font-bold text-red-950">{title}</h3>
      <p className="mb-6 text-sm font-medium leading-relaxed text-red-800">
        {message || "Please try again after checking the file and backend service."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Restart process
      </button>
    </div>
  );
}
