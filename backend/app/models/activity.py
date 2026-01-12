# app/models/activity.py
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from datetime import datetime

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(500))  # e.g., "User GANESH logged in"
    user = Column(String(255))     # The person who did it
    type = Column(String(50))      # info, success, warning, danger
    created_at = Column(DateTime, default=datetime.now)