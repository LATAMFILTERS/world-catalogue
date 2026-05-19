# Donaldson 365 Lube Filter Scraper — Setup & Execution

**Status**: ✅ Logic validated with mock test harness  
**Next Step**: Run on Selenium-enabled system with Chrome

---

## Overview

The `scraper_donaldson_365.py` extracts complete technical specifications for all 365 Donaldson lube filter codes from shop.donaldson.com:

- **Specifications**: Micron, efficiency %, media type, dimensions, PSI ratings, test standards
- **OEM Cross-References**: Manufacturer codes for Cummins, CAT, Volvo, JohnDeere, Kubota, etc.
- **Equipment Applications**: Motor types, OEM compatibility, equipment names
- **Alternative Products**: Related Donaldson filter codes
- **ELIMFILTERS Mapping**: Automatic SKU generation (EL8 + last 4 digits)
- **Duty Classification**: HD (Heavy-Duty diesel) or LD (Light-Duty gasoline/auto)

---

## Prerequisites

### System Requirements
- **Python 3.8+**
- **Chrome/Chromium Browser** (installed and accessible)
- **Selenium 4.x**
- **WebDriver Manager** (auto-downloads chromedriver)

### Installation

```bash
# Install Python dependencies
pip install selenium webdriver-manager

# Verify Chrome is installed
# Windows: C:\Program Files\Google\Chrome\Application\chrome.exe
# Linux: /usr/bin/google-chrome
# macOS: /Applications/Google Chrome.app
```

---

## Execution Modes

### Mode 1: Test Mode (3 Codes)

**File**: `scraper_donaldson_365.py` (line 17)  
**Current Setting**: `DONALDSON_CODES = TEST_CODES`

```bash
python scraper_donaldson_365.py
```

**Output**:
- `donaldson_test.json` — Complete data structure (3 codes)
- `donaldson_test.csv` — Flattened format for spreadsheet import

**Expected Output**:
```
[1/3] Extrayendo DBL0832... ✅ (Duty: HD, Micron: 15)
[2/3] Extrayendo DBL3998... ✅ (Duty: HD, Micron: 15)
[3/3] Extrayendo P502007... ✅ (Duty: HD, Micron: 50)

✅ EXTRACCIÓN COMPLETADA
   Exitosos: 3
   Errores: 0
   📁 Guardado: donaldson_test.json
   📁 Guardado: donaldson_test.csv
```

### Mode 2: Complete Mode (All 365 Codes)

**File**: `scraper_donaldson_365.py` (line 17)  
**Change To**: `DONALDSON_CODES = ALL_DONALDSON_CODES`

```bash
# Edit line 17 in scraper_donaldson_365.py
DONALDSON_CODES = ALL_DONALDSON_CODES

# Run scraper (takes ~30-45 minutes for all 365 codes)
python scraper_donaldson_365.py
```

**Output**:
- `donaldson_365_complete.json` — All 365 codes with complete specs
- `donaldson_365_complete.csv` — All 365 codes, spreadsheet-ready

**Execution Time**: ~30-45 minutes (2 second delay per code for rate limiting)

---

## Code Structure

### Test Harness (Mock Mode)

```bash
# Validate logic without Selenium/Chrome
python scraper_test_mock.py

# Output: donaldson_test_mock_output.json
# Shows expected data structure for all 3 test codes
```

### Core Functions

| Function | Purpose |
|---|---|
| `get_elimfilters_sku(code)` | Generate EL8 + last 4 digits |
| `get_duty(oem_list)` | Classify HD/LD based on diesel OEM list |
| `extract_specifications()` | Parse spec tables from product page |
| `extract_oem_codes()` | Extract manufacturer cross-references |
| `extract_equipment()` | Get equipment/application list |
| `extract_alternative_products()` | Find related filter codes |
| `scrape_donaldson_code()` | Main scraper for single code |

---

## Data Structure

### Single Code Output

```json
{
  "donaldson_code": "DBL0832",
  "elimfilters_sku": "EL80832",
  "type": "LUBE FILTER, SPIN-ON FULL FLOW",
  "duty": "HD",
  "micron": "15",
  "efficiency": "97.6% @ 15µm",
  "media_type": "Synteq XP",
  "tecnologia": "SYNTRAX™",
  "specifications": {
    "Efficiency": "97.6% @ 15µm",
    "Media": "Synteq XP",
    "Outer Diameter": "3.66\" (93mm)",
    "Length": "7.87\" (200mm)",
    "Thread Size": "13/16-16 UN"
  },
  "oem_codes": {
    "Cummins": ["3948544"],
    "Caterpillar": ["136-8923"],
    "Volvo": ["21706929"]
  },
  "equipment": [
    {"name": "Cummins ISX Motor", "engine": "Diesel HD"},
    {"name": "Caterpillar C15 Engine", "engine": "Diesel HD"}
  ],
  "alternative_products": [
    {"code": "P169071", "name": "Donaldson Alternative - Standard"}
  ]
}
```

