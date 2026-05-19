#!/usr/bin/env python3
"""
Mock test harness for Donaldson scraper
Tests extraction logic without needing actual Selenium/Chrome
"""

import json
from datetime import datetime

# Mock extracted data from Donaldson pages
MOCK_DATA = {
    "DBL0832": {
        "type": "LUBE FILTER, SPIN-ON FULL FLOW",
        "specifications": {
            "Efficiency": "97.6% @ 15µm",
            "Media": "Synteq XP",
            "Outer Diameter": "3.66\" (93mm)",
            "Length": "7.87\" (200mm)",
            "Thread Size": "13/16-16 UN",
            "Gasket OD": "3.39\"",
            "Gasket ID": "3.05\"",
            "Test Standard": "ISO 4548-12",
            "Maximum Pressure": "N/A"
        },
        "oem_codes": {
            "Cummins": ["3948544"],
            "Caterpillar": ["136-8923"],
            "Volvo": ["21706929"]
        },
        "equipment": [
            {"name": "Cummins ISX Motor", "engine": "Diesel HD"},
            {"name": "Caterpillar C15 Engine", "engine": "Diesel HD"},
            {"name": "Volvo FH16 Truck", "engine": "Diesel HD"}
        ],
        "alternative_products": [
            {"code": "P169071", "name": "Donaldson Alternative - Standard"},
            {"code": "P173489", "name": "Donaldson Alternative - Premium"}
        ]
    },
    "DBL3998": {
        "type": "LUBE FILTER, SPIN-ON FULL FLOW DONALDSON BLUE",
        "specifications": {
            "Efficiency": "99% @ 15µm",
            "Media": "Synteq",
            "Outer Diameter": "4.66\" (118.3mm)",
            "Length": "10.24\" (260mm)",
            "Thread Size": "1 5/8-12 UN",
            "Gasket OD": "4.33\"",
            "Gasket ID": "3.86\"",
            "PSI Burst Rating": "149 PSI",
            "Test Standard": "ISO 4548-12"
        },
        "oem_codes": {
            "Cummins": ["3948554", "3948558"],
            "Caterpillar": ["136-8924"],
            "Detroit Diesel": ["K050014"]
        },
        "equipment": [
            {"name": "Cummins ISM Motor", "engine": "Diesel HD"},
            {"name": "Caterpillar 3500 Series", "engine": "Diesel HD"},
            {"name": "Detroit Diesel DD15", "engine": "Diesel HD"}
        ],
        "alternative_products": [
            {"code": "P167670", "name": "Donaldson Alternative - Full Flow"}
        ]
    },
    "P502007": {
        "type": "LUBE FILTER, SPIN-ON FULL FLOW",
        "specifications": {
            "Efficiency": "95% @ 50µm",
            "Media": "Cellulose",
            "Outer Diameter": "2.68\" (68mm)",
            "Height": "3.35\" (85mm)",
            "Thread Size": "M20x1.5",
            "Maximum Pressure": "100 PSI",
            "Bypass Opening": "11-17 PSI",
            "Test Standard": "ISO 4548-12"
        },
        "oem_codes": {
            "John Deere": ["AR97424", "RE507946"],
            "Kubota": ["HE980-33470"],
            "AGCO": ["G92105200"]
        },
        "equipment": [
            {"name": "John Deere 6R Series Tractor", "engine": "Diesel MD"},
            {"name": "Kubota V3600 Engine", "engine": "Diesel LD"},
            {"name": "Massey Ferguson MF5700", "engine": "Diesel MD"}
        ],
        "alternative_products": [
            {"code": "P502008", "name": "Donaldson P502008 - Combination"},
            {"code": "P502009", "name": "Donaldson P502009 - Light Duty"}
        ]
    }
}

def get_duty(oem_manufacturers):
    """Classify duty based on OEM manufacturers"""
    diesel_oem = [
        "CUMMINS", "CATERPILLAR", "CAT", "DETROIT DIESEL", "VOLVO",
        "MACK", "PERKINS", "YAMMER", "KUBOTA", "KOMATSU", "ISUZU",
        "MITSUBISHI", "HINO", "JOHN DEERE"
    ]

    oem_text = " ".join([m.upper() for m in oem_manufacturers])
    for diesel in diesel_oem:
        if diesel in oem_text:
            return "HD"
    return "LD"

def get_elimfilters_sku(donaldson_code):
    """Generate ELIMFILTERS SKU: EL8 + last 4 digits"""
    last_4 = donaldson_code[-4:]
    return f"EL8{last_4}"

def process_mock_data(code, mock_specs):
    """Process mock data and extract fields"""

    # Get OEM manufacturers for duty classification
    oem_manufacturers = list(mock_specs.get("oem_codes", {}).keys())

    # Extract micron from efficiency string
    efficiency = mock_specs["specifications"].get("Efficiency", "")
    micron = None
    if "@" in efficiency:
        micron_part = efficiency.split("@")[1].strip()
        micron = micron_part.replace("µm", "").strip()

    data = {
        "donaldson_code": code,
        "elimfilters_sku": get_elimfilters_sku(code),
        "type": mock_specs.get("type", ""),
        "specifications": mock_specs.get("specifications", {}),
        "oem_codes": mock_specs.get("oem_codes", {}),
        "equipment": mock_specs.get("equipment", []),
        "alternative_products": mock_specs.get("alternative_products", []),
        "duty": get_duty(oem_manufacturers),
        "micron": micron,
        "efficiency": mock_specs["specifications"].get("Efficiency", ""),
        "media_type": mock_specs["specifications"].get("Media", ""),
        "tecnologia": "SYNTRAX™"
    }

    return data

def main():
    print("🧪 MOCK TEST HARNESS - Donaldson Scraper Logic Validation")
    print("=" * 70)
    print(f"Testing {len(MOCK_DATA)} codes with mock data")
    print()

    results = []

    for code, mock_specs in MOCK_DATA.items():
        print(f"Processing {code}...", end=" ", flush=True)

        try:
            data = process_mock_data(code, mock_specs)
            results.append(data)

            print(f"✅ (Duty: {data['duty']}, SKU: {data['elimfilters_sku']}, Micron: {data['micron']})")

        except Exception as e:
            print(f"❌ Error: {e}")

    # Save JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "mode": "mock_test",
        "total_codes": len(MOCK_DATA),
        "successfully_processed": len(results),
        "codes": results
    }

    json_file = "donaldson_test_mock_output.json"
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Display summary
    print()
    print("=" * 70)
    print("✅ MOCK TEST COMPLETED")
    print(f"   Processed: {len(results)}")
    print(f"   Saved: {json_file}")
    print()

    # Display sample output
    print("Sample output (first code):")
    print("-" * 70)
    if results:
        sample = results[0]
        print(f"Code: {sample['donaldson_code']}")
        print(f"ELIMFILTERS SKU: {sample['elimfilters_sku']}")
        print(f"Duty: {sample['duty']}")
        print(f"Micron: {sample['micron']}")
        print(f"Efficiency: {sample['efficiency']}")
        print(f"OEM Codes: {sample['oem_codes']}")
        print(f"Equipment: {sample['equipment']}")
        print(f"Alternative Products: {sample['alternative_products']}")

if __name__ == "__main__":
    main()
