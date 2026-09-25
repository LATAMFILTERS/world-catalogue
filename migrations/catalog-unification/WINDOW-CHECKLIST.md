# Checklist de la ventana: unificación del catálogo en 5432

Alcance: aplicar `01`, `01b`, `02`, `03`, `04`, `05` a `catalogo_elimfilters@5432`. **No incluye** desplegar el search con alias
(rama `search-alias-resolution`), reapuntar CRM/HERMES a 5432 ni retirar 5441/5440: son pasos posteriores con su propia aprobación.
Decisiones vigentes: 60 filas rechazadas quedan fuera (`reports/rejected-skus-20260924.md`); `01b` aprobada; search-api activo durante la ventana.

Ejecuta: Victor (o con él presente). Todas las rutas relativas son de `C:\ELIMSERVER\worktrees\catalog-unification\migrations\catalog-unification`.
Duración medida en ensayo: ~85 s de migraciones; ventana total estimada 30-45 min. **No solapar con 02:00-04:00** (backups Lenovo 02:30 y UGREEN 03:15).

---

## A. Día anterior (T-1)

- [ ] **A1. Dumps frescos + prueba de restauración** (5432 con `elimos_ro`, 5441 en solo lectura):
  ```powershell
  $root = "C:\ELIMSERVER\backups\catalogo_elimfilters\window-$(Get-Date -Format yyyyMMdd)-T1"
  .\rehearsal\dump-and-verify.ps1 -Root $root -Ports 5432,5441
  ```
  ✔ `dump exit=0`, `restore exit=0`, `row-count mismatches=0` en ambos.
- [ ] **A2. Ensayo completo con esos dumps** en 5450:
  ```powershell
  .\rehearsal\full-cycle.ps1 -DumpRoot $root
  ```
  ✔ las 6 migraciones `ok` en UP; DOWN con `mismatched 0`; sonda con `errors=0` y ninguna lectura > 5 s.
- [ ] **A3. Anotar los números esperados** de `validate.txt` del ciclo (SKUs totales, activos, inactivos por motivo, alias por regla,
      rechazados por política, filas HERMES). Son la referencia de la verificación D3.
- [ ] **A4. Search con los datos migrados** (código de producción, copia desechable):
  ```powershell
  .\rehearsal\search-smoke.ps1 -SearchDir C:\ELIMSERVER\worktrees\search-cutover -Database smoke -FromTemplate rehearsal -Cases .\rehearsal\cases-window.csv
  ```
  (`cases-window.csv`: los casos sin alias, porque producción aún no tiene ese código; el fusionado EH650308 da `catalog_scope_excluded`.) ✔ `ALL PASS`.
- [ ] **A5. Avisar congelación**: hora de inicio y fin; nadie escribe en `catalogo_elimfilters@5432` (pgAdmin, sesiones de agentes,
      merges a `world-catalogue/main` que toquen el catálogo).
- [ ] **A6. Go/No-Go** de Victor con A1-A4 en verde.

## B. Inicio de ventana (T0): pausar y comprobar quietud

- [ ] **B1. Pausar tareas** (el search-api **sigue activo**):
  ```powershell
  'ELIMFILTERS-HERMES-Research-Retry','ELIMFILTERS-HERMES-Weekly','ELIMFILTERS-Donaldson-Air-HD-1608-Watchdog','ELIMFILTERS-Lenovo-Monitor' |
    ForEach-Object { Disable-ScheduledTask -TaskName $_ | Select-Object TaskName, State }
  'HERMES Weekly','HERMES Recovery' | ForEach-Object { Disable-ScheduledTask -TaskPath '\ELIMFILTERS\' -TaskName $_ | Select-Object TaskName, State }
  Get-ScheduledTask | Where-Object { $_.TaskName -match 'HERMES|Donaldson|Lenovo-Monitor' } | Get-ScheduledTaskInfo | Select-Object TaskName, LastRunTime, NextRunTime
  ```
  ✔ todas `Disabled`; ninguna ejecutándose (`Get-ScheduledTask ... | Where State -eq Running` vacío).
- [ ] **B2. Sesiones en 5432** (como `elimos_ro`): solo deben quedar el search (`catalog_admin`) y `elimos_ro`.
  ```sql
  SELECT usename, application_name, state, backend_start FROM pg_stat_activity WHERE datname = 'catalogo_elimfilters';
  ```
  ✔ sin `postgres`/pgAdmin ni otros roles.
- [ ] **B3. Quietud**: dos lecturas de escrituras con 5 min de diferencia; solo pueden variar las tablas del search.
  ```sql
  SELECT relname, n_tup_ins + n_tup_upd + n_tup_del AS writes FROM pg_stat_user_tables ORDER BY 2 DESC LIMIT 15;
  ```
  ✔ entre lecturas solo cambia `crossref_resolved_cache` (y tablas de log del search si las hubiera; anotarlas).

## C. Respaldo final y aplicación

- [ ] **C1. Dump final de 5432 + prueba de restauración** (≈1 min):
  ```powershell
  $win = "C:\ELIMSERVER\backups\catalogo_elimfilters\window-$(Get-Date -Format yyyyMMdd-HHmm)-T0"
  .\rehearsal\dump-and-verify.ps1 -Root $win -Ports 5432,5441
  ```
  ✔ exit 0 y `row-count mismatches=0`. Anotar el SHA-256 de `manifest.json`. `$win\5432\source-fingerprint.txt` es la huella previa.
- [ ] **C2. Staging en 5432** (pide la contraseña de `postgres`):
  ```powershell
  .\stage-sources.ps1 -Dump "$win\5441\catalogo_elimfilters.dump" -TargetPort 5432 -TargetUser postgres -TargetDb catalogo_elimfilters
  ```
  ✔ 19 tablas `staged` con los mismos conteos que en el ensayo A2.
