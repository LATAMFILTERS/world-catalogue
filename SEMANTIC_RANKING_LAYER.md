# Semantic Ranking Layer — Implementation Map

## 5 Fixed Semantic Domains

1. **Contamination Control Systems** (core domain)
2. **Hydraulic Efficiency Systems** (specialized)
3. **Diesel Fuel Integrity Systems** (specialized)
4. **Air Intake Filtration Systems** (specialized)
5. **Asset Protection Systems** (meta-domain)

---

## PAGE DOMAIN ASSIGNMENT (1-2 domains per page)

### HUB/LANDING PAGES (Non-Technical)
| Page | Primary Domain | Secondary | Link Types | Notes |
|------|---|---|---|---|
| /knowledge-system | Asset Protection | — | None | Navigation hub only |
| /knowledge-system/bridges | Asset Protection | — | None | Navigation hub only |
| /knowledge-system/standards | Contamination Control | — | None | Navigation hub only |
| /knowledge-system/contamination | Contamination Control | — | None | Navigation hub only |
| /knowledge-system/fleet | Asset Protection | — | None | Navigation hub only |
| /knowledge-system/compare | Asset Protection | — | None | Navigation hub only |
| /knowledge-system/science | Asset Protection | — | None | Navigation hub only |

### BRIDGE PAGES (Reframing/Educational)
| Page | Primary Domain | Secondary | Link Types | Notes |
|------|---|---|---|---|
| /bridges/industrial-filtration | Contamination Control | Asset Protection | Definition, Standards | General → Specific contamination framework |
| /bridges/oem-replacement | Asset Protection | Contamination Control | Operational Impact | Warranty + asset protection lens |
| /bridges/aftermarket-selection | Asset Protection | Contamination Control | Technology | Cost + performance balance |
| /bridges/fleet-solutions | Asset Protection | Contamination Control | Operational Impact | Fleet-wide standardization strategy |

### STANDARDS PAGES — SYSTEMS (Technical Reference)
| Page | Primary Domain | Secondary | Link Types | Notes |
|------|---|---|---|---|
| /standards/lube-oil-systems | Contamination Control | Asset Protection | Failure Mechanism, Technology | ISO 4406/16889 cleanliness targets |
| /standards/air-intake-systems | Air Intake Filtration | Contamination Control | Failure Mechanism, Standards | SAE J1539/ISO 5011 bypass prevention |
| /standards/fuel-systems | Diesel Fuel Integrity | Contamination Control | Failure Mechanism, Technology | ISO 12937/ASTM D6304 water control |
| /standards/hydraulic-systems | Hydraulic Efficiency | Contamination Control | Failure Mechanism, Standards | NFPA T2.14/ISO 16889 proportional valve |
| /standards/cabin-safety-systems | Contamination Control | Asset Protection | Failure Mechanism, Technology | ISO 11155 operator health |
| /standards/compressed-air-systems | Contamination Control | Asset Protection | Failure Mechanism, Standards | ISO 8573-1 purity classes |

### STANDARDS PAGES — STANDARDS REFERENCE (Technical Deep-Dive)
| Page | Primary Domain | Secondary | Link Types | Notes |
|------|---|---|---|---|
| /standards/iso-4406 | Contamination Control | — | Standards, Technology | Cleanliness code definition |
| /standards/iso-5011 | Air Intake Filtration | Contamination Control | Standards, Technology | Air filter Beta ratio testing |
| /standards/iso-16889 | Contamination Control | Hydraulic Efficiency | Standards, Failure Mechanism | Universal Beta ratio framework |

### CONTAMINATION PAGES (Case Studies)
| Page | Primary Domain | Secondary | Link Types | Notes |
|------|---|---|---|---|
| /contamination/particle-wear | Contamination Control | Air Intake Filtration | Failure Mechanism, Technology | Abrasive wear progression |
| /contamination/diesel-water | Diesel Fuel Integrity | Contamination Control | Failure Mechanism, Operational Impact | Water contamination root causes |
| /contamination/hydraulic-system | Hydraulic Efficiency | Contamination Control | Failure Mechanism, Technology | Varnish formation + valve degradation |

### FLEET PAGES (Strategy/Optimization)
| Page | Primary Domain | Secondary | Link Types | Notes |
|------|---|---|---|---|
| /fleet/reducing-downtime | Asset Protection | Contamination Control | Operational Impact, Failure Mechanism | Fleet availability optimization |
| /fleet/fuel-efficiency | Diesel Fuel Integrity | Asset Protection | Operational Impact, Technology | Diesel performance + contamination |
| /fleet/total-cost-ownership | Asset Protection | Contamination Control | Operational Impact, Technology | TCO framework across all systems |

### COMPARE PAGES (System Positioning)
| Page | Primary Domain | Secondary | Link Types | Notes |
|------|---|---|---|---|
| /compare/system-vs-commodity | Asset Protection | Contamination Control | Failure Mechanism, Operational Impact | Why system thinking matters |
| /compare/evaluation-framework | Asset Protection | Contamination Control | Standards, Technology | Decision criteria reframing |
| /compare/oem-comparison | Asset Protection | Contamination Control | Operational Impact, Technology | Brand/spec comparison context |
| /compare/total-cost-ownership | Asset Protection | Contamination Control | Operational Impact, Failure Mechanism | Cost analysis framework |

