# app/routers/utils.py
from sqlalchemy.orm import Session
from .. import models 
from datetime import datetime

def log_activity(db: Session, message: str, user: str, log_type: str = "info"):
    new_log = models.ActivityLog(
        message=message,
        user=user,
        type=log_type,
        created_at=datetime.now()
    )
    db.add(new_log)
    db.commit()