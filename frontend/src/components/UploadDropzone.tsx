import { useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
}

const ACCEPTED_EXTENSIONS = new Set(["csv", "xlsx", "xls"]);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export default function UploadDropzone({ onFileSelect }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateAndSubmit(file: File) {
    setValidationError(null);

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ACCEPTED_EXTENSIONS.has(extension)) {
      setValidationError("Please select a valid CSV or Excel (.xlsx, .xls) dataset.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError("Dataset too large. The v1 upload limit is 50MB.");
      return;
    }

    onFileSelect(file);
  }

  function handleDrag(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragActive(true);
      return;
    }
    setIsDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      validateAndSubmit(file);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSubmit(file);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 ${
          isDragActive
            ? "scale-[0.99] border-blue-500 bg-blue-50/45 shadow-inner"
            : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50 hover:shadow-sm"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleInputChange}
        />

        <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
          <Upload className={`h-6 w-6 transition-transform ${isDragActive ? "-translate-y-1 text-blue-500" : ""}`} />
          <FileSpreadsheet className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-blue-500" />
        </div>

        <h3 className="text-md mb-1 font-semibold text-slate-950">Drag and drop your dataset</h3>
        <p className="mb-6 max-w-sm text-sm text-slate-500">
          Or click to browse local files. Supports <span className="font-medium text-slate-800">CSV, XLSX, and XLS</span>.
        </p>

        <span className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-200/50 transition hover:bg-blue-700">
          Select Spreadsheet
        </span>
      </div>

      {validationError ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 p-3 text-left text-xs text-red-800 animate-slideUp">
          <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600" />
          <div>
            <span className="font-bold">Invalid file:</span> {validationError}
          </div>
        </div>
      ) : null}
    </div>
  );
}
