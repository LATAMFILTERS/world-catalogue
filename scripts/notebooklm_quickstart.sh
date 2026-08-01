#!/bin/bash

# NotebookLM Quick Start - Configuración automática del sistema
# de documentación externa para protección de activos

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  NotebookLM Asset Protection Documentation Setup         ║${NC}"
echo -e "${BLUE}║  ELIMFILTERS Knowledge Center External Sources           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Paso 1: Verificar dependencias
echo -e "${YELLOW}[1/6]${NC} Verificando dependencias..."

if ! command -v notebooklm &> /dev/null; then
    echo -e "${RED}✗${NC} notebooklm no está instalado"
    echo "  Instala con: pip install notebooklm-py"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗${NC} python3 no está disponible"
    exit 1
fi

echo -e "${GREEN}✓${NC} Dependencias OK (notebooklm, python3)\n"

# Paso 2: Verificar autenticación
echo -e "${YELLOW}[2/6]${NC} Verificando autenticación NotebookLM..."

if notebooklm status &> /dev/null; then
    echo -e "${GREEN}✓${NC} Ya autenticado\n"
else
    echo -e "${YELLOW}⚠${NC} NotebookLM requiere autenticación"
    echo -e "\n${BLUE}Abre tu navegador y completa el login:${NC}\n"
    notebooklm login
    echo ""
fi

# Paso 3: Exportar lista de fuentes
echo -e "${YELLOW}[3/6]${NC} Exportando lista de fuentes externas..."

python3 scripts/notebooklm_asset_protection.py --export-sources

echo -e "${GREEN}✓${NC} Fuentes exportadas a docs/external_sources.md\n"

# Paso 4: Opción de crear notebook
echo -e "${YELLOW}[4/6]${NC} Configuración del notebook..."

read -p "¿Crear nuevo notebook de protección de activos? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    python3 scripts/notebooklm_asset_protection.py --create-notebook
    echo -e "${GREEN}✓${NC} Notebook creado\n"
else
    echo -e "${YELLOW}⚠${NC} Omitido - créalo manualmente si es necesario\n"
fi

# Paso 5: Opción de agregar fuentes
read -p "¿Agregar fuentes externas al notebook? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "\n${BLUE}Esto puede tardar unos minutos...${NC}\n"
    python3 scripts/notebooklm_asset_protection.py --add-sources
    echo -e "\n${GREEN}✓${NC} Fuentes agregadas\n"
else
    echo -e "${YELLOW}⚠${NC} Omitido - agrégalas manualmente si es necesario\n"
fi

# Paso 6: Resumen y próximos pasos
echo -e "${YELLOW}[5/6]${NC} Generando lista de notebooks..."
echo ""
notebooklm list
echo ""

echo -e "${YELLOW}[6/6]${NC} Resumen de configuración"
echo -e "${GREEN}✓${NC} Sistema listo para generar análisis\n"

echo -e "${BLUE}Próximos pasos:${NC}"
echo ""
echo -e "  1. ${BLUE}Ver fuentes disponibles:${NC}"
echo "     cat docs/external_sources.md"
echo ""
echo -e "  2. ${BLUE}Generar análisis por dominio:${NC}"
echo "     python3 scripts/notebooklm_asset_protection.py --generate-report contamination"
echo "     python3 scripts/notebooklm_asset_protection.py --generate-report hydraulic_systems"
echo "     python3 scripts/notebooklm_asset_protection.py --generate-report fuel_systems"
echo ""
echo -e "  3. ${BLUE}Ver documentación completa:${NC}"
echo "     cat docs/NOTEBOOKLM_SETUP.md"
echo ""
echo -e "  4. ${BLUE}Integrar análisis en Knowledge Center:${NC}"
echo "     # Revisar docs/external_analysis_*.md"
echo "     # Enriquecer /frontend/src/app/knowledge-system/ con hallazgos"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Configuración completada${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"
