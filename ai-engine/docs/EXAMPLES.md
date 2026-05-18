# AI Engine Examples

## Example 1: Cross-Reference Query

**User Query:** "What's equivalent to LF9009 that works with Caterpillar?"

### Request
```bash
curl -X POST http://localhost:3001/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "equivalent to LF9009 for Caterpillar"}'
```

### Response
```json
{
  "success": true,
  "data": {
    "query": "equivalent to LF9009 for Caterpillar",
    "intent": "CROSS_REFERENCE",
    "entities": {
      "codes": ["LF9009"],
      "machines": ["Caterpillar"],
      "technologies": [],
      "specifications": [],
      "quantities": []
    },
    "llmResponse": "LF9009 is a Fleetguard lube oil filter. For Caterpillar equipment, the equivalent filter would be... [detailed recommendation with SKUs]",
    "toolResults": ["findCrossReference"],
    "products": [
      {
        "sku": "EL8-CAT-001",
        "base_code": "CAT1R0645",
        "technology": "oil",
        "category": "lube oil",
        "competitor_codes": ["LF9009", "WD962"],
        "oem_codes": ["CAT 1R-0645"],
        "cross_references": ["Fleetguard LF9009", "Donaldson P502380"],
        "efficiency": "98.7%"
      },
      // ... more products
    ],
    "timestamp": "2026-05-18T14:30:00Z"
  }
}
```

---

## Example 2: Machine Compatibility Search

**User Query:** "I need an air filter for a 2015 Toyota Camry"

### Request
```bash
curl -X POST http://localhost:3001/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "air filter Toyota Camry 2015"}'
```

### Response
```json
{
  "success": true,
  "data": {
    "query": "air filter Toyota Camry 2015",
    "intent": "MACHINE_LOOKUP",
    "entities": {
      "codes": [],
      "machines": ["Toyota", "Camry", "2015"],
      "technologies": ["air"],
      "specifications": [],
      "quantities": []
    },
    "products": [
      {
        "sku": "EA1-TOY-042",
        "base_code": "16546-02160",
        "technology": "air",
        "category": "engine air",
        "type": "panel",
        "description": "Engine air filter for Toyota Camry 2015-2019",
        "oem_codes": ["Toyota 16546-02160"],
        "applications": ["Toyota Camry 2.5L", "Toyota Camry 3.5L"]
      }
    ],
    "count": 1
  }
}
```

---

## Example 3: Intent Classification Only

**User Query:** "Tell me about micron ratings"

### Request
```bash
curl -X POST http://localhost:3001/ai/intent \
  -H "Content-Type: application/json" \
  -d '{"query": "what is micron rating"}'
```

### Response
```json
{
  "success": true,
  "data": {
    "query": "what is micron rating",
    "intent": "TECHNICAL_QUESTION",
    "confidence": 0.95,
    "entities": {
      "codes": [],
      "machines": [],
      "technologies": [],
      "specifications": ["micron rating"],
      "quantities": []
    }
  }
}
```

---

## Example 4: Cross-Reference Lookup (Direct)

**User Query:** "Give me all alternatives to Donaldson P502380"

### Request
```bash
curl -X POST http://localhost:3001/ai/cross-reference \
  -H "Content-Type: application/json" \
  -d '{"code": "P502380"}'
```

### Response
```json
{
  "success": true,
  "data": {
    "code": "P502380",
    "equivalents": [
      {
        "sku": "EL8-DONALDSON-001",
        "base_code": "P502380",
        "description": "Lube oil filter",
        "competitor_codes": ["Fleetguard LF9009", "WD962", "Baldwin B7317"],
        "oem_codes": ["Caterpillar 1R-0645"],
        "cross_references": ["Cummins 3901459", "John Deere CH13072"]
      },
      // ... more equivalents
    ],
    "count": 8
  }
}
```

---

## Example 5: Product Search with AI Ranking

**User Query:** "fuel water separator for diesel trucks"

### Request
```bash
curl -X POST http://localhost:3001/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "fuel water separator diesel"}'
```

