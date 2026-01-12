import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from app import database, models

# Load environment variables
load_dotenv()

router = APIRouter(
    prefix="/ai",
    tags=["GenAI Assistant"]
)

class AIQuery(BaseModel):
    question: str

# Configure Groq
API_KEY = os.getenv("GROQ_API_KEY")
client = None
if API_KEY:
    try:
        client = Groq(api_key=API_KEY)
    except Exception as e:
        print(f"Groq Config Error: {e}")
else:
    print("⚠️ WARNING: GROQ_API_KEY not found in .env file")

@router.post("/ask")
def ask_ai(query: AIQuery, db: Session = Depends(database.get_db)):
    if not client:
        raise HTTPException(status_code=500, detail="Groq API Key is missing or invalid.")

    try:
        # 1. FETCH PLANT CONTEXT (Make the AI smart about YOUR data)
        active_batches = db.query(models.production.ProductionBatch).filter(
            models.production.ProductionBatch.status == "ACTIVE"
        ).count()
        
        pending_qc = db.query(models.production.ProductionBatch).filter(
            models.production.ProductionBatch.status == "PENDING_QC"
        ).count()

        # 2. DEFINE SYSTEM PROMPT
        system_content = f"""
        You are the 'MCC Intelligent Assistant'. 
        You have access to the Plant Data Management System (PDMS).
        Current Plant Status:
        - Active Production Batches: {active_batches}
        - Batches Waiting for QC: {pending_qc}
        
        Technical Knowledge: 
        MCC manufacturing involves Pre-treatment, Acid Hydrolysis, Washing, Spray Drying, and Milling.
        Standard pH for hydrolysis is usually 1.5 - 2.5. 
        Answer professionally and prioritize plant safety and quality standards.
        """

        # 3. CALL GROQ (Llama 3.3)
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": query.question}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
        )

        return {"answer": chat_completion.choices[0].message.content}

    except Exception as e:
        print(f"AI Router Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))