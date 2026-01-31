"""
ELIMFILTERS v4.0 - Sistema Completo
"""
import os
from pymongo import MongoClient
from groq import Groq
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Tecnologías ELIMFILTERS
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
    "ED3": {"name": "BLUECLEAN™", "category": "DEF/AdBlue"},
    "EG3": {"name": "GASULTRA™", "category": "Gas"},
    "EK5": {"name": "DURATECH™", "category": "Kits HD"},
    "EK3": {"name": "DURATECH™", "category": "Kits LD"},
    "EM9": {"name": "MARINECLEAN™", "category": "Marine"}
}

HD_BRANDS = ["CAT", "CATERPILLAR", "CUMMINS", "DETROIT", "MACK", "VOLVO"]
LD_BRANDS = ["FORD", "CHEVY", "GMC", "DODGE", "RAM", "TOYOTA"]

class ELIMFILTERSv4:
    def __init__(self):
        print("\n🚀 Iniciando ELIMFILTERS v4.0...\n")
        
        # MongoDB
        uri = os.getenv("MONGODB_URI")
        self.client = MongoClient(uri)
        self.db = self.client['elimfilters_db']
        self.collection = self.db['master_unified_v5']
        self.client.admin.command('ping')
        print("✅ MongoDB conectado")
        
        # GROQ
        groq_key = os.getenv("GROQ_API_KEY")
        self.groq = Groq(api_key=groq_key) if groq_key else None
        print("✅ GROQ AI configurado\n")
    
    def detect_prefix(self, code):
        for prefix in TECHNOLOGIES.keys():
            if code.upper().startswith(prefix):
                return prefix
        return None
    
    def classify_duty(self, code):
        upper = code.upper()
        if any(brand in upper for brand in HD_BRANDS):
            return "HD"
        if any(brand in upper for brand in LD_BRANDS):
            return "LD"
        return "Unknown"
    
    def search(self, input_code):
        print(f"\n🔍 Buscando: {input_code}")
        
        # Buscar en MongoDB
        result = self.collection.find_one({"input_code": input_code.upper()})
        if result:
            print("✅ Encontrado en MongoDB")
            return result
        
        # Analizar nuevo código
        prefix = self.detect_prefix(input_code)
        if not prefix:
            print("❌ Prefijo no reconocido")
            return None
        
        tech = TECHNOLOGIES[prefix]
        duty = self.classify_duty(input_code)
        
        print(f"✅ Tecnología: {tech['name']}")
        print(f"✅ Categoría: {tech['category']}")
        print(f"✅ Duty: {duty}")
        
        # Crear registro
        record = {
            "input_code": input_code.upper(),
            "elimfilters_sku": f"{prefix}-PENDING",
            "prefix": prefix,
            "technology": tech['name'],
            "category": tech['category'],
            "duty": duty,
            "created_at": datetime.now().isoformat()
        }
        
        self.collection.insert_one(record)
        print("✅ Guardado en MongoDB")
        return record
    
    def show_technologies(self):
        print("\n📋 TECNOLOGÍAS ELIMFILTERS:\n")
        for prefix, tech in TECHNOLOGIES.items():
            print(f"{prefix}: {tech['name']:<15} | {tech['category']}")
    
    def stats(self):
        total = self.collection.count_documents({})
        print(f"\n📊 Total registros: {total}")
        for prefix in TECHNOLOGIES.keys():
            count = self.collection.count_documents({"prefix": prefix})
            if count > 0:
                print(f"{prefix}: {count}")

def main():
    system = ELIMFILTERSv4()
    
    while True:
        print("\n" + "="*50)
        print("1. Buscar código")
        print("2. Ver tecnologías")
        print("3. Estadísticas")
        print("4. Salir")
        
        option = input("\nOpción: ").strip()
        
        if option == "1":
            code = input("Código a buscar: ").strip()
            if code:
                result = system.search(code)
                if result:
                    print(f"\nSKU: {result.get('elimfilters_sku')}")
                    print(f"Tecnología: {result.get('technology')}")
                    print(f"Categoría: {result.get('category')}")
        
        elif option == "2":
            system.show_technologies()
        
        elif option == "3":
            system.stats()
        
        elif option == "4":
            print("\n👋 ¡Hasta pronto!")
            break

if __name__ == "__main__":
    main()
