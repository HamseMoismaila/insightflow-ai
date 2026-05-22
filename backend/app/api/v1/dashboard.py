from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.dashboard import DashboardResponse
from backend.app.services.dashboard_service import DashboardService, ReportNotFoundError

router = APIRouter()


@router.get("/dashboard/{report_id}", response_model=DashboardResponse)
def get_dashboard(report_id: str) -> DashboardResponse:
    service = DashboardService()
    try:
        return service.get_report(report_id)
    except ReportNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