- [ ] **C3. Sonda de lecturas contra 5432 durante la aplicación** (solo lectura, `elimos_ro`), en otra consola:
  ```powershell
  $ro = Import-Clixml C:\ELIMSERVER\secrets\elimos-ro.clixml
  $env:DATABASE_URL = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ro.CATALOG_DATABASE_URL))
  node .\rehearsal\read-probe.cjs 300 "$win\probe-5432.json"; $env:DATABASE_URL = $null
  ```
- [ ] **C4. Aplicar** (pide la contraseña de `postgres`; cada migración en su transacción):
  ```powershell
  .\run.ps1 -Direction up -Port 5432 -User postgres -Database catalogo_elimfilters
  ```
  ✔ `01`, `01b`, `02`, `03`, `04`, `05` → `ok`. Si alguna falla: su transacción ya se revirtió sola → ir a **E**.

## D. Verificación (antes de dar la ventana por cerrada)

- [ ] **D1. Sonda** (`$win\probe-5432.json`): `errors=0`; ninguna lectura > 5 s (en ensayo: 1 lectura de ~1 s durante `01`).
- [ ] **D2. Validación en 5432** (sesión de solo lectura como `postgres`, porque lee `catalog_unification`):
  ```powershell
  $env:PGOPTIONS = '-c default_transaction_read_only=on'
  & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -p 5432 -U postgres -d catalogo_elimfilters -X -f .\rehearsal\validate.sql -o "$win\validate-5432.txt"
  $env:PGOPTIONS = $null
  ```
- [ ] **D3. Comparar con A3**: mismos SKUs totales/activos/inactivos, alias por regla, rechazados por política, filas HERMES
      (diferencias solo si 5432 cambió entre T-1 y T0 y están explicadas); `inactive_visible = 0` en la vista activa;
      huérfanos no aumentan respecto a la huella previa.
- [ ] **D4. Search en producción** (sin tocar el servicio; mismo camino que Cloudflare):
  ```powershell
  'ET90011','EH650308','EL36019' | ForEach-Object { curl.exe -s -H 'X-Forwarded-Proto: https' "http://127.0.0.1:8821/api/search?q=$_" }   # -> catalog_scope_excluded
  'ES90463','EH60011','EL30158','EH61084' | ForEach-Object { curl.exe -s -H 'X-Forwarded-Proto: https' "http://127.0.0.1:8821/api/search?q=$_" } # -> exact_sku
  curl.exe -s -o NUL -w '%{http_code}' https://part-search.elimfilters.com/   # -> 200
  ```
  ✔ fuentes esperadas. (Nombres viejos como EF90463 darán `no_match` hasta desplegar la rama de alias: esperado.)

## E. Criterio y procedimiento de reversa

Revertir si ocurre **cualquiera** de:
1. Una migración falla en C4 (se revierte sola; revertir también las ya aplicadas).
2. D1: errores en la sonda o alguna lectura > 5 s sostenida.
3. D3: un número difiere de A3 sin explicación.
4. D4: un caso del search devuelve una fuente distinta a la esperada, o `part-search` no responde 200.
5. En las 48 h siguientes, un error de producto atribuible a la unificación (mientras sigan existiendo las tablas `catalog_unification`).

Procedimiento:
```powershell
.\run.ps1 -Direction down -Port 5432 -User postgres -Database catalogo_elimfilters
$ro = Import-Clixml C:\ELIMSERVER\secrets\elimos-ro.clixml
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ro.Password))
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -p 5432 -U elimos_ro -d catalogo_elimfilters -X -q -f .\rehearsal\fingerprint.sql -o "$win\fingerprint-after-down.txt"
$env:PGPASSWORD = $null
```
✔ comparar con `$win\5432\source-fingerprint.txt`: 0 diferencias salvo `crossref_resolved_cache` (la escribe el search en vivo).
Último recurso si `down` falla: restaurar `$win\5432\catalogo_elimfilters.dump` en una base nueva `catalogo_elimfilters_restore`,
detener el search (`Stop-ScheduledTask -TaskName ELIMFILTERS-Search-Cutover-8821`), intercambiar nombres con `ALTER DATABASE ... RENAME`,
reanudar el search. Nunca restaurar encima de la base viva.

## F. Cierre

- [ ] **F1. Reanudar** Donaldson watchdog y Lenovo-Monitor:
  ```powershell
  'ELIMFILTERS-Donaldson-Air-HD-1608-Watchdog','ELIMFILTERS-Lenovo-Monitor' | ForEach-Object { Enable-ScheduledTask -TaskName $_ | Select-Object TaskName, State }
  ```
- [ ] **F2. HERMES sigue pausado.** Hoy escribe en 5441; tras la ventana sus datos viven en 5432. Reanudarlo solo cuando esté
      reapuntado a 5432 (paso posterior, bloqueado por la regla 4 mientras `world-catalogue` tenga cambios sin commitear).
      Si hay que reanudarlo antes, decidir explícitamente cómo resincronizar `hermes_catalogue_*`.
- [ ] **F3. Avisar fin de congelación.**
- [ ] **F4. Mantener** `unif_src_5441` y `catalog_unification` al menos 48 h (reversa posible). Luego, con aprobación:
      `DROP SCHEMA unif_src_5441 CASCADE;` (las tablas `catalog_unification.*` se conservan como evidencia hasta retirar 5441/5440).
- [ ] **F5. Registrar** en `C:\elimfilters-os\docs\plan-unificacion-catalogo.md`: hora, SHA del dump, salidas de C4/D1-D4.
