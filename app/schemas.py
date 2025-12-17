# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from .models import RoleType, ShiftType

# --- User Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleType
    shift: Optional[ShiftType] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Vendor/Material Schemas ---
class VendorCreate(BaseModel):
    name: str
    contact_email: Optional[EmailStr] = None

class MaterialBatchCreate(BaseModel):
    batch_code: str
    material_name: str
    vendor_id: int
    quantity_kg: float
