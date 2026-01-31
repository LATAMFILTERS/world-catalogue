import os
import re
import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from groq import Groq
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ELIMFILTERS API v4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URI = os.getenv("MONGODB_URI")
mongo = MongoClient(MONGODB_URI)
db = mongo["elimfilters_db"]
col_unified = db["master_unified_v5"]
col_catalogs = db["catalogs"]
col_kits = db["service_kits"]

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
GOOGLE_SERVICE_ACCOUNT_EMAIL = os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
GOOGLE_PRIVATE_KEY = os.getenv("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")

TECHNOLOGIES = {
    "EA1": {"name": "MACROCORE™",    "category": "Air (Engine)"},
    "EA2": {"name": "INTEKCORE™",    "category": "Housings & Intakes"},
    "EF9": {"name": "SYNTEPORE™",    "category": "Fuel"},
    "ES9": {"name": "AQUAGUARD™",    "category": "Water Separator"},
    "EL8": {"name": "SINTRAX™",      "category": "Oil (Lube)"},
    "EH6": {"name": "NANOFORCE™",    "category": "Hydraulic"},
    "ET9": {"name": "AQUAGUARD™",    "category": "Turbines"},
    "EW7": {"name": "COOLTECH™",     "category": "Coolant"},
    "EC1": {"name": "MICROKAPPA™",   "category": "Cabin Air"},
    "ED4": {"name": "DRYCORE™",      "category": "Air Dryer"},
    "ED3": {"name": "BLUECLEAN™",    "category": "DEF / AdBlue"},
    "EG3": {"name": "GASULTRA™",     "category": "Gas"},
    "EK5": {"name": "DURATECH™",     "category": "Kits HD"},
    "EK3": {"name": "DURATECH™",     "category": "Kits LD"},
    "EM9": {"name": "MARINECLEAN™",  "category": "Marine"},
}

FILTER_TYPE_TO_PREFIX = {
    "oil": "EL8", "lube": "EL8", "aceite": "EL8", "lubricante": "EL8", "oil (lube)": "EL8",
    "air": "EA1", "aire": "EA1", "engine air": "EA1", "air (engine)": "EA1",
    "fuel": "EF9", "combustible": "EF9",
    "water separator": "ES9", "separador de agua": "ES9", "fuel water": "ES9",
    "hydraulic": "EH6", "hidraulico": "EH6",
    "turbine": "ET9", "turbina": "ET9", "racor": "ET9", "turbines": "ET9",
    "coolant": "EW7", "refrigerante": "EW7",
    "cabin": "EC1", "cabin air": "EC1",
    "air dryer": "ED4", "secador": "ED4",
    "def": "ED3", "adblue": "ED3",
    "gas": "EG3", "lpg": "EG3",
    "marine": "EM9", "marino": "EM9",
}

class SearchRequest(BaseModel):
    code: str
    searchType: str = "part"

