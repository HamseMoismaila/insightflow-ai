import { AlertTriangle, CheckCircle2, FileSpreadsheet, Info, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import AnalysisStatus from "./components/AnalysisStatus";
import DashboardCharts from "./components/DashboardCharts";
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import FileUploadCard from "./components/FileUploadCard";
import InsightCard from "./components/InsightCard";
import LoadingState from "./components/LoadingState";
import Navbar from "./components/Navbar";
import RecommendationPanel from "./components/RecommendationPanel";
import UploadDropzone from "./components/UploadDropzone";
import {
  analyzeDataset,
  getDashboard,
  normalizeDashboardResponse,
  uploadDataset,
} from "./lib/api";
import type { AnalysisStage, DashboardData, UploadResponse, UploadStage, View } from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("upload");
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadMeta, setUploadMeta] = useState<UploadResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [analysisPreview, setAnalysisPreview] = useState<{ summary?: string; recommendations?: string[] } | null>(null);

  const hasDashboard = dashboardData !== null;

  const derivedStage = analysisStage === "analyzing" ? "analyzing" : uploadStage;

  function resetWorkflow() {
    setCurrentView("upload");
    setUploadStage("idle");
    setAnalysisStage("idle");
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage("");
    setUploadMeta(null);
    setDashboardData(null);
    setIsDashboardLoading(false);
    setAnalysisPreview(null);
  }

  function handleFileSelect(file: File) {
    setSelectedFile(file);
    setUploadMeta(null);
    setDashboardData(null);
    setAnalysisPreview(null);
    setErrorMessage("");
    setUploadProgress(0);
    setUploadStage("file_selected");
    setAnalysisStage("idle");
  }

  async function handleUploadStart() {
    if (!selectedFile) {
      return;
    }

    setUploadStage("uploading");
    setUploadProgress(10);
    setErrorMessage("");

    const interval = window.setInterval(() => {
      setUploadProgress((current) => (current >= 90 ? 90 : current + 15));
    }, 150);

    try {
      const response = await uploadDataset(selectedFile);
      window.clearInterval(interval);
      setUploadMeta(response);
      setUploadProgress(100);
      setUploadStage("upload_success");
    } catch (error) {
      window.clearInterval(interval);
      setUploadStage("upload_error");
      setUploadProgress(100);
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }

  async function handleStartAnalysis() {
    if (!uploadMeta) {
      return;
    }

    setAnalysisStage("analyzing");
    setErrorMessage("");

    try {
      const analyzeResponse = await analyzeDataset(uploadMeta.upload_id);
      setAnalysisPreview({
        summary: analyzeResponse.summary,
        recommendations: analyzeResponse.recommendations,
      });

      const reportId = analyzeResponse.report_id ?? uploadMeta.upload_id;
      setIsDashboardLoading(true);
      const rawDashboard = await getDashboard(reportId);
      const normalized = normalizeDashboardResponse(
        rawDashboard,
        reportId,
        analyzeResponse.summary,
        analyzeResponse.recommendations
      );
      setDashboardData(normalized);
      setCurrentView("dashboard");
      setAnalysisStage("ready");
    } catch (error) {
      setAnalysisStage("error");
      setErrorMessage(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsDashboardLoading(false);
    }
  }

  const dashboardHeaderLabel = useMemo(() => {
    if (dashboardData?.reportId) {
      return dashboardData.reportId;
    }
    return uploadMeta?.upload_id ?? "pending";
  }, [dashboardData?.reportId, uploadMeta?.upload_id]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        hasDashboard={hasDashboard}
        onReset={resetWorkflow}
        datasetName={selectedFile?.name}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentView === "upload" ? (
          <div className="space-y-8 animate-fadeIn">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Instant Strategic Metrics
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Analyze datasets with AI
              </h1>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-500">
                Upload a CSV or Excel file, trigger analysis, and review AI-generated insights, recommendations, and charts.
              </p>
            </div>

            {uploadStage === "idle" ? <UploadDropzone onFileSelect={handleFileSelect} /> : null}

            {(uploadStage === "file_selected" ||
              uploadStage === "uploading" ||
              uploadStage === "upload_success" ||
              uploadStage === "upload_error" ||
              analysisStage === "analyzing") &&
            selectedFile ? (
              <FileUploadCard
                file={selectedFile}
                stage={derivedStage}
                uploadProgress={uploadProgress}
                onRemove={resetWorkflow}
                onUpload={handleUploadStart}
                onStartAnalysis={handleStartAnalysis}
                errorMessage={errorMessage}
              />
            ) : null}

            {analysisStage === "analyzing" && selectedFile ? (
              <AnalysisStatus filename={selectedFile.name} />
            ) : null}

            {analysisStage === "error" ? (
              <ErrorState
                title="Analysis failed"
                message={errorMessage}
                onRetry={resetWorkflow}
              />
            ) : null}

            {uploadStage === "upload_error" ? (
              <ErrorState
                title="Upload failed"
                message={errorMessage}
                onRetry={resetWorkflow}
              />
            ) : null}

            {uploadStage === "idle" ? (
              <div className="mx-auto grid max-w-4xl gap-6 border-t border-slate-200 pt-8 md:grid-cols-3">
                <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Upload
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-slate-950">CSV and Excel support</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-550">
                      Drag and drop datasets or browse locally to start the workflow.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Analyze
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-slate-950">Backend-powered insight generation</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-550">
                      Trigger the API flow that uploads, analyzes, and prepares dashboard data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Review
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-slate-950">Clear result states</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-550">
                      See loading, empty, and error states while the backend endpoints evolve.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {currentView === "dashboard" ? (
          <div className="space-y-8 animate-fadeIn">
            {isDashboardLoading ? <LoadingState /> : null}

            {!isDashboardLoading && dashboardData ? (
              <>
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Active Report
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">ID: {dashboardHeaderLabel}</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Analysis for <span className="text-blue-600">{selectedFile?.name ?? "dataset"}</span>
                    </h1>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Info className="h-3 w-3 text-slate-400" />
                      {dashboardData.analyzedAt ?? "Dashboard data loaded from the backend"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetWorkflow}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow"
                  >
                    Analyze New File
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                    <FileSpreadsheet className="h-32 w-32 text-blue-100" />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-blue-700">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" /> EXECUTIVE SUMMARY
                    </div>
                    <p className="max-w-4xl text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">
                      "{dashboardData.summary}"
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {dashboardData.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">
                        {metric.label}
                      </span>
                      <span className="mt-1 block text-xl font-black tracking-tight text-slate-900">
                        {metric.value}
                      </span>
                      <div className="mt-1.5 flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-blue-600">
                        <Info className="h-3 w-3" /> {metric.helper}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <DashboardCharts
                      barChartData={dashboardData.charts.barChartData}
                      lineChartData={dashboardData.charts.lineChartData}
                      pieChartData={dashboardData.charts.pieChartData}
                    />

                    <div>
                      <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-gray-400">
                        Core Insights
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {dashboardData.insights.map((insight) => (
                          <InsightCard key={insight.id} insight={insight} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <RecommendationPanel recommendations={dashboardData.recommendations} />

                    <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/20 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                        <Info className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                        Backend-connected MVP
                      </div>
                      <p className="text-[10px] font-semibold leading-relaxed text-blue-800">
                        This v1 frontend is wired to the real backend endpoints and avoids mock business data. It shows partial dashboards gracefully when the API returns a minimal response.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {!isDashboardLoading && !dashboardData ? (
              analysisPreview || errorMessage ? (
                <ErrorState
                  title="Dashboard unavailable"
                  message={errorMessage || "The backend did not return dashboard data for this report yet."}
                  onRetry={resetWorkflow}
                />
              ) : (
                <EmptyState onActionClick={() => setCurrentView("upload")} />
              )
            ) : null}
          </div>
        ) : null}
      </main>

      <footer className="mt-20 border-t border-gray-100 bg-white py-8 text-center text-xs font-medium text-gray-400">
        <p>© 2026 InsightFlow AI. Frontend v1 for AI-powered dataset analysis.</p>
      </footer>
    </div>
  );
}
