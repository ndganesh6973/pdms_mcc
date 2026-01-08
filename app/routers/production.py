from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.production import ProductionBatch
from app.models.materials import RawMaterialBatch 
from pydantic import BaseModel

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
    """Fetches batches currently on the production floor"""
    return db.query(ProductionBatch).filter(ProductionBatch.status == "ACTIVE").all()

@router.post("/start-batch")
def start_batch(data: ProductionStart, db: Session = Depends(get_db)):
    """Deducts raw material and starts a new production batch"""
    if db.query(ProductionBatch).filter(ProductionBatch.batch_number == data.batch_number, ProductionBatch.status == "ACTIVE").first():
        raise HTTPException(status_code=400, detail="Batch number already active.")

    material = db.query(RawMaterialBatch).filter(RawMaterialBatch.material_name == data.raw_material_name).first()
    if not material or material.quantity_kg < data.quantity_to_use:
        raise HTTPException(status_code=400, detail="Insufficient material stock.")

    material.quantity_kg -= data.quantity_to_use 
    new_batch = ProductionBatch(
        batch_number=data.batch_number,
        phase=data.phase,
        material_used=data.raw_material_name,
        quantity_used=data.quantity_to_use,
        shift=data.shift,
        status="ACTIVE",
        authorized_by=data.authorized_by
    )
    db.add(new_batch)
    db.commit()
    return {"message": "Production started successfully"}

@router.post("/complete-batch/{batch_id}")
def complete_batch(batch_id: int, db: Session = Depends(get_db)):
    """
    Stops production and moves the batch to the QC Lab Queue.
    Inventory is NOT created here.
    """
    batch = db.query(ProductionBatch).filter(ProductionBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    try:
        # Move to QC Queue
        batch.status = "PENDING_QC" 
        db.commit()
        return {"message": f"Batch {batch.batch_number} moved to QC Lab for testing."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))