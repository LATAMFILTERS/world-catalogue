# Industrial & Process Technical Source Registry

Status: Active  
Scope: Internal engineering provenance for the governed Industrial & Process knowledge domain  
Public brand exposure: Deny by default

## Purpose

This registry maps stable internal evidence identifiers to primary manufacturer or standards sources used to understand filtration mechanisms, element architecture, application boundaries and applicable test methods. It does not authorize ELIMFILTERS product claims, catalogue writes, cross references or supplier branding on public pages.

## Source rules

- Prefer primary manufacturer, standards-body and official technical documentation.
- Manufacturer product figures remain source-specific and do not become universal ELIMFILTERS claims.
- Case-study results remain application-specific.
- Equipment shown by a source may establish process context without becoming an ELIMFILTERS product.
- Public ELIMFILTERS copy must use neutral engineering language unless external brand exposure is separately approved.

## Base-code authority use

This registry supplies evidence; it does not by itself assign base-code authority.

Base identity follows `INDUSTRIAL_PROCESS_REGISTRY.md §53`:

`ORIGINAL_BASE > FAMILY_ANCHOR_BASE > COMPETITOR_CROSS > SOURCE_ONLY`

A confirmed original element always outranks the family anchor. Interchange catalogues are evidence of equivalence, not proof that the interchange manufacturer is the original source.

Approved family-anchor brands are consumed by HERMES from `scripts/hermes/industrial-product-base-policy.mjs`.

## AEREMIS™ — Industrial Air

### EXTERNAL-PRIMARY-CAMFIL-GENERAL-VENTILATION
URL: https://www.camfil.com/en-us/products/general-ventilation-filters  
Scope: general ventilation particulate-filter forms and ISO 16890 / ASHRAE 52.2 classification context.

### EXTERNAL-PRIMARY-CAMFIL-HEPA-ULPA
URL: https://www.camfil.com/en-us/products/epa-hepa--ulpa-filters  
Scope: EPA/HEPA/ULPA application context and ISO 29463 / EN 1822 testing context.

### EXTERNAL-PRIMARY-CAMFIL-MOLECULAR-AIR
URL: https://www.camfil.com/en-us/products/molecular-filters  
Scope: molecular/gas-phase filtration, adsorption media, ISO 10121 context.

### EXTERNAL-PRIMARY-CAMFIL-ISO-10121-3
URL: https://www.camfil.com/en-us/insights/standard-and-regulations/iso-10121-3---2022  
Scope: ISO 10121-3 classification context for molecular air-cleaning devices treating outdoor air.

## PARTION™ — Dust, Fume and Mist Boundary

### EXTERNAL-PRIMARY-DONALDSON-INDUSTRIAL-AIR-TECHNICAL-ARTICLES
URL: https://www.donaldson.com/en/resources/technical-articles/?pg=donaldson:product-group/industrial-air-filtration  
Scope: governed discovery library for dust, fume, mist, media, airflow, differential pressure and collector/filter interactions. HERMES must follow the individual article.

### EXTERNAL-PRIMARY-DONALDSON-INDUSTRIAL-AIR-CASE-STUDIES
URL: https://www.donaldson.com/en/resources/case-studies/?pg=donaldson:product-group/industrial-air-filtration  
Scope: application-specific evidence. HERMES must follow the individual case study and retain process context.

### EXTERNAL-PRIMARY-DONALDSON-DRYFLO-MIST-COLLECTOR-F118137
URL: https://www.donaldson.com/content/dam/donaldson/dust-fume-mist/literature/north-america/equipment/mist-collectors/dryflo/f118137/Dryflo-Mist-Collector.pdf  
Scope: liquid-mist capture, coalescence and drainage architecture; used to maintain the technical boundary between particulate dust/fume and droplet-dominant mist.

## COALVEX™ — Gas Conditioning

### EXTERNAL-PRIMARY-PALL-LIQUID-GAS-COALESCENCE
URL: https://www.pall.com/en/oil-gas/seprasol-plus-liquid-gas-coalescer.html  
Scope: liquid/gas coalescence mechanism, treated fibrous media, droplet growth and drainage.

### EXTERNAL-PRIMARY-PALL-OIL-GAS
URL: https://www.pall.com/en/oil-gas.html  
Scope: gas particulate filtration, liquid/gas coalescence, liquid/liquid separation and process-position context.

## FLUREXIS™ — Fluid Conditioning

### EXTERNAL-PRIMARY-PARKER-PAR-FIT-INTERCHANGE
URL: https://www.parker.com/content/dam/Parker-com/Literature/EMHFF/HFD_Catalog/HFD_Catalog_Par_Fit.pdf  
Scope: official Parker Par Fit interchange catalogue. Used to validate Parker interchange identity and equivalent-element relationships. It explicitly remains interchange evidence when another manufacturer's original element is established.

