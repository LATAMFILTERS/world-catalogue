import json, os, collections
GAP=r'C:\Users\ELIMSERVER\world-catalogue\elimfilters-vault\91-private-evidence\fram-ld-gap-analysis\fram-ld-gap-2026-09-13T18-11-39-349Z.json'
OUT=r'C:\Users\ELIMSERVER\world-catalogue\tmp_fram_collision_reclassify.json'

def norm(v):
    return ''.join(ch for ch in str(v or '').upper() if ch.isalnum())

def loadmeta(r):
    d=json.load(open(r['file'],encoding='utf-8'))
    p=d.get('public_catalog_proposal',{})
    s=p.get('technical_specifications',{})
    aa=collections.defaultdict(list)
    for a in d.get('internal_evidence',{}).get('raw_attributes',[]): aa[a.get('attribute')].append(a.get('value'))
    return {'authority':r['authority'],'sku':r['proposedSku'],'line':d.get('authority',{}).get('line'),'style':s.get('style'),'media':s.get('media_type'),'height':s.get('height_mm'),'od':s.get('outer_diameter_mm'),'thread':s.get('thread_size'),'grade':(aa.get('Grade Type') or [None])[0],'raw_media':(aa.get('Filter Media Material') or [None])[0],'reusable':(aa.get('Reusable') or [None])[0],'washable':(aa.get('Washable') or [None])[0],'apps':p.get('vehicle_application_candidates',[]),'refs':p.get('competitor_cross_reference_candidates',[])+p.get('oem_cross_reference_candidates',[]),'alts':p.get('alternatives',[])}

def pairclass(a,b):
    diffs=[]
    for k in ['line','style','raw_media','grade','reusable','washable']:
        if a.get(k) and b.get(k) and norm(a[k])!=norm(b[k]): diffs.append(k)
    spec_conf=0
    for k in ['height','od']:
        x,y=a.get(k),b.get(k)
        if x is not None and y is not None and abs(float(x)-float(y))>0.6: spec_conf+=1
    if a.get('thread') and b.get('thread') and norm(a['thread'])!=norm(b['thread']): spec_conf+=1
    ak=lambda x:(norm(x.get('make')),norm(x.get('model')),str(x.get('year') or '').strip(),norm(x.get('engine')))
    rk=lambda x:(norm(x.get('manufacturer')),norm(x.get('part_number')))
    A={ak(x) for x in a['apps']}; B={ak(x) for x in b['apps']}
    RA={rk(x) for x in a['refs']}; RB={rk(x) for x in b['refs']}
    alt=norm(b['authority']) in {norm(x) for x in a['alts']} or norm(a['authority']) in {norm(x) for x in b['alts']}
    return {'diffs':diffs,'spec_conf':spec_conf,'app_i':len(A&B),'app_a':len(A),'app_b':len(B),'ref_i':len(RA&RB),'alt':alt}

r=json.load(open(GAP,encoding='utf-8'))
rows=[x for x in r['results'] if x['status']=='FRAM_SKU_COLLISION']
meta={x['authority']:loadmeta(x) for x in rows}
groups=collections.defaultdict(list)
for x in rows: groups[x['proposedSku']].append(x['authority'])
out=[]
for sku,auths in groups.items():
    pairs=[]
    for i in range(len(auths)):
        for j in range(i+1,len(auths)): pairs.append(pairclass(meta[auths[i]],meta[auths[j]]))
    definite=any(p['diffs'] or p['spec_conf']>0 for p in pairs)
    strong_alias=(not definite) and pairs and all((p['alt'] or p['app_i']>=2 or p['ref_i']>=2) for p in pairs)
    state='distinct' if definite else ('alias_evidence' if strong_alias else 'unresolved')
    out.append({'sku':sku,'authorities':auths,'state':state,'pairs':pairs})
print(json.dumps({'groups':len(out),'rows':len(rows),'counts':dict(collections.Counter(x['state'] for x in out)),'unresolved':[x for x in out if x['state']=='unresolved']},indent=2))
json.dump({'all':out},open(OUT,'w',encoding='utf-8'),indent=2)
