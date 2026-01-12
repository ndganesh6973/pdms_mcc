from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ==========================================
# --- AUTH SCHEMAS ---
# ==========================================

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "Operator"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    shift: Optional[str] = None  
    is_active: bool = True       
    created_at: Optional[datetime] = None 

    class Config:
        from_attributes = True
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# ==========================================
# --- INTELLIGENCE & ML SCHEMAS ---
# ==========================================

class MLPredictionInput(BaseModel):
    drying_time: float
    milling_speed: float
    acid_ph: float

    class Config:
        extra = "forbid"   # ✅ blocks old fields like "temperature"


class MLPredictionOutput(BaseModel):
    quality_score: float
    status: str
    recommendation: Optional[str] = "Proceed with Batch."


# ==========================================
# --- NOTIFICATION SCHEMAS ---
# ==========================================

class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    active_batches: int
    material_alerts: int
    plant_health: float
    production_rate: float 
    status: str
    recent_batches: List[dict]