### EXTERNAL-PRIMARY-PARKER-PAR-FIT-POWER-GENERATION
URL: https://www.parker.com/content/dam/Parker-com/Literature/Power-Generation-Market/PDF-Files/Par-Fit-Filtration.pdf  
Scope: official Parker hydraulic/lube replacement-element application evidence for industrial and power-generation service. Used as primary Parker family-anchor evidence for HYLTRIS™ / LUBREVA™ when original identity is unavailable and the product record is otherwise complete.


### EXTERNAL-PRIMARY-PALL-HYDRAULIC-LUBRICATION
URL: https://www.pall.com/en/industrial-manufacturing/general-industrial/medium-light-hydraulic.html  
Scope: hydraulic particulate filtration and ISO 16889 context.

### EXTERNAL-PRIMARY-PALL-INDUSTRIAL-LUBRICATION
URL: https://www.pall.com/en/industrial-manufacturing/general-industrial/medium-light-lubrication.html  
Scope: industrial lubrication particulate filtration and filter-element architecture.

### EXTERNAL-PRIMARY-PALL-OIL-PURIFICATION
URL: https://www.pall.com/en/industrial-manufacturing/automotive/oil-purifiers1.html  
Scope: oil-purifier family and vacuum-dehydration application context. Product-specific removal percentages are not inherited by DEWATIS™.

### EXTERNAL-PRIMARY-PALL-VARNISH-REMOVAL
URL: https://www.pall.com/en/industrial-manufacturing/blog/varnish-in-oil.html  
Scope: adsorption as a varnish-remediation mechanism and distinction between remediation and particulate filtration.

### EXTERNAL-PRIMARY-PALL-VARNISH-APPLICATION
URL: https://www.pall.com/en/power-generation/solutions/start-up-and-shut-down.html  
Scope: application-specific VRF remediation evidence. Numeric outcomes remain case-specific.

## AQUVEXIS™ — Water Treatment

### EXTERNAL-PRIMARY-PALL-DEPTH-FILTRATION
URL: https://shop.pall.com/us/en/products/filter-cartridges/depth-filters/profile-ii  
Scope: graded-pore depth-filter cartridge construction, particle capture and contaminant-holding architecture.

### EXTERNAL-PRIMARY-DUPONT-WATER-TECHNOLOGIES
URL: https://www.dupont.com/water/technologies.html  
Scope: UF, RO/NF, ion exchange and EDI technology boundaries. DuPont Water Solutions is the approved family anchor for MEMBRAVEX™ ultrafiltration when original identity is unavailable and evidence is complete.

### EXTERNAL-PRIMARY-DUPONT-FILMTEC
URL: https://www.dupont.com/water/technologies/bwro-solutions.html  
Scope: FilmTec™ reverse-osmosis element families and published element specifications. FilmTec is the approved family anchor for MEMBRAVEX™ RO/NF base identity when original identity is unavailable and the exact element evidence is complete.

### EXTERNAL-PRIMARY-DUPONT-ION-EXCHANGE
URL: https://www.dupont.com/water/technologies/ion-exchange-ix.html  
Scope: ion-exchange mechanism and application context. AmberLite™ is the approved IONVEXA™ family anchor when original identity is unavailable and the exact resin/product evidence is complete.

### EXTERNAL-PRIMARY-DUPONT-EDI
URL: https://www.dupont.com/water/technologies/electrodeionization-edi.html  
Scope: continuous DC-assisted ionic polishing after suitable upstream treatment; used as treatment-mechanism evidence, not as an ELIMFILTERS module claim.

### EXTERNAL-PRIMARY-CALGON-ACTIVATED-CARBON
URL: https://www.calgoncarbon.com/products/filtrasorb/  
Scope: granular activated-carbon adsorption in water, wastewater and industrial liquid streams. Supplier product capacity and performance remain source-specific.

## Standards authorities

ISO and ASTM references in canonical knowledge must be checked against the published scope and edition. A standard can support a test or classification method without certifying an ELIMFILTERS product.

## Commercial boundary

Across all five Industrial & Process platforms, the default ELIMFILTERS commercial object is the replaceable filtration/separation/treatment medium or element: filters, cartridges, coalescer elements, depth media, activated-carbon media/elements, membrane elements and ion-exchange media/resins as applicable. Complete collectors, vessels, skids, pumps, fans, ductwork, controls and complete EDI systems remain contextual equipment unless a separate approved ELIMFILTERS system scope exists.
