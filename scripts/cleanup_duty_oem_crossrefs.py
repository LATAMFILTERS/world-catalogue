#!/usr/bin/env python3
"""
cleanup_duty_oem_crossrefs.py
─────────────────────────────
Cleans oem_codes and competitor_codes in elimfilters_catalog by DUTY:
- HD products (EL8x, EA1x, EH6x, EF9x, EC1x, ES9x): remove LD-only manufacturer references
- LD products (EL3x, EA3x, EC3x, EF3x): remove HD-only manufacturer references

Run from the Render shell:
  python3 scripts/cleanup_duty_oem_crossrefs.py
"""

import json
import os
import psycopg2

# ─── MANUFACTURER CLASSIFICATION ──────────────────────────────────────────────

# Manufacturers that ONLY make passenger cars / light commercial vehicles
# Their OEM codes must NEVER appear on HD products
LD_ONLY_MANUFACTURERS = {
    'ALFA ROMEO', 'ALFA-ROMEO', 'ALFAROMEO',
    'CITROEN', 'CITROËN',
    'PEUGEOT',
    'RENAULT',
    'OPEL', 'VAUXHALL',
    'FIAT',                        # Fiat passenger cars (NOT Fiat trucks/industrial)
    'LANCIA',
    'SEAT',
    'SKODA',
    'DACIA',
    'SMART',
    'MINI',
    'CHRYSLER',
    'DODGE',
    'JEEP',
    'HONDA',
    'TOYOTA',                      # Passenger cars (Corolla, Camry — NOT Land Cruiser HD)
    'NISSAN',                      # Passenger cars
    'MAZDA',
    'MITSUBISHI',                  # Passenger cars (NOT Fuso trucks)
    'SUBARU',
    'SUZUKI',
    'KIA',
    'HYUNDAI',
    'DAEWOO',
    'CHEVROLET',                   # Passenger cars (NOT Silverado HD commercial)
    'PONTIAC',
    'OLDSMOBILE',
    'BUICK',
    'SATURN',
    'SAAB',
    'VOLVO',                       # Volvo CARS (NOT Volvo trucks — those are HD)
    'ROVER',
    'LAND ROVER', 'LAND-ROVER',
    'JAGUAR',
    'AUDI',
    'VOLKSWAGEN', 'VW',
    'PORSCHE',
    'BMW',
    'MERCEDES-BENZ',               # Passenger cars (NOT MB trucks/Actros — those are HD)
    'TESLA',
    'LEXUS',
    'INFINITI',
    'ACURA',
    'ISUZU',                       # Passenger / light (NOT Isuzu HD trucks)
    'TRIUMPH',
    'TALBOT',
    'SIMCA',
    'AUSTIN',
    'MORRIS',
    'AUSTIN-ROVER', 'AUSTIN ROVER',
    'INNOCENTI',
    'NSU',
    'WARTBURG',
    'TRABANT',
    'ZAZ',
    'MOSKVICH',
    'LADA',
    'UAZ',
    'CHERY',
    'GEELY',
    'BYD',
    'GREAT WALL', 'GREAT-WALL',
    'PROTON',
    'PERODUA',
    'SSANGYONG',
    'TATA',                        # Passenger / light (NOT Tata HD trucks)
    'MAHINDRA',
    'MARUTI',
    'HINDUSTAN',
    'SEVEL',
}

# Manufacturers that ONLY make heavy duty equipment / trucks / industrial machinery
# Their OEM codes must NEVER appear on LD products
HD_ONLY_MANUFACTURERS = {
    'CATERPILLAR', 'CAT',
    'KOMATSU',
    'JOHN DEERE', 'JOHN-DEERE', 'JOHNDEERE', 'DEERE',
    'LIEBHERR',
    'VOLVO TRUCKS', 'VOLVO-TRUCKS',
    'SCANIA',
    'DAF',
    'IVECO',
    'MAN',
    'MACK',
    'KENWORTH',
    'PETERBILT',
    'FREIGHTLINER',
    'WESTERN STAR', 'WESTERN-STAR',
    'INTERNATIONAL',
    'NAVISTAR',
    'PERKINS',
    'CUMMINS',
    'DETROIT DIESEL', 'DETROIT-DIESEL',
    'DEUTZ',
    'SAME',
    'CLAAS',
    'FENDT',
    'MASSEY FERGUSON', 'MASSEY-FERGUSON',
    'NEW HOLLAND', 'NEW-HOLLAND',
    'CASE IH', 'CASE-IH',
    'ALLIS-CHALMERS',
    'MINNEAPOLIS-MOLINE',
    'OLIVER',
    'WHITE',
    'GLEANER',
    'HESSTON',
    'JCB',
    'BOBCAT',
    'TEREX',
    'GROVE',
    'MANITOWOC',
    'LINK-BELT',
    'KOBELCO',
    'HITACHI CONSTRUCTION', 'HITACHI-CONSTRUCTION',
    'DOOSAN',
    'HYUNDAI CONSTRUCTION',
    'SAMSUNG CONSTRUCTION',
    'LULL',
    'GRADALL',
    'MANITOU',
    'LINDE',
    'YALE',
    'CROWN',
    'RAYMOND',
    'TOYOTA FORKLIFTS',
    'JUNGHEINRICH',
    'STILL',
    'BT INDUSTRIES',
    'HYSTER',
    'KALMAR',
    'TAYLOR',
    'DROTT',
    'FMC',
    'HARNISCHFEGER',
    'P&H',
    'BUCYRUS',
    'MARION',
    'DEMAG',
    'TADANO',
    'FAUN',
    'GOTTWALD',
    'MARINES',
    'AEROQUIP',
    'SULLAIR',
    'INGERSOLL-RAND', 'INGERSOLL RAND',
    'ATLAS COPCO', 'ATLAS-COPCO',
    'COMPAIR',
    'GARDNER DENVER', 'GARDNER-DENVER',
    'QUINCY',
    'LEROI',
    'WORTHINGTON',
    'ALLIS-CHALMERS',
    'DRESSER',
    'ROOTS',
    'ELGIN',
    'GRADALL',
    'BARBER-GREENE',
    'BLAW-KNOX',
    'CHAMPION',
    'AUSTIN-WESTERN',
    'GALION',
    'MICHIGAN',
    'HOUGH',
    'PETTIBONE',
    'CLARK EQUIPMENT', 'CLARK-EQUIPMENT',
    'FIAT ALLIS', 'FIAT-ALLIS',
    'FIAT HITACHI', 'FIAT-HITACHI',
    'CNH',
    'BELL EQUIPMENT', 'BELL-EQUIPMENT',
    'VOLVO CE', 'VOLVO-CE',
    'SAMSUNG-HEAVY',
    'DAEWOO CONSTRUCTION', 'DAEWOO-HEAVY',
}


