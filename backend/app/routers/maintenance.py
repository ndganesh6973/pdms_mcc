from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.maintenance import Equipment
from pydantic import BaseModel

router = APIRouter(prefix="/maintenance", tags=["Predictive Maintenance"])

class EquipmentCreate(BaseModel):
    name: str
    type: str

@router.get("/assets")
def get_assets(db: Session = Depends(get_db)):
    return db.query(Equipment).all()

@router.post("/register")
def register_asset(data: EquipmentCreate, db: Session = Depends(get_db)):
    new_asset = Equipment(name=data.name, type=data.type)
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return {"message": "Equipment registered", "id": new_asset.id}

@router.get(
    "/risk-report",
    operation_id="get_maintenance_risk_report"
)
def get_maintenance_risk_report(db: Session = Depends(get_db)):
    assets = db.query(Equipment).all()
    results = []

    for asset in assets:
        # Safe defaults for new machines
        vibration = asset.last_vibration_reading or 0.1
        temperature = asset.last_temp_reading or 25

        risk = (vibration * 50) + (temperature * 0.2)

        results.append({
            "id": asset.id,
            "name": asset.name,
            "risk_score": min(round(risk, 1), 100),
            "status": "Critical" if risk > 75 else "Stable"
        })

    return results
