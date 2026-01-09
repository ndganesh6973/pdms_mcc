import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load the .env file from the backend folder
load_dotenv()

# 1. Setup Router
router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)

class AIQuery(BaseModel):
    question: str

# 2. Configure Groq via Environment Variable
API_KEY = os.getenv("GROQ_API_KEY")

# Initialize the client only if the key exists
client = None
if API_KEY:
    try:
        client = Groq(api_key=API_KEY)
    except Exception as e:
        print(f"Groq Config Error: {e}")
else:
    print("⚠️ WARNING: GROQ_API_KEY not found in .env file")

@router.post("/ask")
def ask_ai(query: AIQuery):
    # Check if client or key is missing
    if not client:
        return {"answer": "Error: Groq API Key is missing or invalid in your .env file."}

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
            model="llama-3.3-70b-versatile",
        )

        # 4. Get Answer
        return {"answer": chat_completion.choices[0].message.content}

    except Exception as e:
        print(f"REAL ERROR: {e}")
        return {"answer": f"TECHNICAL ERROR: {str(e)}"}