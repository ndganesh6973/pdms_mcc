from sqlalchemy import Column, Integer, String
from app.database import Base

class DashboardMetrics(Base):
    __tablename__ = "dashboard_metrics"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, index=True)
    value = Column(Integer, default=0)
