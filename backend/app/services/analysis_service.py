from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

import pandas as pd

from backend.app.services.dashboard_service import DashboardService
from backend.app.services.file_service import FileService, StoredUpload
from backend.app.services.openai_service import AIConfigurationError, AIServiceError, OpenAIInsightService


class AnalysisError(RuntimeError):
    """Raised when dataset analysis fails."""


@dataclass(frozen=True)
class AnalysisResult:
    report_id: str
    status: str


class AnalysisService:
    def __init__(
        self,
        file_service: FileService | None = None,
        dashboard_service: DashboardService | None = None,
        openai_service: OpenAIInsightService | None = None,
    ) -> None:
        self._file_service = file_service or FileService()
        self._dashboard_service = dashboard_service or DashboardService()
        self._openai_service = openai_service or OpenAIInsightService()

    def analyze_upload(self, upload_id: str) -> AnalysisResult:
        upload = self._file_service.get_upload(upload_id)
        dataframe = self._load_dataset(upload)
        summary_payload = self._build_summary_payload(dataframe)
        summary_text = self._format_summary_text(summary_payload)
        summary, recommendations = self._generate_ai_output(summary_payload, summary_text)
        report_id = f"rep_{uuid4().hex[:12]}"
        report = self._dashboard_service.create_report_payload(
            report_id=report_id,
            upload=upload,
            dataframe=dataframe,
            summary=summary,
            recommendations=recommendations,
            summary_payload=summary_payload,
        )
        self._dashboard_service.save_report(report)
        return AnalysisResult(report_id=report_id, status="success")

    def _load_dataset(self, upload: StoredUpload) -> pd.DataFrame:
        file_path = self._file_service.get_upload_file_path(upload)
        extension = file_path.suffix.lower()
        try:
            if extension == ".csv":
                return pd.read_csv(file_path)
            if extension == ".xlsx":
                return pd.read_excel(file_path, engine="openpyxl")
        except Exception as exc:
            raise AnalysisError("Dataset could not be read") from exc

        raise AnalysisError("Unsupported dataset type")

    def _build_summary_payload(self, dataframe: pd.DataFrame) -> dict:
        numeric_frame = dataframe.select_dtypes(include="number")
        if not numeric_frame.empty:
            numeric_statistics = {
                column: {stat: round(float(value), 4) for stat, value in stats.items()}
                for column, stats in numeric_frame.describe().to_dict().items()
            }
        else:
            numeric_statistics = {}

        missing_values = {
            str(column): int(count) for column, count in dataframe.isna().sum().to_dict().items()
        }

        return {
            "row_count": int(dataframe.shape[0]),
            "column_count": int(dataframe.shape[1]),
            "column_names": [str(column) for column in dataframe.columns.tolist()],
            "missing_values": missing_values,
            "numeric_statistics": numeric_statistics,
        }

    def _format_summary_text(self, summary_payload: dict) -> str:
        return (
            f"Rows: {summary_payload['row_count']}\n"
            f"Columns: {summary_payload['column_count']}\n"
            f"Column Names: {', '.join(summary_payload['column_names'])}\n"
            f"Missing Values: {summary_payload['missing_values']}\n"
            f"Numeric Statistics: {summary_payload['numeric_statistics']}"
        )

    def _generate_ai_output(self, summary_payload: dict, summary_text: str) -> tuple[str, list[str]]:
        try:
            insight = self._openai_service.generate_first_insight(summary_text)
            return insight.text, self._build_recommendations(summary_payload)
        except (AIConfigurationError, AIServiceError):
            return self._build_mock_output(summary_payload)

    def _build_mock_output(self, summary_payload: dict) -> tuple[str, list[str]]:
        summary = (
            f"The dataset contains {summary_payload['row_count']} rows across "
            f"{summary_payload['column_count']} columns. "
            f"Columns available: {', '.join(summary_payload['column_names'])}."
        )
        return summary, self._build_recommendations(summary_payload)

    def _build_recommendations(self, summary_payload: dict) -> list[str]:
        recommendations = []
        missing_values = summary_payload["missing_values"]
        if any(count > 0 for count in missing_values.values()):
            top_column = max(missing_values, key=missing_values.get)
            recommendations.append(
                f"Review missing values in '{top_column}' before relying on downstream analysis."
            )
        else:
            recommendations.append("Data quality is strong enough to proceed with downstream reporting.")

        if summary_payload["numeric_statistics"]:
            first_numeric = next(iter(summary_payload["numeric_statistics"]))
            recommendations.append(
                f"Investigate the distribution of '{first_numeric}' to understand major performance shifts."
            )
        else:
            recommendations.append("Add more numeric columns if you want richer statistical trend analysis.")

        recommendations.append(
            "Use the uploaded dataset summary to validate business context before acting on AI output."
        )
        return recommendations
