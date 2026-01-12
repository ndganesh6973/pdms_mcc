from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.production import ProductionBatch
from app.models.inventory import Inventory 
from pydantic import BaseModel
# ✅ Fixed Import
from .utils import log_activity 

router = APIRouter(prefix="/qc", tags=["Quality Control"])

class QCApproval(BaseModel):
    moisture: float
    purity: float
    particle_size: float

@router.get("/pending-approval")
def get_pending_batches(db: Session = Depends(get_db)):
    return db.query(ProductionBatch).filter(ProductionBatch.status == "PENDING_QC").all()

@router.post("/approve-batch/{batch_id}")
def approve_batch(batch_id: int, results: QCApproval, db: Session = Depends(get_db)):
    batch = db.query(ProductionBatch).filter(ProductionBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    try:
        batch.status = "APPROVED"
        # Move to Finished Goods Inventory
        finished_good = Inventory(
            batch_no=batch.batch_number,
            product_name="Microcrystalline Cellulose (MCC)",
            quantity_kg=batch.quantity_used,
            storage_location="Warehouse A",
            status="In Stock"
        )
        db.add(finished_good)
        
        # ✅ REAL LOG: Tracking Lab Approval
        log_activity(
            db, 
            message=f"QC APPROVED: Batch {batch.batch_number} passed with {results.purity}% purity", 
            user="QC_Analyst", 
            log_type="success"
        )
        
        db.commit()
        return {"message": "Approved"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))