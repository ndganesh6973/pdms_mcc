from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class ProductionBatch(Base):
    __tablename__ = "production_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String(255), unique=True, nullable=False)
    phase = Column(String(255), nullable=False)
    material_used = Column(String(255), nullable=False)
    quantity_used = Column(Float, nullable=False)
    shift = Column(String(50), nullable=False) # Added for Shift Tracking
    status = Column(String(255), default="ACTIVE")
    authorized_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())