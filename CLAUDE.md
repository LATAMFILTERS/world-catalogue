# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ELIMFILTERS Backend API** - An intelligent system for generating SKUs (Stock Keeping Units) and managing cross-references for industrial, automotive, and marine filters. The system integrates Google Sheets, MongoDB, web scraping, and Groq LLM to automatically classify filters and generate standardized product codes.

**Core Workflow:** Detect manufacturer → Extract specifications → Classify duty level → Generate TRILOGY (3 SKU variants: Standard, Performance, Elite) → Enrich with AI.

**Technology Stack:** Node.js 20, Express.js, MongoDB, Groq LLM (LLaMA 3.3 70B), Puppeteer, Google Sheets API.

---

## Quick Start

**Install & Run:**
```bash
npm install
npm start              # Production mode (port 8080)
npm run dev           # Development with auto-reload
```

**Test the System:**
```bash
node test-sku-system.js      # Full SKU generation flow
node test-groq.js            # LLM classification
node test-donaldson.js       # Donaldson scraper
```

**API Usage:**
```bash
curl "http://localhost:8080/api/filters/search/homologous?code=P554005"
```

---

## Architecture Overview

### The "CEREBRO" (Filter Orchestrator)
Located in `services/filter.orchestrator.js` - the central command center that:
1. Searches existing sources (Google Sheets, MongoDB)
2. Detects duty classification (Heavy Duty, Light Duty, Marine)
3. Extracts specifications (dimensions, microns, media type)
4. Generates 3 SKU variants via TRILOGY system
5. Enriches results with Groq LLM classification

**Key Flow:**
```
Input Code (e.g., P554005)
    ↓
Master Scraper → Detects manufacturer (Donaldson, FRAM, Racor, Marine)
    ↓
Duty Detector → Classifies as HD/LD/Marine
    ↓
SKU Generator → Creates TRILOGY (3 variants)
    ↓
Groq Service → Validates and enriches specs
    ↓
Response: Complete filter profile with cross-references
```

### Data Sources (Priority Order)
1. **Google Sheets** - Master data (MASTER_UNIFIED_V5, MASTER_KITS_V1)
2. **MongoDB** - Cache/index for performance (collections: `filters`, `unified_filters`)
3. **Web Scrapers** - Fallback (Donaldson, FRAM, Racor, Sierra/Mercury)

### TRILOGY SKU System
Each physical filter generates 3 SKU variants:
- **STANDARD** - Cellulose media (baseline)
- **PERFORMANCE** - Improved filtration
- **ELITE** - Synthetic media (premium)

Format: `[PREFIX][4_DIGITS]` (e.g., `EL81808`)
- Prefixes: EL8 (Oil), EA1 (Air), EF9 (Fuel), EW1 (Water), etc.
- Digits derived from manufacturer code hash or sequence

---

## Project Structure

**Core Business Logic:**
```
services/
  ├── filter.orchestrator.js        ← Main workflow controller (CEREBRO)
  ├── sku.generator.js              ← TRILOGY generation engine
  ├── classification.service.js     ← Filter type & duty detection
  ├── duty.detector.js              ← HD/LD/Marine classification
  ├── groq.service.js               ← Groq LLM integration
  ├── mongodb.service.js            ← Database operations
  ├── googleSheets.service.js       ← Google Sheets integration
  └── scrapers/
      ├── master.scraper.js         ← Manufacturer detection router
      ├── donaldson.scraper.js      ← Heavy Duty filters
      ├── fram.scraper.js           ← Light Duty filters
      ├── racor.scraper.js          ← Turbine filters
      └── marine.scraper.js         ← Marine filters
```

**Configuration:**
```
config/
  ├── elimfilters.rules.js          ← Business DNA (19KB): all classification logic
  ├── elimfilters.technologies.json ← Media types & specifications
  ├── product-descriptions.json     ← Naming templates
  ├── groq.config.json              ← LLM settings
  └── homologation.js               ← Cross-reference mappings
```

**Models & Routes:**
```
models/
  ├── filterModel.js                ← Mongoose schema (SKU, type, cross-refs)
  ├── kitModel.js                   ← Kit schema
  └── ScrapedFilter.js              ← Scraped data schema

routes/
  ├── api.routes.js                 ← Main /api/filters/search/homologous
  ├── filterRoutes.js               ← CRUD operations
  └── scrapeRoutes.js               ← Scraper endpoints
```

---

## Key Files to Know

| File | Purpose | Key Functions |
|------|---------|---|
| `server.js` | Main Express server | Initializes on port 8080, sets up routes |
| `services/filter.orchestrator.js` | CEREBRO workflow | `processFilter()`, `searchExistingSources()`, `detectDuty()` |
| `services/sku.generator.js` | TRILOGY engine | `generateTriplogy()`, `generateSKU()` |
| `config/elimfilters.rules.js` | Business rules | `DUTY_CLASSES`, `PREFIXES`, `MANUFACTURERS` |
| `services/groq.service.js` | AI integration | `classifyFilter()`, `extractSpecs()` |
| `test-sku-system.js` | Full system test | Test end-to-end flow with sample codes |

---

## Common Development Tasks

### Running Tests
```bash
# Full SKU generation flow
node test-sku-system.js

# Groq LLM classification
node test-groq.js

# Specific scraper
node test-donaldson.js

# Database connectivity
npm run seed
```

### Adding a New Manufacturer Scraper
1. Create `services/scrapers/[manufacturer].scraper.js`
2. Export `scrapeByCode(code)` async function
3. Add detection pattern to `master.scraper.js`
4. Add rules to `config/elimfilters.rules.js`
5. Test with `node test-sku-system.js`

