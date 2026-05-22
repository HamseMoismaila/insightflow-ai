import { AlertCircle, Check, FileSpreadsheet, Loader2, Sparkles, X } from "lucide-react";

import type { UploadStage } from "../types";

interface FileUploadCardProps {
  file: File;
  stage: UploadStage | "analyzing";
  uploadProgress: number;
  onRemove: () => void;
  onUpload: () => void;
  onStartAnalysis: () => void;
  errorMessage?: string;
}

export default function FileUploadCard({
  file,
  stage,
  uploadProgress,
  onRemove,
  onUpload,
  onStartAnalysis,
  errorMessage,
}: FileUploadCardProps) {
  const isUploading = stage === "uploading";
  const isSuccess = stage === "upload_success" || stage === "analyzing";
  const isError = stage === "upload_error";

  function formatSize(bytes: number) {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const sizes = ["Bytes", "KB", "MB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${sizes[index]}`;
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
            <FileSpreadsheet className="h-5.5 w-5.5" />
          </div>
          <div className="min-w-0">
            <h4 className="max-w-[280px] truncate text-sm font-semibold text-slate-900" title={file.name}>
              {file.name}
            </h4>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold text-slate-500">{formatSize(file.size)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-slate-700">
                {file.name.split(".").pop() ?? "dataset"}
              </span>
            </div>
          </div>
        </div>

        {stage !== "uploading" && stage !== "analyzing" ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {(isUploading || isSuccess || isError) ? (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            {isUploading ? (
              <span className="flex items-center gap-1.5 text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading dataset...
              </span>
            ) : null}
            {isSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Check className="h-3.5 w-3.5 rounded-full bg-emerald-50" />
                Upload complete
              </span>
            ) : null}
            {isError ? (
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                Upload failed
              </span>
            ) : null}
            <span className="font-mono font-bold text-slate-600">{uploadProgress}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isError ? "bg-red-500" : isSuccess ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        {stage === "file_selected" ? (
          <button
            type="button"
            onClick={onUpload}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200/50 transition hover:bg-blue-700"
          >
            Upload Dataset
          </button>
        ) : null}

        {stage === "upload_success" ? (
          <button
            type="button"
            onClick={onStartAnalysis}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/50 transition-all hover:bg-blue-700"
          >
            <Sparkles className="h-4.5 w-4.5 text-amber-300 transition-transform group-hover:rotate-12" />
            Start Analysis
          </button>
        ) : null}

        {isError ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold leading-relaxed text-red-700">
              {errorMessage ?? "Something unexpected interrupted the upload. Please try again."}
            </p>
            <button
              type="button"
              onClick={onUpload}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100/40"
            >
              Retry Upload
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
