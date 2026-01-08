from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.materials import RawMaterialBatch

router = APIRouter(prefix="/materials", tags=["Material Master"])

class MaterialEntry(BaseModel):
    material_id: str
    name: str
    kg: float
    supplier: str

@router.get("/search")
def search_materials(query: str = "", db: Session = Depends(get_db)):
    """Search by ID or Name. Returns all if query is empty."""
    # Fix: Ensure empty search returns all data
    if not query.strip():
        return db.query(RawMaterialBatch).all()
        
    return db.query(RawMaterialBatch).filter(
        (RawMaterialBatch.material_name.ilike(f"%{query}%")) | 
        (RawMaterialBatch.material_id.ilike(f"%{query}%"))
    ).all()

@router.post("/add")
def add_material(data: MaterialEntry, db: Session = Depends(get_db)):
    """Adds new or updates existing stock."""
    item = db.query(RawMaterialBatch).filter(RawMaterialBatch.material_id == data.material_id).first()
    if item:
        item.quantity_kg += data.kg
    else:
        db.add(RawMaterialBatch(
            material_id=data.material_id,
            material_name=data.name,
            quantity_kg=data.kg,
            supplier_name=data.supplier
        ))
    db.commit()
    return {"message": "Material Processed"}

@router.post("/import-bulk")
def import_bulk(data: List[MaterialEntry], db: Session = Depends(get_db)):
    """Fixed: Iterates through the entire list to add all data."""
    try:
        for entry in data:
            item = db.query(RawMaterialBatch).filter(RawMaterialBatch.material_id == entry.material_id).first()
            if item:
                item.quantity_kg += entry.kg
            else:
                db.add(RawMaterialBatch(
                    material_id=entry.material_id,
                    material_name=entry.name,
                    quantity_kg=entry.kg,
                    supplier_name=entry.supplier
                ))
        db.commit()
        return {"message": f"Successfully imported {len(data)} items"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{m_id}")
def update_material(m_id: str, data: MaterialEntry, db: Session = Depends(get_db)):
    item = db.query(RawMaterialBatch).filter(RawMaterialBatch.material_id == m_id).first()
    if not item: 
        raise HTTPException(status_code=404, detail="Material not found")
    item.material_name = data.name
    item.quantity_kg = data.kg
    item.supplier_name = data.supplier
    db.commit()
    return {"message": "Update Successful"}

@router.delete("/delete/{m_id}")
def delete_material(m_id: str, db: Session = Depends(get_db)):
    item = db.query(RawMaterialBatch).filter(RawMaterialBatch.material_id == m_id).first()
    if not item: 
        raise HTTPException(status_code=404, detail="Material not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}