from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.production import ProductionBatch
from app.models.materials import RawMaterialBatch 
from pydantic import BaseModel
from datetime import datetime

# ✅ FIXED IMPORT: Using relative import to find utils.py in the same folder
from .utils import log_activity 

router = APIRouter(prefix="/production", tags=["Production Management"])

class ProductionStart(BaseModel):
    batch_number: str
    phase: str
    raw_material_name: str
    quantity_to_use: float
    authorized_by: str
    shift: str

@router.get("/active-batches")
def get_active_batches(db: Session = Depends(get_db)):
    return db.query(ProductionBatch).filter(ProductionBatch.status == "ACTIVE").all()

@router.post("/start-batch")
def start_batch(data: ProductionStart, db: Session = Depends(get_db)):
    if db.query(ProductionBatch).filter(ProductionBatch.batch_number == data.batch_number, ProductionBatch.status == "ACTIVE").first():
        raise HTTPException(status_code=400, detail="Batch already active.")

    material = db.query(RawMaterialBatch).filter(RawMaterialBatch.material_name == data.raw_material_name).first()
    if not material or material.quantity_kg < data.quantity_to_use:
        raise HTTPException(status_code=400, detail="Insufficient stock.")

    material.quantity_kg -= data.quantity_to_use 
    new_batch = ProductionBatch(
        batch_number=data.batch_number,
        phase=data.phase,
        material_used=data.raw_material_name,
        quantity_used=data.quantity_to_use,
        shift=data.shift,
        status="ACTIVE",
        authorized_by=data.authorized_by,
        created_at=datetime.now()
    )
    db.add(new_batch)
    
    # ✅ REAL LOG: Tracking Start Activity
    log_activity(db, f"Production Started: Batch {data.batch_number} ({data.phase})", data.authorized_by, "info")
    
    db.commit()
    return {"message": "Started"}

@router.post("/end-batch/{batch_id}")
def end_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(ProductionBatch).filter(ProductionBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Not found")
    
    batch.status = "PENDING_QC" 
    
    # ✅ REAL LOG: Tracking Phase Completion
    log_activity(db, f"Batch {batch.batch_number} completed production and moved to QC", batch.authorized_by, "success")
    
    db.commit()
    return {"message": "Moved to QC Lab"}