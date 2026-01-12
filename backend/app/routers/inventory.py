from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inventory import Inventory
from datetime import datetime

# ✅ FIXED IMPORT: Matches the log_activity name in utils.py
from .utils import log_activity 

router = APIRouter(prefix="/inventory", tags=["Inventory & Logistics"])

@router.get("/finished-goods")
def get_inventory(db: Session = Depends(get_db)):
    """Returns all items currently in the building (In Stock or Staging)"""
    return db.query(Inventory).filter(Inventory.status != "Dispatched").all()

@router.get("/summary")
def get_inventory_summary(db: Session = Depends(get_db)):
    """Only counts items actually sitting on the warehouse shelves"""
    items = db.query(Inventory).filter(Inventory.status == "In Stock").all()
    total_weight = sum(item.quantity_kg for item in items)
    return {"total_kg": total_weight, "batch_count": len(items)}

@router.post("/move-to-dispatch/{batch_no}")
def move_to_dispatch(batch_no: str, db: Session = Depends(get_db)):
    """Step 1: Move from Warehouse Racks to the Dispatch Area"""
    item = db.query(Inventory).filter(Inventory.batch_no == batch_no).first()
    if not item:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    item.status = "In Dispatch Area" 
    
    # ✅ REAL LOG: Tracking Internal Movement
    log_activity(db, f"LOGISTICS: Batch {batch_no} moved to Dispatch Area", "Logistics_Staff", "info")
    
    db.commit()
    return {"message": f"Batch {batch_no} moved to Dispatch Area for staging"}

@router.post("/final-dispatch/{batch_no}")
def final_dispatch(batch_no: str, db: Session = Depends(get_db)):
    """Step 2: Official shipment and timestamping"""
    item = db.query(Inventory).filter(Inventory.batch_no == batch_no).first()
    if not item:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    item.status = "Dispatched"
    item.dispatched_at = datetime.now() 
    
    # ✅ REAL LOG: Final Step of A to Z (Dispatch)
    log_activity(db, f"DISPATCHED: Batch {batch_no} shipped to customer", "Dispatch_Head", "success")
    
    db.commit()
    return {"message": f"Batch {batch_no} successfully sent to customer"}

@router.get("/dispatch-history")
def get_dispatch_history(db: Session = Depends(get_db)):
    """Fetches all batches that have been officially shipped"""
    return db.query(Inventory).filter(Inventory.status == "Dispatched").order_by(Inventory.dispatched_at.desc()).all()