# ─── GOOGLE SHEETS ───────────────────────────────────────────────────────────
def get_sheets_service():
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        creds_info = {
            "type": "service_account",
            "project_id": "gen-lang-client-0000922456",
            "private_key": GOOGLE_PRIVATE_KEY,
            "client_email": GOOGLE_SERVICE_ACCOUNT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        credentials = Credentials.from_service_account_info(creds_info, scopes=scopes)
        return build("sheets", "v4", credentials=credentials)
    except Exception as e:
        logger.error(f"Sheets service error: {e}")
        return None

def search_in_sheets(code: str) -> Optional[dict]:
    try:
        service = get_sheets_service()
        if not service:
            return None
        result = service.spreadsheets().values().get(
            spreadsheetId=GOOGLE_SHEET_ID,
            range="MASTER_UNIFIED_V5!A:AI"
        ).execute()
        values = result.get("values", [])
        if len(values) < 2:
            return None
        headers = values[0]
        code_upper = code.upper().strip()
        for row in values[1:]:
            oem_codes = row[33].upper() if len(row) > 33 else ""
            cross_refs = row[34].upper() if len(row) > 34 else ""
            all_codes = [c.strip() for c in (oem_codes + "," + cross_refs).split(",") if c.strip()]
            if code_upper in all_codes:
                record = {}
                for i, h in enumerate(headers):
                    if i < len(row):
                        record[h] = row[i]
                return record
        return None
    except Exception as e:
        logger.error(f"Error searching sheets: {e}")
        return None

def sync_to_sheets(record: dict):
    try:
        service = get_sheets_service()
        if not service:
            return
        row = [
            record.get("inputCode", ""),
            record.get("elimfiltersSku", ""),
            record.get("description", ""),
            record.get("filterType", ""),
            "", "",
            record.get("prefix", ""),
            record.get("technology", ""),
            record.get("duty", ""),
        ]
        while len(row) < 33:
            row.append("")
        row.append(",".join(record.get("oemCodes", [])))
        row.append(",".join(record.get("crossReferenceCodes", [])))
        service.spreadsheets().values().append(
            spreadsheetId=GOOGLE_SHEET_ID,
            range="MASTER_UNIFIED_V5!A:AI",
            valueInputOption="USER_ENTERED",
            body={"values": [row]}
        ).execute()
        logger.info(f"Synced {record.get('elimfiltersSku')} to Sheets")
    except Exception as e:
        logger.error(f"Error syncing to sheets: {e}")

# ─── GROQ ────────────────────────────────────────────────────────────────────
async def classify_duty_groq(code: str) -> str:
    prompt = (
        f'Eres un experto en clasificacion de filtros industriales y automotrices.\n'
        f'Clasifica el filtro con codigo "{code}" como Heavy Duty (HD) o Light Duty (LD).\n'
        f'REGLAS CRITICAS:\n'
        f'- Clasifica basandote en especificaciones tecnicas y fabricante del motor/equipo asociado.\n'
        f'- NO uses el formato del codigo para clasificar.\n'
        f'Ejemplos HD: Caterpillar, John Deere, Bobcat, Komatsu, Mack, Freightliner, Volvo Trucks, Cummins, Detroit Diesel, Case IH, New Holland, PACCAR, Peterbilt, Kenworth, MAN, Scania, DAF, Iveco, Isuzu Commercial, Liebherr, Hitachi Construction.\n'
        f'Ejemplos LD: Ford, Toyota, Honda, Chevrolet, GMC, Dodge, Ram, BMW, Mercedes-Benz Cars, Audi, Volkswagen, Nissan, Hyundai, Kia, Subaru, Mazda, Suzuki, Mitsubishi Cars, Lexus.\n'
        f'Responde UNICAMENTE con "HD" o "LD". Una sola palabra. Sin explicacion.'
    )
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=10,
    )
    duty = response.choices[0].message.content.strip().upper()
    if "HD" in duty:
        duty = "HD"
    elif "LD" in duty:
        duty = "LD"
    else:
        duty = "HD"
    logger.info(f"Groq classified {code} as {duty}")
    return duty

# ─── SCRAPERS ────────────────────────────────────────────────────────────────
HEADERS_HTTP = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml",
}

def _detect_filter_type(text_lower: str) -> str:
    if any(w in text_lower for w in ["oil filter", "lube filter", "spin-on lube", "oil & lube"]):
        return "Oil (Lube)"
    if any(w in text_lower for w in ["fuel/water", "water separator", "fuel water"]):
        return "Water Separator"
    if any(w in text_lower for w in ["fuel filter", "diesel fuel"]):
        return "Fuel"
    if any(w in text_lower for w in ["air filter", "engine air", "primary air", "secondary air"]):
        return "Air (Engine)"
    if "hydraulic" in text_lower:
        return "Hydraulic"
    if "coolant" in text_lower:
        return "Coolant"
    if "cabin" in text_lower:
        return "Cabin Air"
    if "turbine" in text_lower or "racor" in text_lower:
        return "Turbines"
    return "Unknown"

