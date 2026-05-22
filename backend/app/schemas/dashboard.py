from pydantic import BaseModel


class ChartPoint(BaseModel):
    name: str
    value: float


class InsightCard(BaseModel):
    id: str
    title: str
    description: str


class DashboardResponse(BaseModel):
    report_id: str
    filename: str
    row_count: int
    analyzed_at: str
    summary: str
    recommendations: list[str]
    insights: list[InsightCard]
    charts: dict[str, list[ChartPoint]]
