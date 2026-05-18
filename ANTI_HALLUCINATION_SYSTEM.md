# Anti-Hallucination System - CRITICAL PRODUCTION SAFEGUARD

**Status:** FULLY IMPLEMENTED  
**Date:** 2026-05-18  
**Severity:** CRITICAL - Zero Hallucination Tolerance  
**Compliance:** Mandatory for all AI Engine operations

---

## Executive Summary

The AI Engine has been transformed from a generative chatbot into a **strictly grounded retrieval-based industrial intelligence system**. The LLM is completely forbidden from inventing data, making speculative claims, or using general knowledge to fill gaps.

Every response must be **verifiable from database sources** or the system returns `"NOT FOUND IN DATABASE"`.

---

## System Architecture

```
User Query
    ↓
Route Handler
    ↓
RAGService (with context retrieval)
    ↓
LLMService (enforces anti-hallucination prompt)
    ↓
Tool Execution (if needed)
    ↓
ResponseValidator (detects hallucinations)
    ↓
Block or Return Response
```

---

## Core Components

### 1. ANTI_HALLUCINATION_SYSTEM_PROMPT

**Location:** `src/services/llm.service.js`

This is the **mandatory system prompt** injected into every LLM call. It explicitly forbids:

```
FORBIDDEN:
- Inventing products or SKUs
- Creating fake cross-references
- Generating specifications not in database
- Using general knowledge to fill gaps
- Assuming compatibility without evidence
- Hallucinating OEM equivalents
- Speculative claims ("might work", "probably equivalent", "typically")

REQUIRED:
- Use ONLY data from RAG context or tools
- Return "NOT FOUND IN DATABASE" if missing data
- Include source attribution
- Provide confidence score
- Be traceable to specific source
```

**Length:** 1,800+ tokens of explicit safety instructions  
**Enforcement:** Applied to ALL LLM calls without exception

### 2. LLMService

**Location:** `src/services/llm.service.js`

Centralized LLM interaction with built-in safeguards:

```javascript
class LLMService {
    // Mandatory anti-hallucination system prompt
    static ANTI_HALLUCINATION_SYSTEM_PROMPT = "..."

    // Execute LLM with grounding
    static async executeWithGrounding(query, systemContext, tools)

    // Validate response for hallucinations
    static validateResponse(response, sources)

    // Build context section from RAG
    static buildContextSection(semanticResults, keywordResults, source)

    // Format response with attribution
    static formatGroundedResponse(answer, dataSource, confidence, retrievedCount)
}
```

**Key Method: `executeWithGrounding()`**
- Injects anti-hallucination system prompt
- Injects RAG context explicitly
- Enforces tool usage when available
- Lower temperature (0.2) for grounded responses
- Returns message + tool calls

**Key Method: `validateResponse()`**
- Detects hallucination language patterns
- Verifies source attribution
- Checks confidence scoring
- Flags speculative claims

### 3. ResponseValidator

**Location:** `src/middleware/response-validator.middleware.js`

Post-response validation with blocking:

```javascript
class ResponseValidator {
    // Validate response for hallucinations
    static validateGroundedResponse(response)

    // Ensure data attribution present
    static ensureDataAttribution(response)

    // Enforce response format
    static enforceFormat(response)
}
```

**Hallucination Detection Patterns:**
```
- "assume compatible" → Unconfirmed assumption
- "might work with" → Speculative claim
- "probably equivalent" → Unverified equivalence
- "likely compatible" → Speculation
- "I think could" → Subjective guess
- "based on my knowledge" → Using general knowledge
- "in general filters" → Generalization
- "typically cross-refer" → Assumption
- "should work" → Unverified assumption
- "can be used" → Unconfirmed usage
```

If ANY pattern matches → Response is blocked with HTTP 422

---

## Request/Response Flow

### Flow for /ai/query (Full RAG)

```
1. User sends query
   ↓
2. RAGService.fullRAGQuery()
   - Intent classification
   - Entity extraction
   - Vector + SQL search (retrieval)
   ↓
3. LLMService.buildContextSection()
   - Formats retrieved products
   - Injects "RETRIEVED CONTEXT:" section
   ↓
4. LLMService.executeWithGrounding()
   - Applies anti-hallucination system prompt
   - Passes context + tools
   - LLM processes with enforced constraints
   ↓
5. Tool Execution (if LLM chose tools)
   - LLM can only use tools listed
   - Results passed back to LLM if needed
   ↓
6. ResponseValidator.enforceFormat()
   - Checks for hallucination patterns
   - Verifies source attribution
   - Validates confidence score
   ↓
7. Block or Return
   - If hallucinations detected: HTTP 422 with errors
   - If valid: Return with full attribution
```

