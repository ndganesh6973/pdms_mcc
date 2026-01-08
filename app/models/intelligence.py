from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class SeverityLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("production_batches.id"))
    description = Column(String(255)) 
    severity = Column(Enum(SeverityLevel), default=SeverityLevel.MEDIUM)
    detected_at = Column(DateTime, default=datetime.utcnow)
    
    batch = relationship("ProductionBatch")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) 
    message = Column(String(255))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)