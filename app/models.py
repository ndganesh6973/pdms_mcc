# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import datetime

# Enums for fixed choices [cite: 162]
class ShiftType(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"

class RoleType(str, enum.Enum):
    ADMIN = "Admin"
    MANAGER = "Plant Manager"
    OPERATOR = "Operator"
    QA = "QC Analyst"

# --- PHASE 2 MODELS ---
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleType), nullable=False)
    shift = Column(Enum(ShiftType), nullable=True) # Admin might not have a shift
    is_active = Column(Boolean, default=True)

# --- PHASE 3 MODELS ---
class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    contact_email = Column(String)
    
    materials = relationship("RawMaterialBatch", back_populates="vendor")

class RawMaterialBatch(Base):
    __tablename__ = "raw_material_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String, unique=True, index=True) # e.g., RM-2023-001
    material_name = Column(String, nullable=False) # e.g., Cellulose Pulp
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    quantity_kg = Column(Integer, nullable=False)
    received_date = Column(DateTime, default=datetime.utcnow)
    qc_status = Column(String, default="PENDING") # PENDING, PASSED, FAILED [cite: 170]
    
    vendor = relationship("Vendor", back_populates="materials")