### Example Valid Response

```json
{
  "success": true,
  "data": {
    "query": "equivalent to LF9009 for Caterpillar",
    "intent": "CROSS_REFERENCE_SEARCH",
    "confidence": 0.95,
    "llmResponse": "Based on the database, LF9009 has the following equivalents...",
    "dataSource": "RAG with Anti-Hallucination Enforcement",
    "products": [...],
    "validation": {
      "valid": true,
      "isGrounded": true,
      "hasHallucinations": false
    }
  }
}
```

### Example Invalid Response (Blocked)

```json
{
  "success": false,
  "error": "Response validation failed - potential hallucination detected",
  "details": [
    "Hallucination detected: Speculative compatibility claim"
  ]
}
```

HTTP Status: **422 Unprocessable Entity**

---

## Data Source Priority

When multiple sources exist, priority is:

1. **Tool Results** (Highest Priority)
   - Direct database queries via tools
   - Highest confidence (1.0)

2. **SQL Query Results**
   - Keyword searches from PostgreSQL
   - High confidence (0.9)

3. **Vector Similarity Results**
   - Only if similarity > 0.75
   - Confidence based on similarity score (0.7-0.85)

**If sources conflict:**
- Tool results override SQL
- SQL results override vector
- Log the conflict with clear indication

---

## Response Attribution

Every response must include:

```
---
Retrieved Context Used: YES/NO
Data Source: [findCrossReference tool | vector_search | sql_search]
Confidence: 0.85
```

**Confidence Scoring:**
- 1.0 = Exact match in tool results
- 0.95 = Multiple confirming sources
- 0.9 = Single tool result, clear match
- 0.85 = Vector + SQL confirm
- 0.8 = Primary source only
- 0.75 = Vector similarity > 0.75
- 0.5 = Partial match, some uncertainty
- 0.0 = Default when uncertain

---

## NOT FOUND Behavior

When data is not available:

**LLM Response:**
```
NOT FOUND IN DATABASE
```

**API Response:**
```json
{
  "message": "NOT FOUND IN DATABASE",
  "code": "equivalent_to_LF9009_for_Caterpillar",
  "dataSource": "PostgreSQL (No results)",
  "confidence": 0.0
}
```

**HTTP Status:** 200 (success flag is true, but data is missing)

---

## Safety Guarantees

### Guaranteed Behaviors

✓ **No Product Invention**
- Responses only use database products
- Cannot create synthetic SKUs
- Cannot generate product specifications

✓ **No Compatibility Assumptions**
- No "might be compatible" claims
- No "probably equivalent" guesses
- Only confirmed matches from database

✓ **No General Knowledge**
- LLM cannot use training knowledge
- Must rely on retrieved context only
- No filling gaps with assumptions

✓ **No Speculative Language**
- All hedging words forbidden
- No "should", "could", "might", "probably"
- Must be definitive or say "NOT FOUND"

✓ **Verified Equivalences**
- Cross-references from database only
- OEM codes from product records
- Machine compatibility from retrieval

✓ **Traceable Answers**
- Every claim references source
- Tool results are explicitly cited
- Vector search confidence shown

### Hard Blocks

✗ **HTTP 422 if:**
- Hallucination patterns detected
- Missing source attribution
- Confidence score not provided
- Speculative language found
- General knowledge used

---

## Implementation Details

### LLMService Methods

**`executeWithGrounding(query, systemContext, tools)`**
```javascript
// Injects:
// - Anti-hallucination system prompt
// - RAG context explicitly
// - Available tools list
// - Lower temperature (0.2)

// Returns:
// - message: LLM response
// - toolCalls: Array of tool invocations
// - raw: Raw Groq response
```

**`validateResponse(response, sources)`**
```javascript
// Checks:
// - Hallucination patterns
// - Source attribution presence
// - Confidence score validity
// - Response type (grounded vs not_found)

// Returns:
// - valid: boolean
// - errors: string[]
// - type: 'not_found' | 'grounded'
```

**`buildContextSection(semanticResults, keywordResults, source)`**
```javascript
// Formats retrieved data as:
// RETRIEVED CONTEXT:
// 
// SEMANTIC MATCHES (Vector Search):
// - SKU: ..., Code: ..., Type: ...
// 
// KEYWORD MATCHES (SQL Search):
// - SKU: ..., Code: ..., Tech: ...
// 
// Data Source: RAG (Vector + SQL Search)
// Result Count: 8
```

