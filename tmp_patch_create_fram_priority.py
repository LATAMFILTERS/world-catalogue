from pathlib import Path
p=Path(r'C:\Users\ELIMSERVER\world-catalogue\scripts\hermes\create-fram-ld-gap-products.js')
s=p.read_text(encoding='utf-8')
old="""    const planOwners=new Map();
    for(const x of plan.comp){const k=norm(x.brand)+'|'+norm(x.part);if(!planOwners.has(k))planOwners.set(k,new Set());planOwners.get(k).add(x.sku)}
    const compRows=[]; let existingConflicts=0,intraConflicts=0;
    for(const x of plan.comp){
      const k=norm(x.brand)+'|'+norm(x.part), old=owner.get(k)||new Set(), own=planOwners.get(k)||new Set();
      if([...old].some(s=>s!==x.sku)){if(x.canonical)throw new Error(`CANONICAL_FRAM_CONFLICT ${x.part}`);existingConflicts++;continue}
      if(own.size>1){if(x.canonical)throw new Error(`CANONICAL_PLAN_CONFLICT ${x.part}`);intraConflicts++;continue}
      if(x.brand&&x.part)compRows.push({elimfilters_sku:x.sku,source_sku:x.source,competitor_brand:x.brand,competitor_part_number:x.part});
    }
"""
new="""    const planOwners=new Map(), canonicalPlanOwner=new Map();
    for(const x of plan.comp){const k=norm(x.brand)+'|'+norm(x.part);if(!planOwners.has(k))planOwners.set(k,new Set());planOwners.get(k).add(x.sku);if(x.canonical){if(canonicalPlanOwner.has(k)&&canonicalPlanOwner.get(k)!==x.sku)throw new Error(`CANONICAL_PLAN_DUPLICATE ${x.part}`);canonicalPlanOwner.set(k,x.sku);}}
    const compRows=[]; let existingConflicts=0,intraConflicts=0;
    for(const x of plan.comp){
      const k=norm(x.brand)+'|'+norm(x.part),old=owner.get(k)||new Set(),own=planOwners.get(k)||new Set(),canonicalOwner=canonicalPlanOwner.get(k);
      if([...old].some(s=>s!==x.sku)){if(x.canonical)throw new Error(`CANONICAL_FRAM_CONFLICT ${x.part}`);existingConflicts++;continue}
      if(canonicalOwner&&canonicalOwner!==x.sku){if(x.canonical)throw new Error(`CANONICAL_PLAN_CONFLICT ${x.part}`);intraConflicts++;continue}
      if(!canonicalOwner&&own.size>1){intraConflicts++;continue}
      if(x.brand&&x.part)compRows.push({elimfilters_sku:x.sku,source_sku:x.source,competitor_brand:x.brand,competitor_part_number:x.part});
    }
"""
if old not in s: raise SystemExit('target block not found')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('PATCH_OK')