def _parse_donaldson(html: str, input_code: str) -> Optional[dict]:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text()
    p_codes = re.findall(r"\b(P\d{6})\b", text)
    other_codes = re.findall(r"\b([A-Z]\d{5,6})\b", text)
    all_codes = p_codes + other_codes
    if not all_codes:
        return None
    product_code = all_codes[0]
    filter_type = _detect_filter_type(text.lower())
    return {
        "manufacturerCode": product_code,
        "manufacturer": "Donaldson",
        "filterType": filter_type,
        "inputCode": input_code,
        "sourceUrl": f"https://www.donaldson.com/search/?q={input_code}",
        "specs": {},
    }

async def scrape_donaldson(code: str) -> Optional[dict]:
    try:
        logger.info(f"Scraping Donaldson for: {code}")
        urls = [
            f"https://www.donaldson.com/en-us/industrial-filtration/product/{code.lower()}/",
            f"https://www.donaldson.com/en-us/engine-filtration/product/{code.lower()}/",
        ]
        for url in urls:
            try:
                resp = requests.get(url, headers=HEADERS_HTTP, timeout=15)
                if resp.status_code == 200:
                    result = _parse_donaldson(resp.text, code)
                    if result:
                        return result
            except:
                continue
        search_url = "https://www.donaldson.com/en-us/search/"
        resp = requests.get(search_url, headers=HEADERS_HTTP, params={"q": code}, timeout=15)
        if resp.status_code == 200:
            result = _parse_donaldson(resp.text, code)
            if result:
                return result
        logger.warning(f"Donaldson: no resultado para {code}")
        return None
    except Exception as e:
        logger.error(f"Donaldson scraper error: {e}")
        return None

