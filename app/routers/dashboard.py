from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.production import ProductionBatch
from app.models.qc import QCRecord
from app.models.inventory import Inventory
from app import schemas, models
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    """Fetches KPI data for the main dashboard cards"""
    try:
        active_batches = db.query(ProductionBatch).filter(ProductionBatch.status == "ACTIVE").count()
        low_stock_count = db.query(Inventory).filter(Inventory.quantity_kg < 50).count()
        
        total_qc = db.query(QCRecord).count()
        passed_qc = db.query(QCRecord).filter(QCRecord.status == "PASS").count()
        health = float((passed_qc / total_qc) * 100) if total_qc > 0 else 100.0

        today = datetime.now().date()
        daily_output = db.query(func.sum(ProductionBatch.quantity_kg)).filter(
            func.date(ProductionBatch.created_at) == today
        ).scalar() or 0.0

        recent = db.query(ProductionBatch).order_by(ProductionBatch.created_at.desc()).limit(5).all()

        return {
            "active_batches": active_batches,
            "material_alerts": low_stock_count,
            "plant_health": health,
            "production_rate": float(daily_output),
            "status": "OPERATIONAL" if health > 80 else "NEEDS ATTENTION",
            "recent_batches": [{"batch_number": b.batch_number, "phase": b.status} for b in recent]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """FIXES THE 404 ERROR: Provides data for the chart"""
    seven_days_ago = datetime.now() - timedelta(days=7)
    trend_data = db.query(
        func.date(ProductionBatch.created_at).label('date'),
        func.sum(ProductionBatch.quantity_kg).label('total_kg')
    ).filter(ProductionBatch.created_at >= seven_days_ago)\
     .group_by(func.date(ProductionBatch.created_at)).all()

    # 'output' key must match your React dataKey="output"
    return [{"date": str(d.date), "output": float(d.total_kg or 0)} for d in trend_data]

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    """Fetches alerts for the notification bell"""
    # Fetching last 5 alerts from your notifications table
    # return db.query(models.Notification).order_by(models.Notification.created_at.desc()).limit(5).all()
    return [] # Placeholder until you populate the table