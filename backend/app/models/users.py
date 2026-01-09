from sqlalchemy import Column, Integer, String, Enum, Boolean
from app.database import Base
import enum


class RoleType(str, enum.Enum):
    ADMIN = "Admin"
    MANAGER = "Plant Manager"
    SUPERVISOR = "Supervisor"
    QC_INCHARGE = "QC Incharge"
    QC_ANALYST = "QC Analyst"
    OPERATOR = "Operator"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))

    role = Column(
        Enum(RoleType, values_callable=lambda x: [e.value for e in x])
    )

    shift = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