def normalize_mfr(mfr):
    return mfr.strip().upper() if mfr else ''


def is_ld_only(mfr):
    n = normalize_mfr(mfr)
    return n in LD_ONLY_MANUFACTURERS


def is_hd_only(mfr):
    n = normalize_mfr(mfr)
    return n in HD_ONLY_MANUFACTURERS


def get_sku_prefix(sku):
    return sku[:3].upper() if sku else ''


HD_PREFIXES = {'EL8', 'EA1', 'EH6', 'EF9', 'EC1', 'ES9', 'ED4', 'EM9', 'EW7'}
LD_PREFIXES = {'EL3', 'EA3', 'EC3', 'EF3'}


def is_hd_sku(sku):
    return get_sku_prefix(sku) in HD_PREFIXES


def is_ld_sku(sku):
    return get_sku_prefix(sku) in LD_PREFIXES


def clean_refs(refs, remove_fn):
    """Remove entries where manufacturer matches remove_fn. Return (cleaned, removed_count)."""
    if not refs or not isinstance(refs, list):
        return refs, 0
    cleaned = []
    removed = 0
    for entry in refs:
        mfr = ''
        if isinstance(entry, dict):
            mfr = entry.get('manufacturer') or entry.get('brand') or ''
        elif isinstance(entry, str):
            # Format: "BRAND:CODE" or plain code
            if ':' in entry:
                mfr = entry.split(':')[0]
        if remove_fn(mfr):
            removed += 1
        else:
            cleaned.append(entry)
    return cleaned, removed


def main():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print('ERROR: DATABASE_URL not set')
        return

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    print('Fetching all products with oem_codes or competitor_codes...')
    cur.execute("""
        SELECT sku, duty, oem_codes, competitor_codes
        FROM elimfilters_catalog
        WHERE (oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0)
           OR (competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0)
    """)
    rows = cur.fetchall()
    print(f'  {len(rows)} products to scan')

    hd_cleaned = 0
    ld_cleaned = 0
    hd_refs_removed = 0
    ld_refs_removed = 0
    errors = []

    for sku, duty, oem_codes, competitor_codes in rows:
        if not sku:
            continue

        oem = oem_codes if isinstance(oem_codes, list) else []
        comp = competitor_codes if isinstance(competitor_codes, list) else []

        new_oem, new_comp = oem, comp
        oem_removed = comp_removed = 0

        if is_hd_sku(sku) or duty == 'HEAVY_DUTY':
            # Remove LD-only manufacturer references from HD products
            new_oem, r1 = clean_refs(oem, is_ld_only)
            new_comp, r2 = clean_refs(comp, is_ld_only)
            oem_removed, comp_removed = r1, r2
            if r1 + r2 > 0:
                hd_cleaned += 1
                hd_refs_removed += r1 + r2

        elif is_ld_sku(sku) or duty == 'LIGHT_DUTY':
            # Remove HD-only manufacturer references from LD products
            new_oem, r1 = clean_refs(oem, is_hd_only)
            new_comp, r2 = clean_refs(comp, is_hd_only)
            oem_removed, comp_removed = r1, r2
            if r1 + r2 > 0:
                ld_cleaned += 1
                ld_refs_removed += r1 + r2

        if oem_removed + comp_removed > 0:
            try:
                cur.execute(
                    """UPDATE elimfilters_catalog
                       SET oem_codes = %s::jsonb, competitor_codes = %s::jsonb
                       WHERE sku = %s""",
                    (json.dumps(new_oem), json.dumps(new_comp), sku)
                )
            except Exception as e:
                errors.append(f'{sku}: {e}')
                conn.rollback()
                continue

    conn.commit()
    cur.close()
    conn.close()

    print('\n── CLEANUP COMPLETE ──────────────────────────────')
    print(f'  HD products cleaned: {hd_cleaned}  ({hd_refs_removed} LD refs removed)')
    print(f'  LD products cleaned: {ld_cleaned}  ({ld_refs_removed} HD refs removed)')
    if errors:
        print(f'  Errors ({len(errors)}):')
        for e in errors[:10]:
            print(f'    {e}')
    print('─────────────────────────────────────────────────')


if __name__ == '__main__':
    main()
