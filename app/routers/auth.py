from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from .. import models, schemas, database, security
from ..security import get_current_user

router = APIRouter(prefix="/auth", tags=["Phase 2: Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # 1. Check if user exists
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash and Create
    hashed_pw = security.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,  # ✅ Corrected: matches models.py
        email=user.email, 
        hashed_password=hashed_pw, 
        role=user.role,   
        shift=user.shift
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 3. Use email to find the user
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    # 4. Generate Token
    access_token = security.create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role, 
        "username": user.username  # ✅ Fixed: Changed 'user.name' to 'user.username'
    }
@router.get("/users", response_model=list[schemas.UserResponse])
def get_all_users(db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}    