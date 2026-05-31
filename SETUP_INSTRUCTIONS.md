# 🚀 INSTRUCCIONES DE CONFIGURACIÓN - ELIMFILTERS

**Fecha**: May 21, 2026  
**Estado**: Ready for Configuration  
**Tiempo Estimado**: 15-20 minutos  

---

## 📋 REQUISITOS PREVIOS

✅ Servidor Node.js corriendo en puerto 8080  
✅ Frontend compilado (43 páginas + 11 idiomas)  
⚠️ Database credentials de Railway  
⚠️ Email credentials de GoDaddy  

---

## 🔑 PASO 1: Obtener Credenciales de Railway

### 1.1 Acceder a Railway Dashboard
```
URL: https://railway.app/dashboard
```

### 1.2 Copiar DATABASE_URL
```
1. Ir a Settings → Variables
2. Copiar el valor de DATABASE_URL
3. Debería verse como:
   postgresql://user:password@ballast.proxy.rlwy.net:18263/railway
```

### 1.3 Obtener credenciales GoDaddy
```
1. GoDaddy Email: info@elimfilters.com
2. Host SMTP: smtpout.secureserver.net
3. Puerto: 465
4. Username: info@elimfilters.com
5. Password: (Solicitar a usuario/admin)
```

---

## 🔐 PASO 2: Crear Variables de Entorno

### 2.1 Crear `.env.local` (NO subir a Git)
```bash
cd /home/user/world-catalogue

# Copiar template
cp .env.example .env.local

# Editar con credenciales reales
nano .env.local
```

### 2.2 Contenido de `.env.local`
```
# Server
PORT=8080
NODE_ENV=development

# Database - CRÍTICO
DATABASE_URL=postgresql://user:password@ballast.proxy.rlwy.net:18263/railway

# Email - CRÍTICO
GODADDY_MAIL_PASS=tu_contraseña_godaddy_aqui

# Analytics
GOOGLE_ANALYTICS_ID=G-T7STY4TY9C

# API Keys (si aplica)
GROQ_API_KEY=gsk_...
```

### 2.3 Verificar .gitignore
```bash
# Asegurar que .env.local está ignorado
cat .gitignore | grep ".env"

# Si no está, agregar:
echo ".env.local" >> .gitignore
echo ".env.backup" >> .gitignore
git add .gitignore
git commit -m "security: Ensure env files are ignored"
git push
```

---

## ⚙️ PASO 3: Cargar Variables en el Servidor

### 3.1 Opción A: Archivo .env local
```bash
# Exportar variables
export $(cat .env.local | xargs)

# Verificar
echo $DATABASE_URL
echo $GODADDY_MAIL_PASS
```

### 3.2 Opción B: Railway Dashboard (RECOMENDADO)
```
1. Ir a https://railway.app/dashboard
2. Ir a Variables
3. Agregar/actualizar:
   - DATABASE_URL (ya debería estar)
   - GODADDY_MAIL_PASS
   - NODE_ENV=production
4. Guardar
5. Railway redesplegará automáticamente
```

### 3.3 Opción C: Docker/Local con docker-compose
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://...
      - GODADDY_MAIL_PASS=...
      - PORT=8080
```

---

## ✅ PASO 4: Reiniciar y Verificar

### 4.1 Detener servidor anterior
```bash
# Buscar proceso
ps aux | grep "node server.js"

# Matar proceso (PID)
kill 5748

# O usar:
pkill -f "node server.js"
```

### 4.2 Iniciar servidor con variables
```bash
# Opción 1: Cargar desde .env.local
source .env.local
npm start

# Opción 2: Inline
DATABASE_URL=postgresql://... GODADDY_MAIL_PASS=... npm start

# Opción 3: Via node directamente
DATABASE_URL=postgresql://... node server.js
```

### 4.3 Verificar logs
```bash
# Debería aparecer:
[server] ✅ Listening on port 8080
[server] ✅ ELIMFILTERS API ready

# SIN estos errores:
# [api/search] connect ETIMEDOUT
# [contact] Connection timeout
```

---

## 🧪 PASO 5: Ejecutar Pruebas de Endpoints

### 5.1 Health Check
```bash
curl http://localhost:8080/api/status

# Esperado:
{"status":"ok","version":"3.4.0"}
```

### 5.2 Search Endpoint (Base de Datos)
```bash
curl "http://localhost:8080/api/search?q=air"

# Esperado (HTTP 200):
{"products":[...],"count":X}

# O con fallback graceful si la BD no responde
```

### 5.3 Contact Form (Email)
```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "This is a test message"
  }'

# Esperado (HTTP 200):
{"ok":true}

# O con error si GODADDY_MAIL_PASS no está configurada
```

### 5.4 Stats Endpoint (Base de Datos)
```bash
curl http://localhost:8080/api/stats

# Esperado (HTTP 200):
{"total":1234,"technologies":50,"timestamp":"2026-05-21T..."}
```

---

## 🔍 TROUBLESHOOTING

### Error: "connect ETIMEDOUT 66.33.22.248:18263"
```
Causa: DATABASE_URL no está configurada
Solución:
  1. Verificar .env.local existe
  2. Verificar DATABASE_URL está en variables
  3. Reiniciar servidor
```

### Error: "Failed to send email"
```
Causa: GODADDY_MAIL_PASS no está configurada
Solución:
  1. Verificar .env.local tiene GODADDY_MAIL_PASS
  2. Verificar contraseña es correcta
  3. Reiniciar servidor
```

### Error: "Cannot find module './routes/knowledge.routes'"
```
Causa: Archivo opcional no existe (no es crítico)
Solución: Ignorar - sistema funciona con fallback
```

### El servidor inicia pero no responde a peticiones
```
Causa: Puerto 8080 podría estar en uso
Solución:
  1. Cambiar PORT en .env.local
  2. O matar proceso anterior: pkill -f "node server.js"
```

---

## 📊 CHECKLIST DE CONFIGURACIÓN

```
□ Obtener DATABASE_URL de Railway
□ Obtener GODADDY_MAIL_PASS de GoDaddy
□ Crear .env.local con credenciales
□ Verificar .env.local en .gitignore
□ Revisar SECURITY_AUDIT.md para revocar credenciales en .env.backup
□ Detener servidor anterior
□ Cargar variables de entorno
□ Iniciar servidor: npm start
□ Verificar sin ETIMEDOUT en logs
□ Test /api/status → HTTP 200
□ Test /api/search → HTTP 200 o error graceful
□ Test /api/contact → HTTP 200 o error graceful
□ Verificar email llegó a info@elimfilters.com
□ Confirmación: Sistema ✅ LISTO PARA PRODUCCIÓN
```

---

## 🚀 PRÓXIMO PASO: DEPLOYMENT

Una vez configurado localmente:
```bash
# 1. Hacer commit
git add .
git commit -m "chore: Update environment configuration"
git push origin main

# 2. Desplegar a Railway
git push origin main:production

# 3. Railway redesplegará automáticamente
# Monitorear en: https://railway.app/dashboard
```

---

## 📞 CONTACTO PARA DUDAS

Si hay problemas de configuración:
1. Revisar HEALTH_REPORT.md
2. Revisar SECURITY_AUDIT.md
3. Ejecutar las pruebas de endpoints
4. Verificar credenciales están correctas

---

**Última Actualización**: May 21, 2026  
**Versión**: 1.0  
**Tiempo Total Estimado**: 15-20 minutos
