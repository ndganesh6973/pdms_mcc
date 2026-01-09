from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class RawMaterialBatch(Base):
    __tablename__ = "raw_material_batches"
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(String(50), unique=True, index=True)
    material_name = Column(String(255), unique=True, nullable=False)
    quantity_kg = Column(Float, default=0.0)
    supplier_name = Column(String(255), nullable=True) 
    received_date = Column(DateTime, server_default=func.now())
    # Specs for ML analysis as per documentation
    purity_spec = Column(Float, nullable=True) 
    moisture_spec = Column(Float, nullable=True)

class MaterialHistory(Base):
    __tablename__ = "material_history"
    id = Column(Integer, primary_key=True, index=True)
    material_name = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    action = Column(String(50), nullable=False) # 'RECEIVE' or 'ISSUE'
    timestamp = Column(DateTime, server_default=func.now())