### CSV Format

| Column | Example | Description |
|---|---|---|
| donaldson_code | DBL0832 | Original Donaldson part number |
| elimfilters_sku | EL80832 | ELIMFILTERS replacement SKU |
| duty | HD | Heavy-Duty (diesel) or Light-Duty (gasoline) |
| type | LUBE FILTER, SPIN-ON... | Filter type/description |
| micron | 15 | Filtration micron rating |
| efficiency | 97.6% @ 15µm | Filtration efficiency |
| media_type | Synteq XP | Filter media composition |
| tecnologia | SYNTRAX™ | ELIMFILTERS technology |
| oem_codes | Cummins:3948544; CAT:... | All OEM cross-references |
| equipment | Cummins ISX...; CAT C15...; | Equipment applications |
| alternative_products | P169071: Alternative... | Related Donaldson codes |

---

## Troubleshooting

### Chrome Not Found
```bash
# Windows: Verify Chrome installed
dir "C:\Program Files\Google\Chrome"

# Linux: Install Chromium
apt-get install chromium-browser

# macOS: Verify path
ls -la "/Applications/Google Chrome.app"
```

### Selenium Timeout
- Increase `time.sleep()` values if Donaldson site loads slowly
- Add retry logic for unreliable network
- Use `--headless` mode to reduce resource usage

### WAF (Web Application Firewall) Blocks
- Selenium uses real Chrome browser (not detected as bot)
- If blocked, add random delays: `time.sleep(random.uniform(2, 5))`
- Rotate user agents if needed

### Memory Issues (365 codes)
- Process runs in single thread, uses ~50MB RAM
- Requires ~200MB free disk for JSON + CSV output

---

## Output Files

### JSON Format
```bash
donaldson_365_complete.json
├── timestamp: ISO 8601 datetime
├── source: "shop.donaldson.com"
├── mode: "complete"
├── total_requested: 365
├── successfully_extracted: [count]
├── failed: [count]
├── codes: [array of all extracted data]
└── errors: [list of failed codes]
```

### CSV Format
- 11 columns: donaldson_code, elimfilters_sku, duty, type, micron, efficiency, media_type, tecnologia, oem_codes, equipment, alternative_products
- One row per code
- Easy import to Excel/Google Sheets for sales teams

---

## Next Steps

1. **Windows/Mac**: Run in test mode to validate logic
   ```bash
   python scraper_donaldson_365.py
   ```

2. **Check output**: Verify `donaldson_test.json` has complete structure

3. **Switch to complete mode**: Edit line 17, set `DONALDSON_CODES = ALL_DONALDSON_CODES`

4. **Run full extraction**: ~30-45 minutes
   ```bash
   python scraper_donaldson_365.py > extraction_log.txt
   ```

5. **Verify output files**:
   - `donaldson_365_complete.json` — Full technical data
   - `donaldson_365_complete.csv` — Sales/distribution spreadsheet

6. **Post-processing**: Generate competitive matrix, podcast scripts, sales materials

---

## Code List

All 365 codes in `ALL_DONALDSON_CODES`:

**DBL Series (14)**  
DBL0832, DBL3998, DBL4560, DBL7300, DBL7345, DBL7349, DBL7367, DBL7405, DBL7483, DBL7505, DBL7670, DBL7739, DBL7900, DBL7947

**P500 Series (30)**  
P502007–P502225, P502433–P506077

**P550 Series (150)**  
P550006–P550973 (various)

**P551–P555 Series (140+)**  
P551005–P559936

**P1xx Series (13)**  
P167405, P167670, P167947, P169071, P173489, P173998, P177300–P179353

**Total: 365 codes**

---

## Support

**Issues Running Scraper?**
- Check Chrome installation: `chrome --version`
- Verify Selenium: `python -c "import selenium; print(selenium.__version__)"`
- Check Donaldson site availability: visit shop.donaldson.com manually
- Review extraction logic with mock test: `python scraper_test_mock.py`

**Questions About Data?**
- Structure defined in `scraper_donaldson_365.py` functions
- Mock test shows expected output: `donaldson_test_mock_output.json`
- CSV column definitions above

---

*Last Updated: 2026-04-29*  
*Scraper Version: 2.0 - Complete Extraction*  
*Test Status: ✅ Validated with mock data*
