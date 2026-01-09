from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class QCRecord(Base):
    __tablename__ = "qc_records"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(255), nullable=False)
    moisture = Column(Float, nullable=False)
    purity = Column(Float, nullable=False)
    status = Column(String(255), nullable=False) # PASS or FAIL
    created_at = Column(DateTime, server_default=func.now())