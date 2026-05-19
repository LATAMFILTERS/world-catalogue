import psycopg2
import json
import os

DB_URL = "postgresql://postgres:qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm@ballast.proxy.rlwy.net:18263/railway"

def subir_datos():
    if not os.path.exists('resultados.json'):
        print("❌ Error: No existe 'resultados.json'. Corre el scraper primero.")
        return
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        with open('resultados.json', 'r', encoding='utf-8') as f:
            productos = json.load(f)
        
        for prod in productos:
            b_code = prod.get('base_code')
            if not b_code:
                continue
            
            # Generamos el SKU ELIMFILTERS (ED4 + últimos 4 dígitos)
            sku = f"ED4{str(b_code)[-4:]}"
            
            try:
                # 1. Insertar en tabla maestra air_dryers (image_b46dd8.jpg)
                cur.execute("""
                    INSERT INTO air_dryers (base_code, sku_elimfilters, outer_diameter_mm, length_mm, thread_desc)
                    VALUES (%s, %s, %s, %s, %s) 
                    ON CONFLICT (base_code) DO UPDATE SET sku_elimfilters = EXCLUDED.sku_elimfilters
                    RETURNING id
                """, (b_code, sku, prod.get('od'), prod.get('len'), prod.get('t_desc')))
                
                ad_id = cur.fetchone()[0]

                # 2. Cruces (Recordatorio: Códigos sin nombre de fabricante según tus notas)
                if prod.get('cross'):
                    for c in prod['cross']:
                        cur.execute("INSERT INTO air_dryer_cross (air_dryer_id, manufacturer_name, part_number) VALUES (%s, %s, %s)", 
                                    (ad_id, c.get('brand'), c.get('code')))
                
                # 3. Aplicaciones (Equipos)
                if prod.get('apps'):
                    for a in prod['apps']:
                        cur.execute("INSERT INTO air_dryer_apps (air_dryer_id, make, model, engine) VALUES (%s, %s, %s, %s)", 
                                    (ad_id, a.get('make'), a.get('model'), a.get('engine')))
                
                conn.commit()
                print(f"✅ {sku} sincronizado.")
            except Exception as e_inner:
                print(f"⚠️ Error en producto {b_code}: {e_inner}")
                conn.rollback()

        print("🏆 PROCESO FINALIZADO EXITOSAMENTE.")
    except Exception as e:
        print(f"💥 Error crítico: {e}")
    finally:
        if 'conn' in locals(): conn.close()
