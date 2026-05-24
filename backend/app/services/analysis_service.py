from __future__ import annotations

from dataclasses import dataclass
from math import isnan
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
        duplicate_count = int(dataframe.duplicated().sum())

        return {
            "row_count": int(dataframe.shape[0]),
            "column_count": int(dataframe.shape[1]),
            "column_names": [str(column) for column in dataframe.columns.tolist()],
            "missing_values": missing_values,
            "duplicate_count": duplicate_count,
            "numeric_statistics": numeric_statistics,
            "numeric_highlights": self._build_numeric_highlights(dataframe),
            "categorical_highlights": self._build_categorical_highlights(dataframe),
            "trend_highlights": self._build_trend_highlights(dataframe),
        }

    def _format_summary_text(self, summary_payload: dict) -> str:
        return (
            f"Rows: {summary_payload['row_count']}\n"
            f"Columns: {summary_payload['column_count']}\n"
            f"Column Names: {', '.join(summary_payload['column_names'])}\n"
            f"Missing Values: {summary_payload['missing_values']}\n"
            f"Duplicate Rows: {summary_payload['duplicate_count']}\n"
            f"Numeric Statistics: {summary_payload['numeric_statistics']}\n"
            f"Numeric Highlights: {summary_payload['numeric_highlights']}\n"
            f"Categorical Highlights: {summary_payload['categorical_highlights']}\n"
            f"Trend Highlights: {summary_payload['trend_highlights']}"
        )

    def _generate_ai_output(self, summary_payload: dict, summary_text: str) -> tuple[str, list[str]]:
        try:
            insight = self._openai_service.generate_first_insight(summary_text)
            return insight.text, self._build_recommendations(summary_payload)
        except (AIConfigurationError, AIServiceError):
            return self._build_mock_output(summary_payload)

    def _build_mock_output(self, summary_payload: dict) -> tuple[str, list[str]]:
        summary_parts = [
            (
                f"The dataset contains {summary_payload['row_count']} rows across "
                f"{summary_payload['column_count']} columns."
            )
        ]

        trend_highlights = summary_payload["trend_highlights"]
        if trend_highlights:
            first_trend = trend_highlights[0]
            summary_parts.append(
                f"{first_trend['column']} trends {first_trend['direction']} from "
                f"{first_trend['start']} to {first_trend['end']} "
                f"({first_trend['change_percent']}% change)."
            )

        numeric_highlights = summary_payload["numeric_highlights"]
        if numeric_highlights:
            first_numeric = numeric_highlights[0]
            summary_parts.append(
                f"{first_numeric['column']} averages {first_numeric['mean']} with values between "
                f"{first_numeric['min']} and {first_numeric['max']}."
            )

        categorical_highlights = summary_payload["categorical_highlights"]
        if categorical_highlights:
            first_category = categorical_highlights[0]
            summary_parts.append(
                f"The leading category in {first_category['column']} is "
                f"{first_category['top_value']} ({first_category['top_count']} rows)."
            )

        summary = " ".join(summary_parts)
        return summary, self._build_recommendations(summary_payload)

    def _build_recommendations(self, summary_payload: dict) -> list[str]:
        recommendations = []
        trend_highlights = summary_payload["trend_highlights"]
        if trend_highlights:
            trend = trend_highlights[0]
            recommendations.append(
                f"Prioritize investigation of {trend['column']} because it moved "
                f"{trend['direction']} by {trend['change_percent']}% across the sampled records."
            )
        else:
            recommendations.append(
                "Focus review on the most important numeric and category columns shown in the report."
            )

        categorical_highlights = summary_payload["categorical_highlights"]
        if categorical_highlights:
            category = categorical_highlights[0]
            recommendations.append(
                f"Use {category['column']} segmentation to compare why "
                f"{category['top_value']} leads with {category['top_count']} rows."
            )
        elif summary_payload["numeric_highlights"]:
            first_numeric = summary_payload["numeric_highlights"][0]
            recommendations.append(
                f"Benchmark decisions against {first_numeric['column']}, which ranges from "
                f"{first_numeric['min']} to {first_numeric['max']}."
            )
        else:
            recommendations.append(
                "Add numeric measures or repeated categories if you want deeper business reporting."
            )

        missing_values = summary_payload["missing_values"]
        duplicate_count = summary_payload["duplicate_count"]
        if any(count > 0 for count in missing_values.values()):
            top_column = max(missing_values, key=missing_values.get)
            recommendations.append(
                f"Clean '{top_column}' before acting on the report because it has the most missing values."
            )
        elif duplicate_count > 0:
            recommendations.append(
                f"Remove or explain the {duplicate_count} duplicate rows so the report reflects true activity."
            )
        else:
            recommendations.append(
                "Data quality checks look stable, so the report can stay focused on business interpretation."
            )
        return recommendations

    def _build_numeric_highlights(self, dataframe: pd.DataFrame) -> list[dict[str, float | str]]:
        numeric_frame = dataframe.select_dtypes(include="number")
        highlights: list[dict[str, float | str]] = []
        for column in numeric_frame.columns[:3]:
            series = numeric_frame[column].dropna()
            if series.empty:
                continue

            highlights.append(
                {
                    "column": str(column),
                    "mean": round(float(series.mean()), 4),
                    "min": round(float(series.min()), 4),
                    "max": round(float(series.max()), 4),
                }
            )
        return highlights

    def _build_categorical_highlights(self, dataframe: pd.DataFrame) -> list[dict[str, int | str]]:
        categorical_frame = dataframe.select_dtypes(exclude="number")
        highlights: list[dict[str, int | str]] = []
        for column in categorical_frame.columns[:2]:
            series = categorical_frame[column].dropna().astype(str)
            if series.empty:
                continue

            counts = series.value_counts()
            top_value = str(counts.index[0])
            top_count = int(counts.iloc[0])
            highlights.append(
                {
                    "column": str(column),
                    "top_value": top_value,
                    "top_count": top_count,
                }
            )
        return highlights

    def _build_trend_highlights(self, dataframe: pd.DataFrame) -> list[dict[str, float | str]]:
        numeric_frame = dataframe.select_dtypes(include="number")
        highlights: list[dict[str, float | str]] = []
        for column in numeric_frame.columns[:2]:
            series = numeric_frame[column].dropna()
            if len(series) < 2:
                continue

            start = float(series.iloc[0])
            end = float(series.iloc[-1])
            change = end - start
            if start == 0:
                change_percent = 0.0 if end == 0 else 100.0
            else:
                change_percent = round((change / abs(start)) * 100, 2)

            direction = "flat"
            if change > 0:
                direction = "upward"
            elif change < 0:
                direction = "downward"

            highlights.append(
                {
                    "column": str(column),
                    "start": round(start, 4),
                    "end": round(end, 4),
                    "change_percent": 0.0 if isnan(change_percent) else change_percent,
                    "direction": direction,
                }
            )
        return highlights
