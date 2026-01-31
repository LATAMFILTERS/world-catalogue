from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import os

app = FastAPI()

# MongoDB
mongo = MongoClient(os.getenv("MONGODB_URI"))
db = mongo["elimfilters"]
col_unified = db["MASTER_UNIFIED_V5"]

class SearchRequest(BaseModel):
    code: str
    searchType: str = "part"

@app.get("/")
async def root():
    return {
        "service": "ELIMFILTERS API v5.0 CLEAN",
        "status": "online",
        "collections": {
            "unified": col_unified.count_documents({}),
        }
    }

@app.post("/api/search")
async def search_filter(request: SearchRequest):
    code = request.code.upper().strip()
    
    # Buscar en MASTER_UNIFIED_V5
    result = col_unified.find_one({
        "$or": [
            {"PART_NUMBER": code},
            {"OEM_NUMBERS": code},
        ]
    })
    
    if not result:
        raise HTTPException(404, f"Código {code} no encontrado en MASTER_UNIFIED_V5")
    
    result["_id"] = str(result["_id"])
    return {"success": True, "data": result}

@app.get("/health")
async def health():
    try:
        mongo.admin.command("ping")
        return {"status": "healthy", "unified_count": col_unified.count_documents({})}
    except:
        return {"status": "unhealthy"}
