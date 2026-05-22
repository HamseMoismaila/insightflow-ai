from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.analysis import AnalyzeResponse
from backend.app.services.analysis_service import AnalysisError, AnalysisService
from backend.app.services.file_service import UploadNotFoundError

router = APIRouter()


@router.post("/analyze/{upload_id}", response_model=AnalyzeResponse)
def analyze_dataset(upload_id: str) -> AnalyzeResponse:
    service = AnalysisService()
    try:
        result = service.analyze_upload(upload_id)
    except UploadNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except AnalysisError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return AnalyzeResponse(report_id=result.report_id, status=result.status)
