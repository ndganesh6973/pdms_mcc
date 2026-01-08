import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

# 1. Setup Router
router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)

class AIQuery(BaseModel):
    question: str

# 2. Configure Groq
# ⚠️ PASTE YOUR KEY INSIDE THE QUOTES BELOW (starts with gsk_)
API_KEY = "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"

# Initialize the client
try:
    client = Groq(api_key=API_KEY)
except Exception as e:
    print(f"Groq Config Error: {e}")
    client = None

@router.post("/ask")
def ask_ai(query: AIQuery):
    # Check if key is missing
    if not client or "paste_key" in API_KEY:
        return {"answer": "Error: Missing Groq API Key in backend/app/routers/ai.py"}

    try:
        # 3. Send request to Groq (Using Llama 3 model)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant for a Plant Data Management System (PDMS). Answer questions briefly and professionally."
                },
                {
                    "role": "user",
                    "content": query.question
                }
            ],
            model="llama-3.3-70b-versatile", # Free, fast, and smart
        )

        # 4. Get Answer
        return {"answer": chat_completion.choices[0].message.content}

    except Exception as e:
        # This will print the error to your Black Terminal
        print(f"REAL ERROR: {e}")
        # This will send the error to your Frontend so you can read it
        return {"answer": f"TECHNICAL ERROR: {str(e)}"}