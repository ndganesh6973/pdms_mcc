from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, database

router = APIRouter(tags=["Intelligence & Analytics"])

@router.post("/ml/predict-quality", response_model=schemas.MLPredictionOutput)
def predict_quality(data: schemas.MLPredictionInput):
    """
    Simulated XGBoost engine for MCC quality prediction.
    """
    # Logic: FAIL if parameters deviate from MCC optimal ranges
    if data.acid_ph < 3.5 or data.milling_speed > 1800:
        return {
            "quality_score": 74.2, 
            "status": "FAIL", 
            "recommendation": "Warning: High milling speed or low pH detected."
        }
    
    return {
        "quality_score": 98.1, 
        "status": "PASS", 
        "recommendation": "Parameters are optimal for MCC production."
    }

@router.get("/notifications/{user_id}", response_model=List[schemas.NotificationOut])
def get_notifications(user_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Notification).filter(
        models.Notification.user_id == user_id, 
        models.Notification.is_read == False
    ).all()