async def scrape_fram(code: str) -> Optional[dict]:
    try:
        logger.info(f"Scraping FRAM for: {code}")
        search_url = f"https://www.fram.com/search/?q={code}"
        resp = requests.get(search_url, headers=HEADERS_HTTP, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            text = soup.get_text()
            fram_codes = re.findall(r"\b((?:CH|PH|AF|CF|XG|TG|GI)\d{4,6}[A-Z]?)\b", text)
            if fram_codes:
                product_code = fram_codes[0]
                filter_type = _detect_filter_type(text.lower())
                if filter_type == "Unknown":
                    if product_code.startswith("CH"):
                        filter_type = "Oil (Lube)"
                    elif product_code.startswith("AF"):
                        filter_type = "Air (Engine)"
                    elif product_code.startswith("PH"):
                        filter_type = "Fuel"
                    elif product_code.startswith("CF"):
                        filter_type = "Cabin Air"
                return {
                    "manufacturerCode": product_code,
                    "manufacturer": "FRAM",
                    "filterType": filter_type,
                    "inputCode": code,
                    "sourceUrl": search_url,
                    "specs": {},
                }
        logger.warning(f"FRAM: no resultado para {code}")
        return None
    except Exception as e:
        logger.error(f"FRAM scraper error: {e}")
        return None

# ─── GENERACIÓN DE SKU ───────────────────────────────────────────────────────
def get_prefix(filter_type: str) -> str:
    ft = filter_type.lower().strip()
    if ft in FILTER_TYPE_TO_PREFIX:
        return FILTER_TYPE_TO_PREFIX[ft]
    for key, prefix in FILTER_TYPE_TO_PREFIX.items():
        if key in ft or ft in key:
            return prefix
    logger.warning(f"No prefix found for '{filter_type}', defaulting EL8")
    return "EL8"

def generate_sku(filter_type: str, target_code: str) -> dict:
    prefix = get_prefix(filter_type)
    numbers = re.sub(r"[^0-9]", "", target_code)
    last4 = numbers[-4:] if len(numbers) >= 4 else numbers.zfill(4)
    sku = f"{prefix}{last4}"
    tech = TECHNOLOGIES.get(prefix, {})
    return {
        "sku": sku,
        "prefix": prefix,
        "technology": tech.get("name", ""),
        "category": tech.get("category", ""),
    }

# ─── MONGODB ─────────────────────────────────────────────────────────────────
def search_mongodb(code: str) -> Optional[dict]:
    code_upper = code.upper().strip()
    result = col_unified.find_one({
        "$or": [
            {"inputCode": code_upper},
            {"elimfiltersSku": code_upper},
            {"oemCodes": code_upper},
            {"crossReferenceCodes": code_upper},
        ]
    })
    if result:
        result["_id"] = str(result["_id"])
    return result

def search_catalogs(code: str) -> list:
    code_upper = code.upper().strip()
    results = list(col_catalogs.find({
        "$or": [
            {"manufacturerCode": code_upper},
            {"oemCodes": code_upper},
        ]
    }))
    for r in results:
        r["_id"] = str(r["_id"])
    return results

def find_kits(sku: str) -> list:
    kits = list(col_kits.find({"filters_included": sku}))
    for k in kits:
        k["_id"] = str(k["_id"])
    return kits

def merge_catalogs(results: list) -> dict:
    merged = {
        "sourceManufacturers": [],
        "oemCodes": set(),
        "crossReferenceCodes": set(),
        "crossReferences": {},
        "equipmentApplications": set(),
        "engineApplications": set(),
        "specs": {},
        "filterType": None,
    }
    for cat in results:
        mfr = cat.get("manufacturer", "")
        if mfr:
            merged["sourceManufacturers"].append(mfr)
        for oem in cat.get("oemCodes", []):
            merged["oemCodes"].add(oem.upper())
        mfr_code = cat.get("manufacturerCode", "")
        if mfr_code:
            merged["crossReferenceCodes"].add(mfr_code.upper())
            merged["crossReferences"][mfr.lower()] = mfr_code
        for ref_type, ref_code in cat.get("crossReferences", {}).items():
            if ref_code:
                merged["crossReferences"][ref_type] = ref_code
                merged["crossReferenceCodes"].add(ref_code.upper())
        for a in cat.get("applications", []):
            merged["equipmentApplications"].add(a)
        for a in cat.get("engineApplications", []):
            merged["engineApplications"].add(a)
        if not merged["filterType"]:
            ft = cat.get("specs", {}).get("filterType") or cat.get("filterType")
            if ft:
                merged["filterType"] = ft
        for k, v in cat.get("specs", {}).items():
            if k not in merged["specs"] and v:
                merged["specs"][k] = v
    merged["oemCodes"] = list(merged["oemCodes"])
    merged["crossReferenceCodes"] = list(merged["crossReferenceCodes"])
    merged["equipmentApplications"] = list(merged["equipmentApplications"])
    merged["engineApplications"] = list(merged["engineApplications"])
    return merged

# ─── FLUJO PRINCIPAL ─────────────────────────────────────────────────────────
async def process_part_search(code: str) -> dict:
    code_upper = code.upper().strip()
    logger.info(f"=== PART SEARCH: {code_upper} ===")

    # PASO 1: Buscar en MongoDB
    logger.info("PASO 1: Buscando en MongoDB...")
    mongo_result = search_mongodb(code_upper)
    if mongo_result:
        logger.info(f"Encontrado en MongoDB: {mongo_result.get('elimfiltersSku')}")
        kits = find_kits(mongo_result.get("elimfiltersSku", ""))
        return format_response(mongo_result, kits, existing=True)

    # PASO 1b: Buscar en Google Sheets
    logger.info("PASO 1b: Buscando en Google Sheets...")
    sheet_result = search_in_sheets(code_upper)
    if sheet_result:
        logger.info("Encontrado en Google Sheets")
        sku = sheet_result.get("B", "")
        kits = find_kits(sku) if sku else []
        return format_sheet_response(sheet_result, kits)

    # PASO 2: Clasificar Duty con Groq
    logger.info("PASO 2: Clasificando duty con Groq...")
    duty = await classify_duty_groq(code_upper)
    logger.info(f"DUTY = {duty} | {'Donaldson ON, FRAM CERRADO' if duty == 'HD' else 'FRAM ON, Donaldson CERRADO'}")

    # PASO 3: Buscar en catalogs de MongoDB
    logger.info("PASO 3: Buscando en catalogs...")
    catalog_results = search_catalogs(code_upper)

    target_code = None
    filter_type = None
    merged = None
    scraper_result = None

    if catalog_results:
        merged = merge_catalogs(catalog_results)
        filter_type = merged.get("filterType")
        if duty == "HD":
            target_code = merged.get("crossReferences", {}).get("donaldson")
        else:
            target_code = merged.get("crossReferences", {}).get("fram")
        if not target_code and catalog_results:
            target_code = catalog_results[0].get("manufacturerCode")
        logger.info(f"Encontrado en {len(catalog_results)} catalogo(s). Target: {target_code}")

    # PASO 4: Si no hay target_code, hacer scraping
    if not target_code:
        if duty == "HD":
            logger.info("PASO 4: Scraper Donaldson (FRAM CERRADO)...")
            scraper_result = await scrape_donaldson(code_upper)
        else:
            logger.info("PASO 4: Scraper FRAM (Donaldson CERRADO)...")
            scraper_result = await scrape_fram(code_upper)

        if scraper_result:
            target_code = scraper_result.get("manufacturerCode")
            filter_type = filter_type or scraper_result.get("filterType")
            logger.info(f"Scraper retorno: {target_code} | Tipo: {filter_type}")
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Codigo {code_upper} no encontrado. Duty={duty}. Scraper sin resultados."
            )

    if not target_code:
        raise HTTPException(status_code=404, detail=f"No se pudo obtener codigo target para {code_upper}")

    if not filter_type or filter_type == "Unknown":
        filter_type = "Oil (Lube)"
        logger.warning("Filter type desconocido, default: Oil (Lube)")

    # PASO 5: Generar SKU
    logger.info(f"PASO 5: Generando SKU con target={target_code}, tipo={filter_type}...")
    sku_data = generate_sku(filter_type, target_code)
    logger.info(f"SKU generado: {sku_data['sku']}")

    # PASO 6: Validar unicidad
    existing = col_unified.find_one({"elimfiltersSku": sku_data["sku"]})
    if existing:
        existing["_id"] = str(existing["_id"])
        logger.info(f"SKU {sku_data['sku']} ya existe")
        kits = find_kits(sku_data["sku"])
        return format_response(existing, kits, existing=True)

    # PASO 7: Guardar en MongoDB
    logger.info("PASO 7: Guardando en MongoDB...")
    oem_codes = [code_upper]
    cross_ref_codes = [target_code]
    cross_references = {"donaldson": target_code} if duty == "HD" else {"fram": target_code}
    equipment_apps = []
    engine_apps = []

    if merged:
        oem_codes = merged.get("oemCodes", [code_upper])
        if code_upper not in oem_codes:
            oem_codes.append(code_upper)
        cross_ref_codes = merged.get("crossReferenceCodes", [target_code])
        if target_code not in cross_ref_codes:
            cross_ref_codes.append(target_code)
        cross_references = merged.get("crossReferences", cross_references)
        equipment_apps = merged.get("equipmentApplications", [])
        engine_apps = merged.get("engineApplications", [])

    new_record = {
        "inputCode": code_upper,
        "elimfiltersSku": sku_data["sku"],
        "description": f"{filter_type} Filter",
        "filterType": filter_type,
        "prefix": sku_data["prefix"],
        "elimfiltersTechnology": sku_data["technology"],
        "duty": duty,
        "oemCodes": oem_codes,
        "crossReferenceCodes": cross_ref_codes,
        "crossReferences": cross_references,
        "equipmentApplications": equipment_apps,
        "engineApplications": engine_apps,
        "sourceManufacturer": "Donaldson" if duty == "HD" else "FRAM",
        "sourceCode": target_code,
        "sourceType": "SCRAPER" if scraper_result else "CATALOG",
        "auditStatus": "pending_review",
        "createdAt": datetime.now().isoformat(),
    }
    col_unified.insert_one(new_record)
    logger.info(f"Guardado en MongoDB: {sku_data['sku']}")

    # Sync a Google Sheets
    logger.info("Sincronizando con Google Sheets...")
    sync_to_sheets(new_record)

    # Buscar kits relacionados
    kits = find_kits(sku_data["sku"])

    new_record.pop("_id", None)
    return format_response(new_record, kits, existing=False)

