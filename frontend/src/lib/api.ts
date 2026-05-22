import type { AnalyzeResponse, DashboardData, UploadResponse } from "../types";

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim() ??
  import.meta.env.NEXT_PUBLIC_API_BASE_URL?.trim() ??
  "";

function resolveApiBaseUrl(rawApiBase: string): string {
  const normalizedBase = rawApiBase.replace(/\/$/, "");
  if (!normalizedBase) {
    return "/api/v1";
  }

  if (normalizedBase.endsWith("/api/v1")) {
    return normalizedBase;
  }

  return `${normalizedBase}/api/v1`;
}

const API_BASE = resolveApiBaseUrl(RAW_API_BASE);

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "detail" in payload && String(payload.detail)) ||
      (payload && typeof payload === "object" && "message" in payload && String(payload.message)) ||
      `${fallbackMessage} (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

export async function uploadDataset(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Failed to reach the backend API. Check that the backend is running and CORS is configured.");
    }
    throw error;
  }

  const payload = await parseJsonResponse<UploadResponse>(response, "Upload failed");
  return {
    ...payload,
    filename: payload.filename ?? file.name,
  };
}

export async function analyzeDataset(uploadId: string): Promise<AnalyzeResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/analyze/${uploadId}`, {
      method: "POST",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Failed to reach the backend API. Check that the backend is running and CORS is configured.");
    }
    throw error;
  }

  return parseJsonResponse<AnalyzeResponse>(response, "Analysis failed");
}

export async function getDashboard(reportId: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/dashboard/${reportId}`, {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Failed to reach the backend API. Check that the backend is running and CORS is configured.");
    }
    throw error;
  }

  return parseJsonResponse<unknown>(response, "Dashboard loading failed");
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeChartData(value: unknown): { name: string; value: number }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const rawName = "name" in item ? item.name : `Item ${index + 1}`;
      const rawValue = "value" in item ? item.value : null;
      const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);

      if (!Number.isFinite(numericValue)) {
        return null;
      }

      return {
        name: typeof rawName === "string" ? rawName : `Item ${index + 1}`,
        value: numericValue,
      };
    })
    .filter((item): item is { name: string; value: number } => item !== null);
}

export function normalizeDashboardResponse(
  payload: unknown,
  reportId: string,
  fallbackSummary?: string,
  fallbackRecommendations?: string[]
): DashboardData {
  const safePayload = payload && typeof payload === "object" ? payload : {};
  const summary =
    ("summary" in safePayload && typeof safePayload.summary === "string" && safePayload.summary.trim()) ||
    fallbackSummary ||
    "Analysis completed successfully. Detailed dashboard fields are still limited in the current backend response.";
  const recommendations =
    ("recommendations" in safePayload && normalizeStringArray(safePayload.recommendations)) ||
    fallbackRecommendations ||
    [];

  const chartsPayload =
    "charts" in safePayload && safePayload.charts && typeof safePayload.charts === "object"
      ? safePayload.charts
      : {};

  const barChartData =
    "barChartData" in chartsPayload ? normalizeChartData(chartsPayload.barChartData) : [];
  const lineChartData =
    "lineChartData" in chartsPayload ? normalizeChartData(chartsPayload.lineChartData) : [];
  const pieChartData =
    "pieChartData" in chartsPayload ? normalizeChartData(chartsPayload.pieChartData) : [];

  const insights: string[] = [
    summary,
    recommendations[0] ?? "",
    recommendations[1] ?? "",
  ].filter((item) => item.trim().length > 0);

  return {
    reportId,
    title: `Analysis Report ${reportId}`,
    analyzedAt:
      "analyzed_at" in safePayload && typeof safePayload.analyzed_at === "string"
        ? safePayload.analyzed_at
        : undefined,
    summary,
    recommendations,
    metrics: [
      {
        label: "Summary Length",
        value: `${summary.split(/\s+/).filter(Boolean).length} words`,
        helper: "Generated summary output",
      },
      {
        label: "Recommendations",
        value: `${recommendations.length}`,
        helper: "Action items returned",
      },
      {
        label: "Bar Series",
        value: `${barChartData.length}`,
        helper: "Categorical chart points",
      },
      {
        label: "Line Series",
        value: `${lineChartData.length}`,
        helper: "Timeline chart points",
      },
    ],
    insights: insights.map((item, index) => ({
      id: `insight-${index + 1}`,
      title:
        index === 0
          ? "Summary"
          : index === 1
          ? "Recommendation Priority"
          : "Additional Guidance",
      description: item,
    })),
    charts: {
      barChartData,
      lineChartData,
      pieChartData,
    },
  };
}
