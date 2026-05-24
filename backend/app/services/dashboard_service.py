from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pandas as pd

from backend.app.core.config import Settings, get_settings
from backend.app.schemas.dashboard import DashboardResponse
from backend.app.services.file_service import StoredUpload


class ReportNotFoundError(FileNotFoundError):
    """Raised when a stored dashboard report does not exist."""


class DashboardService:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._settings.report_storage_path.mkdir(parents=True, exist_ok=True)

    def create_report_payload(
        self,
        *,
        report_id: str,
        upload: StoredUpload,
        dataframe: pd.DataFrame,
        summary: str,
        recommendations: list[str],
        summary_payload: dict[str, Any],
    ) -> DashboardResponse:
        return DashboardResponse(
            report_id=report_id,
            filename=upload.filename,
            row_count=int(summary_payload["row_count"]),
            analyzed_at=datetime.now(UTC).isoformat(),
            summary=summary,
            recommendations=recommendations,
            insights=self._build_insight_cards(summary_payload, recommendations),
            charts=self._build_charts(dataframe),
        )

    def save_report(self, report: DashboardResponse) -> None:
        self._report_path(report.report_id).write_text(
            report.model_dump_json(indent=2), encoding="utf-8"
        )

    def get_report(self, report_id: str) -> DashboardResponse:
        report_path = self._report_path(report_id)
        if not report_path.exists():
            raise ReportNotFoundError(f"Report '{report_id}' was not found")
        return DashboardResponse.model_validate_json(report_path.read_text(encoding="utf-8"))

    def _report_path(self, report_id: str) -> Path:
        return self._settings.report_storage_path / f"{report_id}.json"

    def _build_insight_cards(
        self, summary_payload: dict[str, Any], recommendations: list[str]
    ) -> list[dict[str, str]]:
        trend_highlights = summary_payload["trend_highlights"]
        numeric_highlights = summary_payload["numeric_highlights"]
        categorical_highlights = summary_payload["categorical_highlights"]
        missing_values = summary_payload["missing_values"]
        duplicate_count = summary_payload["duplicate_count"]

        if trend_highlights:
            trend = trend_highlights[0]
            performance_message = (
                f"{trend['column']} moved {trend['direction']} from {trend['start']} "
                f"to {trend['end']} ({trend['change_percent']}%)."
            )
        elif numeric_highlights:
            metric = numeric_highlights[0]
            performance_message = (
                f"{metric['column']} averages {metric['mean']} with a range of "
                f"{metric['min']} to {metric['max']}."
            )
        else:
            performance_message = "The report is based mainly on categorical structure because numeric trends are limited."

        if categorical_highlights:
            category = categorical_highlights[0]
            composition_message = (
                f"{category['top_value']} is the most common value in {category['column']} "
                f"with {category['top_count']} rows."
            )
        else:
            composition_message = "No dominant category was detected, so the report leans on numeric patterns."

        highest_missing_column = max(missing_values, key=missing_values.get) if missing_values else None
        if highest_missing_column and missing_values[highest_missing_column] > 0:
            quality_message = (
                f"{highest_missing_column} has the largest data gap with "
                f"{missing_values[highest_missing_column]} missing values."
            )
        elif duplicate_count > 0:
            quality_message = f"The dataset includes {duplicate_count} duplicate rows that may affect totals."
        else:
            quality_message = "No major missing-value or duplicate issues were detected in the sampled report."

        return [
            {
                "id": "insight-summary",
                "title": "Dataset scope",
                "description": (
                    f"The uploaded dataset contains {summary_payload['row_count']} rows and "
                    f"{summary_payload['column_count']} columns."
                ),
            },
            {
                "id": "insight-performance",
                "title": "Performance signal",
                "description": performance_message,
            },
            {
                "id": "insight-composition",
                "title": "Category signal",
                "description": composition_message,
            },
            {
                "id": "insight-quality",
                "title": "Data quality note",
                "description": quality_message,
            },
            {
                "id": "insight-action",
                "title": "Recommended action",
                "description": recommendations[0] if recommendations else "No recommendation available.",
            },
        ]

    def _build_charts(self, dataframe: pd.DataFrame) -> dict[str, list[dict[str, float | str]]]:
        return {
            "barChartData": self._build_bar_chart(dataframe),
            "lineChartData": self._build_line_chart(dataframe),
            "pieChartData": self._build_pie_chart(dataframe),
        }

    def _build_bar_chart(self, dataframe: pd.DataFrame) -> list[dict[str, float | str]]:
        numeric_columns = dataframe.select_dtypes(include="number").columns.tolist()
        if numeric_columns:
            column = numeric_columns[0]
            values = dataframe[column].fillna(0).head(6).tolist()
            return [{"name": f"Row {index + 1}", "value": float(value)} for index, value in enumerate(values)]

        first_column = dataframe.columns[0]
        counts = dataframe[first_column].astype(str).value_counts().head(6)
        return [{"name": str(index), "value": float(value)} for index, value in counts.items()]

    def _build_line_chart(self, dataframe: pd.DataFrame) -> list[dict[str, float | str]]:
        numeric_columns = dataframe.select_dtypes(include="number").columns.tolist()
        if numeric_columns:
            column = numeric_columns[min(1, len(numeric_columns) - 1)]
            values = dataframe[column].fillna(0).head(8).tolist()
            return [{"name": f"Point {index + 1}", "value": float(value)} for index, value in enumerate(values)]

        return self._build_bar_chart(dataframe)

    def _build_pie_chart(self, dataframe: pd.DataFrame) -> list[dict[str, float | str]]:
        categorical_columns = dataframe.select_dtypes(exclude="number").columns.tolist()
        if categorical_columns:
            column = categorical_columns[0]
            counts = dataframe[column].astype(str).value_counts().head(5)
            return [{"name": str(index), "value": float(value)} for index, value in counts.items()]

        numeric_columns = dataframe.select_dtypes(include="number").columns.tolist()
        if numeric_columns:
            column = numeric_columns[0]
            series = dataframe[column].fillna(0)
            pie_points = [
                {"name": "Positive", "value": float((series > 0).sum())},
                {"name": "Zero", "value": float((series == 0).sum())},
                {"name": "Negative", "value": float((series < 0).sum())},
            ]
            return [point for point in pie_points if point["value"] > 0]

        return []