### ResponseValidator Methods

**`validateGroundedResponse(response)`**
- Detects hallucination patterns
- Checks source attribution
- Validates confidence scoring
- Returns validation object

**`enforceFormat(response)`**
- Adds required fields
- Validates response
- Logs hallucinations
- Returns formatted response

---

## Testing the Anti-Hallucination System

### Test 1: Valid Grounded Response

**Request:**
```json
{
  "query": "find filter with SKU LF123"
}
```

**Expected:**
- HTTP 200
- Response has "Retrieved Context Used: YES"
- Data Source shows tool name
- Products are from database

### Test 2: Missing Data

**Request:**
```json
{
  "query": "find filter with SKU NONEXISTENT999"
}
```

**Expected:**
- HTTP 200
- Response shows "NOT FOUND IN DATABASE"
- Confidence is 0.0
- No speculative matches

### Test 3: Hallucination Attempt

**Request:**
```json
{
  "query": "what filters might work for a 2024 diesel truck"
}
```

**Expected:**
- LLM tries to speculate compatibility
- ResponseValidator detects pattern
- HTTP 422 returned
- Error lists "Hallucination detected"

### Test 4: Speculative Language

**If LLM responds with:**
```
"LF9009 should probably work for Caterpillar engines"
```

**Expected:**
- Pattern detected: "should probably"
- Response blocked
- HTTP 422 with hallucination error

---

## Monitoring & Logging

### Logged Events

**INFO Level:**
```
[INFO] RAG query started {query: "equivalent to LF9009"}
[INFO] Vector search completed {resultCount: 3}
[INFO] RAG query completed {toolCount: 1, productCount: 5}
[INFO] Search completed {query: "fuel filter", resultCount: 12}
```

**WARN Level:**
```
[WARN] Response validation detected issues {errors: ["Hallucination detected"]}
[WARN] No cross-references found {code: "UNKNOWN123"}
```

**ERROR Level:**
```
[ERROR] HALLUCINATION DETECTED IN RESPONSE {query: "...", errors: [...]}
[ERROR] Tool execution failed: searchProducts {error: "Database connection"}
```

### Metrics to Monitor

- Hallucination detection rate
- Average confidence scores
- Response validation pass rate
- Tool vs non-tool response ratio
- Average retrieval count per query

---

## Deployment Checklist

Before deploying to production:

- [ ] LLMService initialized
- [ ] Anti-hallucination prompt reviewed
- [ ] ResponseValidator integrated
- [ ] All routes updated
- [ ] Test /ai/query endpoint
- [ ] Test hallucination blocking
- [ ] Verify logging works
- [ ] Check HTTP 422 responses
- [ ] Monitor first 100 queries for patterns
- [ ] Verify no hallucinations in production

---

## Failure Modes & Recovery

### Scenario 1: LLM Ignores System Prompt

**Detection:** ResponseValidator catches hallucination patterns  
**Response:** Block with HTTP 422, log error  
**Recovery:** Check LLM configuration, retry

### Scenario 2: Missing Context Section

**Detection:** Response missing "Retrieved Context Used:"  
**Response:** Block and require reformat  
**Recovery:** Ensure RAG context passed correctly

### Scenario 3: Tool Not Available

**Detection:** LLM tries to use non-existent tool  
**Response:** Tool execution fails gracefully  
**Recovery:** LLM should respond with "NOT FOUND IN DATABASE"

### Scenario 4: Database Disconnected

**Detection:** Tool execution fails with DB error  
**Response:** Tool returns error, LLM cannot proceed  
**Recovery:** Respond with "Database temporarily unavailable"

---

## Future Enhancements

- [ ] Fine-tuned model for industrial domain
- [ ] Confidence interval calculation
- [ ] A/B test hallucination rates
- [ ] Machine learning confidence prediction
- [ ] Automated false positive detection
- [ ] Human-in-the-loop review for borderline cases

---

## Critical Notes

⚠️ **This system is non-negotiable for production.**

- LLM cannot be "creative"
- Responses cannot be "helpful guesses"
- Data must be verifiable
- Confidence must be accurate
- Attribution is mandatory

The AI Engine is a **GROUNDED DATA RETRIEVAL SYSTEM**, not a generative chatbot.

---

**Status:** READY FOR PRODUCTION  
**Compliance:** CRITICAL  
**Zero Hallucination Tolerance:** ENFORCED

