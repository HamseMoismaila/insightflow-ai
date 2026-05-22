from fastapi import APIRouter, File, HTTPException, UploadFile, status

from backend.app.schemas.upload import UploadResponse
from backend.app.services.file_service import FileService, InvalidUploadError

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)) -> UploadResponse:
    service = FileService()
    try:
        upload = await service.save_upload(file)
    except InvalidUploadError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UploadResponse(
        upload_id=upload.upload_id,
        filename=upload.filename,
        status="success",
        message="Dataset uploaded successfully",
    )
