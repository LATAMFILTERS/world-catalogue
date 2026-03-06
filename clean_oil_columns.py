from pymongo import MongoClient
import re

client = MongoClient('mongodb+srv://vabreu_db_user:Kleo2026@cluster0.vairwow.mongodb.net/ELIMFILTERS_DB?retryWrites=true&w=majority')
col = client['ELIMFILTERS_DB']['unified_filters']

EMPTY = {'', 'N/A', 'n/a', 'NA', 'na', 'None', 'none', '-', '---', 'nan', 'null'}

def is_empty(val):
    return val is None or str(val).strip() in EMPTY

# ─── 1. Filter Type homologation ───
FILTER_TYPE_MAP = {
    'Full-Flow': 'Oil Filter', 'Lube Filter': 'Oil Filter',
    'FILTER': 'Oil Filter', 'Engine': 'Oil Filter',
    'OIL': 'Oil Filter',
    'Bypass': 'Oil Filter',
}
# Solo aplica a filterType OIL
oil_docs = list(col.find({'filterType': 'OIL'}, {'_id': 1, 'Filter Type': 1}))
ft_updated = 0
for doc in oil_docs:
    ft = str(doc.get('Filter Type', '') or '').strip()
    new_ft = FILTER_TYPE_MAP.get(ft, 'Oil Filter')
    if ft != new_ft:
        col.update_one({'_id': doc['_id']}, {'$set': {'Filter Type': new_ft}})
        ft_updated += 1
print(f'Filter Type corregidos: {ft_updated}')

# ─── 2. Subtype homologation ───
SUBTYPE_MAP = {
    'SPIN-ON': 'SPIN-ON (FULL FLOW)',
    'ENROSCABLE': 'SPIN-ON (FULL FLOW)',
    'ENROSCABLE / FLUJO PLENO': 'SPIN-ON (FULL FLOW)',
    'ENROSCABLE / CARTUCHO': 'SPIN-ON (FULL FLOW)',
    'ENROSCABLE / F': 'SPIN-ON (FULL FLOW)',
    'CARTRIDGE': 'CARTUCHO',
    'CARTUCHO': 'CARTUCHO',
    'PANEL': None,  # eliminar - no aplica a OIL
}
st_updated = 0
for doc in oil_docs:
    full = col.find_one({'_id': doc['_id']}, {'Subtype': 1})
    st = str(full.get('Subtype', '') or '').strip()
    if st in SUBTYPE_MAP:
        new_st = SUBTYPE_MAP[st]
        if new_st:
            col.update_one({'_id': doc['_id']}, {'$set': {'Subtype': new_st}})
        else:
            col.update_one({'_id': doc['_id']}, {'$unset': {'Subtype': ''}})
        st_updated += 1
print(f'Subtype corregidos: {st_updated}')

# ─── 3. Thread Size - limpiar basura ───
VALID_THREAD = re.compile(
    r'^('
    r'\d+/\d+-\d+(\s+UN[A-Z]*(-\d+[A-Z])?)?'  # 3/4-16 UN, 13/16-16 UNF
    r'|M\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?'     # M16 x 1.5
    r'|\d+\s+\d+/\d+-\d+(\s+UN)?'               # 1 1/2-12 UN
    r'|\d+-\d+(\s+UN)?'                          # 1-12 UN
    r'|\d+/\d+\s+(NPT|BSP|BSP/G)'               # 3/4 NPT
    r'|\d+\s+(NPT|BSP)'                          # 2 NPT
    r')$',
    re.IGNORECASE
)

ts_docs = list(col.find({'filterType': 'OIL', 'Thread Size': {'$exists': True, '$ne': None}}))
ts_cleaned = 0
for doc in ts_docs:
    ts = str(doc.get('Thread Size', '') or '').strip()
    if is_empty(ts):
        continue
    # Si es muy largo (texto basura del scraper) → limpiar
    if len(ts) > 30 or ts.startswith('-') or '>' in ts or 'oil filter' in ts.lower():
        col.update_one({'_id': doc['_id']}, {'$set': {'Thread Size': 'N/A'}})
        ts_cleaned += 1
    elif ts in ('Standard', 'Metric', 'Round', 'Panel'):
        col.update_one({'_id': doc['_id']}, {'$set': {'Thread Size': 'N/A'}})
        ts_cleaned += 1
    # Normalizar M16x1.5 -> M16 x 1.5
    elif re.match(r'M\d+x\d', ts):
        normalized = re.sub(r'([Mm]\d+)x(\d)', r'\1 x \2', ts)
        col.update_one({'_id': doc['_id']}, {'$set': {'Thread Size': normalized}})
        ts_cleaned += 1
    # M16 X 1.5. -> M16 x 1.5
    elif ts.endswith('.') and 'M' in ts:
        col.update_one({'_id': doc['_id']}, {'$set': {'Thread Size': ts.rstrip('.')}})
        ts_cleaned += 1
print(f'Thread Size limpiados: {ts_cleaned}')

# ─── 4. ISO Test Method - limpiar basura ───
ISO_PATTERN = re.compile(r'(ISO\s+\d{4,6}[-\d]*|SAE\s+[JH]\d{3,4}|JIS\s+D\s+\d{4})', re.IGNORECASE)
iso_docs = list(col.find({'filterType': 'OIL', 'ISO Test Method': {'$exists': True, '$ne': None}}))
iso_cleaned = 0
for doc in iso_docs:
    iso = str(doc.get('ISO Test Method', '') or '').strip()
    if is_empty(iso):
        continue
    # Si es texto largo/basura, extraer solo el estandar
    if len(iso) > 30 or '>' in iso or 'Filter Cross' in iso:
        m = ISO_PATTERN.search(iso)
        if m:
            col.update_one({'_id': doc['_id']}, {'$set': {'ISO Test Method': m.group(1).strip()}})
        else:
            col.update_one({'_id': doc['_id']}, {'$set': {'ISO Test Method': 'N/A'}})
        iso_cleaned += 1
print(f'ISO Test Method limpiados: {iso_cleaned}')

print('\nVerificando...')
print('Filter Type distintos OIL:', col.distinct('Filter Type', {'filterType': 'OIL'}))
print('Subtype distintos OIL:', col.distinct('Subtype', {'filterType': 'OIL'}))
client.close()