# ─── FORMATEAR RESPUESTA ─────────────────────────────────────────────────────
def format_response(record: dict, kits: list, existing: bool) -> dict:
    sku = record.get("elimfiltersSku", "")
    duty = record.get("duty", "")
    filter_type = record.get("filterType", "")
    tech = record.get("elimfiltersTechnology", "")
    prefix = record.get("prefix", "")

    specs = [
        {"label": "SKU", "value": sku},
        {"label": "Duty", "value": f"{duty} DUTY"},
        {"label": "Filter Type", "value": filter_type},
        {"label": "Technology", "value": tech},
    ]
    if record.get("threadSize"):
        specs.append({"label": "Thread Size", "value": record["threadSize"]})
    if record.get("heightMm"):
        specs.append({"label": "Height", "value": f'{round(float(record["heightMm"])/25.4,2)}" ({record["heightMm"]}mm)'})

    formatted_kits = []
    for kit in kits:
        formatted_kits.append({
            "kit_sku": kit.get("kit_sku", ""),
            "kit_description": kit.get("kit_description_en", ""),
            "filters_count": len(kit.get("filters_included", [])),
            "filters_included": kit.get("filters_included", []),
            "equipment": kit.get("equipment_applications", []),
            "warranty_months": kit.get("warranty_months"),
            "interval_km": kit.get("change_interval_km"),
        })

    return {
        "success": True,
        "existing": existing,
        "reference_code": record.get("sourceCode", ""),
        "prefix": prefix,
        "sku": sku,
        "description": record.get("description", ""),
        "duty": duty,
        "technology": tech,
        "specs": specs,
        "equipment_applications": record.get("equipmentApplications", []),
        "engine_applications": record.get("engineApplications", []),
        "oem_codes": record.get("oemCodes", []),
        "cross_references": record.get("crossReferenceCodes", []),
        "source_manufacturers": [s.strip() for s in record.get("sourceManufacturer", "").split(",")],
        "related_kits": formatted_kits,
    }

