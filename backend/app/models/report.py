import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("uploads.id"), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    recommendations: Mapped[list[str] | dict[str, Any]] = mapped_column(JSONB, nullable=False)
    charts: Mapped[dict[str, Any] | list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    upload = relationship("Upload", back_populates="reports")
    analytics_history = relationship("AnalyticsHistory", back_populates="report")