### Updating Classification Rules
Edit `config/elimfilters.rules.js`:
- `DUTY_CLASSES` - Brand classification (Caterpillar → HEAVY_DUTY)
- `MANUFACTURERS` - Brand patterns and priorities
- `TECHNOLOGIES` - Filter media types and specs

### Database Operations
```javascript
const mongoService = require('./services/mongodb.service');

// Search
const result = await mongoService.searchFilter(code);

// Insert/Update
await mongoService.saveFilter(filterObject);

// List by collection
const filters = await mongoService.listFilters('filters', limit);
```

### Using Groq LLM
```javascript
const groqService = require('./services/groq.service');

// Classify a filter
const classification = await groqService.classifyFilter(specs);

// Extract specs from HTML
const specs = await groqService.extractSpecsFromHTML(html);
```

---

## Environment Variables

Required in `.env`:
```
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
GOOGLE_SHEET_ID=1ZYI5c0enkuvWAveu8HMaCUk1cek_VDrX8GtgKW7VP6U
GROQ_API_KEY=gsk_...
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
```

**Note:** `.env.local.json` files are not committed (Git secrets protection).

---

## API Endpoints

**Main Endpoint:**
```
GET /api/filters/search/homologous?code=EL81005
```

**Response:**
```json
{
  "success": true,
  "matched_code": "EL81808",
  "data": {
    "elimfilters_sku": "EL81808",
    "filter_type": "OIL",
    "duty": "HEAVY_DUTY",
    "trilogy": [
      {
        "sku": "EL81005",
        "variant": "STANDARD",
        "cross_reference_code": "P554005"
      },
      // ... PERFORMANCE and ELITE
    ]
  }
}
```

**Other Endpoints:**
```
GET /                                    # Health check
GET /api/filters                         # Sample filters (limit 10)
POST /api/scrape/multiple               # Batch processing
GET /api/scrape/:code                   # Single scrape
```

---

## Database Schema

**MongoDB Collections:**

`filters` (New schema - underscore fields):
```javascript
{
  elimfilters_sku: "EL81808",
  base_code: "P554005",
  filter_type: "OIL",
  duty_class: "HEAVY_DUTY",
  oem_codes: ["P554005", "J936476"],
  competitor_codes: { donaldson: "P554005", fram: "PH8170" },
  specs: {
    diameter: 76,
    height: 123,
    microns: 10
  }
}
```

`unified_filters` (Legacy schema - space-separated fields):
```javascript
{
  ELIMFILTERS SKU: "EL81808",
  sourcePart: "P554005",
  crossRefRich: "P554005|J936476"
}
```

---

## Important Business Logic

### Duty Classification
**Heavy Duty:** Caterpillar, John Deere, Cummins, Volvo, Detroit Diesel  
**Light Duty:** Ford, Toyota, Honda, BMW, Audi  
**Marine:** Sierra, Mercury, Yamaha, Volvo Penta  

See `config/elimfilters.rules.js` for complete mappings.

### Cross-Reference Matching
The system maintains equivalences between OEM and competitor codes:
- Donaldson (original source)
- FRAM (aftermarket alternative)
- Racor (specialty turbine)
- Sierra/Mercury (marine)

See `config/homologation.js` for mapping logic.

### SKU Generation Algorithm
```
Input: Manufacturer code (e.g., P554005)
  ↓
Extract last 4 digits OR hash code
  ↓
Select prefix based on filter type (OIL → EL8, AIR → EA1, etc.)
  ↓
Generate TRILOGY:
  - STANDARD variant (cellulose)
  - PERFORMANCE variant (improved)
  - ELITE variant (synthetic)
  ↓
Output: 3 SKU codes
```

---

## Git Workflow

**Branch:** `claude/llm-integration-3JmWx` for active development

**Commit Convention:**
```
feat: [description]      # New feature
fix: [description]       # Bug fix
docs: [description]      # Documentation
refactor: [description]  # Code refactoring
```

**Deployment:** Push to tracked remote branch

---

## Debugging Tips

### Check SKU Generation
```bash
node -e "
const gen = require('./services/sku.generator');
console.log(gen.generateTriplogy('P554005', 'OIL'));
"
```

### Test Duty Detection
```bash
node -e "
const duty = require('./services/duty.detector');
console.log(duty.detectDuty('CAT', 'P554005'));
"
```

### Validate Groq Connection
```bash
node test-groq.js
```

### Query MongoDB
```bash
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
db.filters.findOne({ elimfilters_sku: "EL81808" })
```

---

## Known Limitations & Future Improvements

**Current State:**
- Manual test scripts (no Jest/Mocha framework)
- Mixed Spanish/English code
- Hard-coded port 8080
- Environment PORT variable ignored in `server.js`
- No TypeScript (opportunity for type safety)
- No formal API documentation (Swagger/OpenAPI)

**Recommended Enhancements:**
1. Migrate to TypeScript for better maintainability
2. Set up Jest test framework with CI/CD pipeline
3. Add Swagger documentation for API
4. Implement rate limiting and caching
5. Add support for more manufacturers (Fleetguard, etc.)
6. Improve scraper resilience with retries
7. Add database transaction support for atomic operations

---

## Performance Notes

- **Google Sheets queries** are cached in MongoDB after first fetch
- **Web scraping** falls back to cached data if websites are down
- **Groq LLM calls** should be minimized in production (API costs)
- **MongoDB indexes** recommended on: `elimfilters_sku`, `base_code`, `oem_codes`

---

## Support & Documentation

- **Internal Docs:** See `/docs/SKU_SYSTEM.md` and `/docs/GROQ_INTEGRATION.md`
- **API Response Format:** See examples above
- **Groq Integration:** Using LLaMA 3.3 70B for classification
- **Test Data:** Available in Google Sheets (MASTER_UNIFIED_V5)

---

**Last Updated:** April 4, 2026  
**Version:** 11.0.6