def format_sheet_response(sheet_data: dict, kits: list) -> dict:
    return {
        "success": True,
        "existing": True,
        "source": "google_sheets",
        "sku": sheet_data.get("B", ""),
        "data": sheet_data,
        "related_kits": kits,
    }

# ─── ENDPOINTS ───────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "ELIMFILTERS API v4.0",
        "status": "online",
        "endpoints": {
            "search": "POST /api/search",
            "technologies": "GET /api/technologies",
            "stats": "GET /api/stats",
            "health": "GET /health",
        }
    }

@app.post("/api/search")
async def search_filter(request: SearchRequest):
    code = request.code.strip()
    if not code:
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    if request.searchType == "part":
        return await process_part_search(code)
    elif request.searchType in ["vin", "equipment"]:
        raise HTTPException(status_code=501, detail=f"searchType no implementado")
    else:
        raise HTTPException(status_code=400, detail=f"searchType invalido: {request.searchType}")

@app.get("/api/technologies")
async def get_technologies():
    return {"technologies": TECHNOLOGIES}

@app.get("/api/stats")
async def get_stats():
    total = col_unified.count_documents({})
    by_prefix = {}
    for prefix in TECHNOLOGIES:
        count = col_unified.count_documents({"prefix": prefix})
        if count > 0:
            by_prefix[prefix] = count
    return {"total": total, "by_technology": by_prefix}

@app.get("/health")
async def health():
    try:
        mongo.admin.command("ping")
        return {"status": "healthy", "database": "connected"}
    except:
        return {"status": "unhealthy", "database": "disconnected"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
