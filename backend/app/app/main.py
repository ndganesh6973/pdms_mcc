from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Import all models to ensure they are registered with Base
from app.models import production, qc, inventory, materials, users, maintenance


# Import routers 
from app.routers import (
    auth, materials, production, qc, 
    inventory, dashboard, ml, maintenance, ai
)

app = FastAPI(title="MCC Plant PDMS")

# Standard CORS configuration for React (Port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Table creation on startup
@app.on_event("startup")
def on_startup():
    # This creates the MySQL tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("🚀 MySQL Database Connected and Tables Synchronized")

# Include Routers
app.include_router(auth.router)
app.include_router(materials.router)
app.include_router(production.router)
app.include_router(qc.router)
app.include_router(inventory.router)
app.include_router(dashboard.router)
app.include_router(ml.router)
app.include_router(maintenance.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "status": "online", 
        "database": "MYSQL",
        "system": "MCC Plant PDMS"
    }