"""
ELIMFILTERS v4.0 - API REST
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from groq import Groq
import os
from datetime import datetime
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="ELIMFILTERS API v4.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tecnologías
TECHNOLOGIES = {
    "EA1": {"name": "MACROCORE™", "category": "Air (Engine)"},
    "EA2": {"name": "INTEKCORE™", "category": "Housings & Intakes"},
    "EF9": {"name": "SYNTEPORE™", "category": "Fuel"},
    "ES9": {"name": "AQUAGUARD™", "category": "Water Separator"},
    "EL8": {"name": "SINTRAX™", "category": "Oil"},
    "EH6": {"name": "NANOFORCE™", "category": "Hydraulic"},
    "ET9": {"name": "AQUAGUARD™", "category": "Turbines"},
    "EW7": {"name": "COOLTECH™", "category": "Coolant"},
    "EC1": {"name": "MICROKAPPA™", "category": "Cabin"},
    "ED4": {"name": "DRYCORE™", "category": "Air Dryer"},
    "EG3": {"name": "GASULTRA™", "category": "Gas"},
    "EK5": {"name": "DURATECH™", "category": "Kits HD"},
    "EK3": {"name": "DURATECH™", "category": "Kits LD"},
    "EM9": {"name": "MARINECLEAN™", "category": "Marine"}
}

HD_BRANDS = ["CAT", "CATERPILLAR", "CUMMINS", "DETROIT", "MACK", "VOLVO"]
LD_BRANDS = ["FORD", "CHEVY", "GMC", "DODGE", "RAM", "TOYOTA"]

# MongoDB
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["elimfilters_db"]
collection = db["master_unified_v5"]

# GROQ
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class SearchRequest(BaseModel):
    code: str

def detect_prefix(code: str):
    for prefix in TECHNOLOGIES.keys():
        if code.upper().startswith(prefix):
            return prefix
    return None

def classify_duty(code: str):
    upper = code.upper()
    if any(brand in upper for brand in HD_BRANDS):
        return "HD"
    if any(brand in upper for brand in LD_BRANDS):
        return "LD"
    return "Unknown"

@app.get("/")
async def root():
    return {
        "service": "ELIMFILTERS API v4.0",
        "status": "online",
        "endpoints": {
            "search": "/api/search",
            "technologies": "/api/technologies",
            "stats": "/api/stats"
        }
    }

@app.post("/api/search")
async def search_filter(request: SearchRequest):
    code = request.code.upper()
    
    # Buscar en MongoDB
    result = collection.find_one({"input_code": code})
    if result:
        result["_id"] = str(result["_id"])
        return {"found": True, "source": "database", "data": result}
    
    # Analizar nuevo
    prefix = detect_prefix(code)
    if not prefix:
        raise HTTPException(status_code=404, detail="Prefijo no reconocido")
    
    tech = TECHNOLOGIES[prefix]
    duty = classify_duty(code)
    
    record = {
        "input_code": code,
        "elimfilters_sku": f"{prefix}-PENDING",
        "prefix": prefix,
        "technology": tech["name"],
        "category": tech["category"],
        "duty": duty,
        "created_at": datetime.now().isoformat()
    }
    
    collection.insert_one(record)
    record["_id"] = str(record["_id"])
    
    return {"found": True, "source": "new", "data": record}

@app.get("/api/technologies")
async def get_technologies():
    return {"technologies": TECHNOLOGIES}

@app.get("/api/stats")
async def get_stats():
    total = collection.count_documents({})
    by_prefix = {}
    for prefix in TECHNOLOGIES.keys():
        count = collection.count_documents({"prefix": prefix})
        if count > 0:
            by_prefix[prefix] = count
    
    return {
        "total": total,
        "by_technology": by_prefix
    }

@app.get("/health")
async def health():
    try:
        client.admin.command("ping")
        return {"status": "healthy", "database": "connected"}
    except:
        return {"status": "unhealthy", "database": "disconnected"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