### Response
```json
{
  "success": true,
  "data": {
    "query": "fuel water separator diesel",
    "intent": "PRODUCT_SEARCH",
    "entities": {
      "codes": [],
      "machines": ["diesel"],
      "technologies": ["fuel"],
      "specifications": ["water separator"],
      "quantities": []
    },
    "products": [
      {
        "sku": "EF9-RCR-WSEP-001",
        "base_code": "RCRD23",
        "technology": "fuel",
        "category": "fuel water separator",
        "type": "cartridge",
        "media_type": "super-absorbent",
        "applications": ["Heavy-duty diesel engines", "Marine diesel"],
        "efficiency": "99.5%"
      },
      {
        "sku": "EF9-FRAM-001",
        "base_code": "FRM-DWS",
        "technology": "fuel",
        "type": "spin-on",
        "applications": ["Truck fuel systems", "Stationary diesels"]
      }
    ],
    "count": 2
  }
}
```

---

## Example 6: Complex Industrial Query

**User Query:** "Need replacements for Hydac 0160R025W/HC hydraulic filter for a CAT 320D excavator operating in dusty mining conditions"

### Request
```bash
curl -X POST http://localhost:3001/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "replacements Hydac 0160R025W/HC hydraulic filter CAT 320D excavator mining"
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "query": "replacements Hydac 0160R025W/HC hydraulic filter CAT 320D excavator mining",
    "intent": "CROSS_REFERENCE",
    "entities": {
      "codes": ["0160R025W/HC"],
      "machines": ["CAT", "320D", "excavator"],
      "technologies": ["hydraulic"],
      "specifications": ["dust", "mining conditions"],
      "quantities": []
    },
    "llmResponse": "For your CAT 320D excavator in mining conditions, the Hydac 0160R025W/HC can be replaced with... [AI reasoning about dust conditions, pressure ratings, flow rates, and compatible alternatives with specific SKUs]",
    "toolResults": ["findCrossReference", "searchByTechnology"],
    "products": [
      {
        "sku": "EH6-HYDAC-001",
        "base_code": "0160R025W/HC",
        "technology": "hydraulic",
        "category": "return filter",
        "type": "spin-on",
        "micron_rating": "25 μm",
        "efficiency": "98%",
        "applications": ["CAT 320D", "Excavators", "Heavy machinery"],
        "oem_codes": ["Caterpillar 335-8089"]
      },
      {
        "sku": "EH6-MANN-HDWC913",
        "competitor_codes": ["Hydac 0160R025W/HC"],
        "description": "High-capacity dust-resistant hydraulic filter"
      }
    ],
    "timestamp": "2026-05-18T14:35:00Z"
  }
}
```

---

## Integration in Frontend

```javascript
// React component example
async function AIFilterSearch() {
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    const response = await fetch('http://ai-engine:3001/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const { data } = await response.json();
    setResults(data.products);
  };

  return (
    <div>
      <input 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search with natural language..."
      />
      <div>
        {results.map(product => (
          <div key={product.sku}>
            <h3>{product.sku}</h3>
            <p>{product.description}</p>
            <p>OEM: {product.oem_codes?.join(', ')}</p>
            <p>Alternatives: {product.competitor_codes?.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Tool Calling Under the Hood

When you send a query, GROQ's mixtral model automatically chooses which tools to call:

**Example: User asks "Find Caterpillar equivalent to LF9009"**

1. **Intent Detection** → CROSS_REFERENCE
2. **Entity Extraction** → codes: ["LF9009"], machines: ["Caterpillar"]
3. **LLM Tool Choice** → Uses `findCrossReference("LF9009")`
4. **Database Query** → Searches cross_references table
5. **LLM Reasoning** → Filters results for Caterpillar compatibility
6. **Result Ranking** → Orders by relevance
7. **Response** → Returns ranked products with explanations

---

## Error Handling

### Invalid Query
```json
{
  "error": "Query is required",
  "message": "..."
}
```

### Database Error
```json
{
  "error": "Search failed",
  "message": "Connection timeout"
}
```

### LLM Error
```json
{
  "error": "Failed to process query",
  "message": "GROQ API rate limit exceeded"
}
```

---

## Performance Tips

1. **Keep queries focused** - "LF9009 equivalent" faster than "tell me about all filters that work with everything"
2. **Use specific codes** - OEM codes return results faster than descriptions
3. **Intent matters** - CROSS_REFERENCE is fastest, MACHINE_LOOKUP requires more processing

Typical response times:
- Intent classification: 200-400ms
- Cross-reference: 400-800ms
- Full RAG query: 1-2s
- Search + ranking: 600-1200ms
