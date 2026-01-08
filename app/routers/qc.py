from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.production import ProductionBatch
from app.models.inventory import Inventory 
from pydantic import BaseModel

router = APIRouter(prefix="/qc", tags=["Quality Control"])

class QCApproval(BaseModel):
    moisture: float
    purity: float
    particle_size: float

@router.get("/pending-approval")
def get_pending_batches(db: Session = Depends(get_db)):
    """Fetches batches waiting for lab results"""
    return db.query(ProductionBatch).filter(ProductionBatch.status == "PENDING_QC").all()

@router.post("/approve-batch/{batch_id}")
def approve_batch(batch_id: int, results: QCApproval, db: Session = Depends(get_db)):
    """Gatekeeper: Creates Inventory ONLY after lab approval"""
    batch = db.query(ProductionBatch).filter(ProductionBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    try:
        # 1. Update Production status
        batch.status = "APPROVED"

        # 2. CREATE FINISHED GOOD IN WAREHOUSE
        finished_good = Inventory(
            batch_no=batch.batch_number,
            product_name="Microcrystalline Cellulose (MCC)",
            quantity_kg=batch.quantity_used,
            storage_location="Warehouse A",
            status="In Stock"
        )
        
        db.add(finished_good)
        db.commit()
        return {"message": "QC Approved. Batch moved to Finished Goods Inventory."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))