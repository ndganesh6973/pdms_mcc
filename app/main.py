# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, database, auth
from fastapi.middleware.cors import CORSMiddleware

# Initialize App & Database
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="MCC Plant PDMS")
origins = [
    "http://localhost:3000", # React default port
    "http://127.0.0.1:3000",
    "http://localhost:5173", # Vite default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins (easiest for development)
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"], # Allows all headers
)

# --- AUTH ROUTES (PHASE 2) ---
@app.post("/auth/register", tags=["Auth"])
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_pw,
        role=user.role,
        shift=user.shift
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"User {new_user.name} created successfully"}

@app.post("/auth/login", response_model=schemas.Token, tags=["Auth"])
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# --- VENDOR ROUTES (PHASE 3) ---
@app.post("/vendors/", tags=["Raw Materials"])
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(database.get_db)):
    new_vendor = models.Vendor(name=vendor.name, contact_email=vendor.contact_email)
    db.add(new_vendor)
    db.commit()
    return {"message": "Vendor added"}

# --- MATERIAL INTAKE ROUTES (PHASE 3) ---
@app.post("/materials/intake", tags=["Raw Materials"])
def receive_material(batch: schemas.MaterialBatchCreate, db: Session = Depends(database.get_db)):
    # 1. Validate Vendor
    vendor = db.query(models.Vendor).filter(models.Vendor.id == batch.vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    # 2. Create Batch Entry (Default QC Status = PENDING) [cite: 169, 170]
    new_batch = models.RawMaterialBatch(
        batch_code=batch.batch_code,
        material_name=batch.material_name,
        vendor_id=batch.vendor_id,
        quantity_kg=batch.quantity_kg,
        qc_status="PENDING" 
    )
    db.add(new_batch)
    db.commit()
    return {"message": f"Batch {batch.batch_code} received. Status: PENDING QC"}