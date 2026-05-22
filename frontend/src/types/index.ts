export type View = "upload" | "dashboard";

export type UploadStage =
  | "idle"
  | "file_selected"
  | "uploading"
  | "upload_success"
  | "upload_error";

export type AnalysisStage =
  | "idle"
  | "analyzing"
  | "ready"
  | "error";

export interface UploadResponse {
  upload_id: string;
  status: string;
  filename?: string;
  row_count?: number;
  message?: string;
}

export interface AnalyzeResponse {
  report_id?: string;
  summary?: string;
  recommendations?: string[];
  status?: string;
  message?: string;
}

export interface ChartDatum {
  name: string;
  value: number;
}

export interface DashboardChartGroup {
  barChartData: ChartDatum[];
  lineChartData: ChartDatum[];
  pieChartData: ChartDatum[];
}

export interface DashboardMetric {
  label: string;
  value: string;
  helper: string;
}

export interface DashboardInsight {
  id: string;
  title: string;
  description: string;
}

export interface DashboardData {
  reportId: string;
  title: string;
  analyzedAt?: string;
  summary: string;
  recommendations: string[];
  metrics: DashboardMetric[];
  insights: DashboardInsight[];
  charts: DashboardChartGroup;
}