---

## CONTROLLED LINKING RULES (2-3 link types per page)

### Link Type Definitions & Usage Constraints

**Definition Link** (general → specific)
- Used on: Bridge pages, hub pages, standards pages introducing concepts
- Frequency: 1 per page (max)
- Example: "Industrial Filtration Selection (general) → Lube Oil Systems (specific implementation)"

**Failure Mechanism Link** (causes → consequences)
- Used on: Contamination pages, standards pages showing degradation
- Frequency: 1-2 per page
- Example: "Particle contamination → Particle Wear case study"

**Standards Link** (systems → standards)
- Used on: System domain pages, technical standards pages
- Frequency: 1 per page
- Example: "Lube Oil Systems → ISO 4406/16889 standards definitions"

**Technology Link** (problems → solutions)
- Used on: Contamination pages, standards pages, bridge pages
- Frequency: 1-2 per page
- Example: "Water contamination (problem) → DURATECH/NANOFORCE (solutions)"

**Operational Impact Link** (technical → business outcomes)
- Used on: Fleet pages, compare pages, bridge pages
- Frequency: 1-2 per page
- Example: "Contamination control failures → Fleet downtime reduction page"

---

## LINKING STRATEGY BY PAGE TYPE

### Bridge Pages (Reframing Content)
- industrial-filtration: Definition Link (to standards), Standards Link (ISO codes)
- oem-replacement: Operational Impact Link (to fleet pages), Definition Link
- aftermarket-selection: Technology Link (to tech pages), Operational Impact Link
- fleet-solutions: Operational Impact Link, Technology Link

### Standards Pages (Technical Reference)
- System pages (6): Failure Mechanism Link (to contamination cases), Standards Link (to standard definitions)
- Standard pages (3): Standards Link (to systems), Technology Link (to ELIMFILTERS solutions)

### Contamination Pages (Case Studies)
- particle-wear: Failure Mechanism Link (to air intake), Technology Link (to solutions)
- diesel-water: Failure Mechanism Link (to fuel systems), Operational Impact Link (to fleet impact)
- hydraulic-system: Failure Mechanism Link (to hydraulic systems), Technology Link (to solutions)

### Fleet Pages (Strategy)
- reducing-downtime: Operational Impact Link (to technical root causes), Failure Mechanism Link
- fuel-efficiency: Operational Impact Link, Technology Link
- total-cost-ownership: Operational Impact Link, Technology Link

### Compare Pages (Positioning)
- system-vs-commodity: Failure Mechanism Link, Operational Impact Link
- evaluation-framework: Standards Link, Technology Link
- oem-comparison: Operational Impact Link, Technology Link
- total-cost-ownership: Operational Impact Link, Technology Link

---

## RETRIEVAL SUMMARY BLOCK UPDATES

All pages with Retrieval Summary Block must add:

```
SEMANTIC_DOMAINS: [primary], [secondary] (if applicable)
DOMAIN_AUTHORITY_LINKS: [which pages in domain are linked]
```

Example:
```
SEMANTIC_DOMAINS: contamination_control, asset_protection
DOMAIN_AUTHORITY_LINKS: Lube Oil Systems, Particle Wear in Engines, ISO 16889
```

---

## IMPLEMENTATION SEQUENCE

### Phase 1: Bridge Pages (4 pages)
- industrial-filtration: Add Definition + Standards links
- oem-replacement: Add Operational Impact + Definition links
- aftermarket-selection: Add Technology + Operational Impact links
- fleet-solutions: Add Operational Impact + Technology links

### Phase 2: Standards Pages (9 pages)
- System pages (6): Add Failure Mechanism + Standards links
- Standard pages (3): Add Standards + Technology links

### Phase 3: Contamination Pages (3 pages)
- particle-wear: Add Failure Mechanism + Technology links
- diesel-water: Add Failure Mechanism + Operational Impact links
- hydraulic-system: Add Failure Mechanism + Technology links

### Phase 4: Fleet Pages (3 pages)
- reducing-downtime: Add Operational Impact + Failure Mechanism links
- fuel-efficiency: Add Operational Impact + Technology links
- total-cost-ownership: Add Operational Impact + Technology links

### Phase 5: Compare Pages (4 pages)
- system-vs-commodity: Add Failure Mechanism + Operational Impact links
- evaluation-framework: Add Standards + Technology links
- oem-comparison: Add Operational Impact + Technology links
- total-cost-ownership: Add Operational Impact + Technology links

---

## BUILD TARGET
- 77/77 routes compiled successfully
- No duplicate content
- No semantic domain conflicts
- All links appear in natural content paragraphs
- Retrieval Summary Blocks updated with domain tags

---

## VALIDATION AFTER IMPLEMENTATION
- [ ] Each page assigned to 1-2 domains only
- [ ] Each page has 2-3 link types maximum
- [ ] All links embedded in content paragraphs (not separate nav)
- [ ] All link anchor text describes semantic meaning
- [ ] No hub pages have links (navigation only)
- [ ] Retrieval Summary Blocks include SEMANTIC_DOMAINS tag
- [ ] No keyword stuffing or brand targeting in links
- [ ] Authority hierarchy reinforced (general ← → specific)
