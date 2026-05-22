from pydantic import BaseModel


class AnalyzeResponse(BaseModel):
    report_id: str
    status: str
