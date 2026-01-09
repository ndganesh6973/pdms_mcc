from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False) # e.g., "Reactor R-101"
    type = Column(String(255), nullable=False) # e.g., "Acid Hydrolysis Tank" 
    status = Column(String(255), default="Operational") 
    last_vibration_reading = Column(Float, default=0.0) # For ML Risk [cite: 73]
    last_temp_reading = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_history"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    maintenance_date = Column(DateTime, server_default=func.now())
    description = Column(String(255), nullable=False)
    failure_risk_score = Column(Float, default=0.0) # XGBoost Predicted [cite: 73]
    
    asset = relationship("Equipment")