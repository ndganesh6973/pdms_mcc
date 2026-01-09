from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Inventory(Base):
    __tablename__ = "Inventory"

    id = Column(Integer, primary_key=True, index=True)
    batch_no = Column(String(255), unique=True, nullable=False) # Traceability ID [cite: 77]
    product_name = Column(String(255), default="Microcrystalline Cellulose (MCC)")
    quantity_kg = Column(Float, nullable=False)
    storage_location = Column(String(255)) # Warehouse location [cite: 78]
    status = Column(String(255), default="In Stock") # tracking status [cite: 76]
    dispatched_at = Column(DateTime, nullable=True) # Dispatch monitoring 
    created_at = Column(DateTime, server_default=func.now()) # Auto-timestamp [cite: 47]