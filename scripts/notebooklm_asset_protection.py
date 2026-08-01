#!/usr/bin/env python3
"""
NotebookLM Asset Protection Documentation System

Integra fuentes externas confiables sobre degradación de activos industriales,
contaminación, y protección mediante filtración. Genera documentación analítica
que enriquece el Knowledge Center.

Uso:
    python scripts/notebooklm_asset_protection.py --setup
    python scripts/notebooklm_asset_protection.py --create-notebook "Knowledge Center - External Sources"
    python scripts/notebooklm_asset_protection.py --add-sources
    python scripts/notebooklm_asset_protection.py --generate-report contamination
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime

# Fuentes externas confiables sobre protección de activos industriales
EXTERNAL_SOURCES = {
    "ISO_Standards": [
        {
            "title": "ISO 16889:2024 - Beta Ratio Filter Testing",
            "url": "https://www.iso.org/standard/83465.html",
            "category": "Hydraulic Filtration",
            "description": "Standard for testing and rating hydraulic filters by particle size efficiency"
        },
        {
            "title": "ISO 4406:2024 - Cleanliness Code Classification",
            "url": "https://www.iso.org/standard/83410.html",
            "category": "Oil Contamination",
            "description": "Defines particle cleanliness codes for industrial oils (ISO 4406 16/14/11 notation)"
        },
        {
            "title": "ISO 5011 - Air Intake Filter Testing",
            "url": "https://www.iso.org/standard/38646.html",
            "category": "Air Filtration",
            "description": "Method for testing and reporting performance of engine air intake filters"
        },
    ],

    "Academic_Research": [
        {
            "title": "Tribological Analysis of Particulate Wear in Industrial Engines",
            "url": "https://scholar.google.com/scholar?q=particle+wear+bearing+surfaces+industrial+engines",
            "category": "Particle Wear Mechanisms",
            "description": "Research on abrasive and adhesive wear mechanisms caused by particle contamination"
        },
        {
            "title": "Microbial Growth in Diesel Fuel Systems - Prevention and Detection",
            "url": "https://scholar.google.com/scholar?q=microbial+contamination+diesel+fuel+tanks",
            "category": "Fuel Contamination",
            "description": "Studies on bacteria, fungus, and algae growth in fuel systems and prevention strategies"
        },
        {
            "title": "Hydraulic System Reliability - Role of Contamination Control",
            "url": "https://scholar.google.com/scholar?q=hydraulic+system+contamination+proportional+valve",
            "category": "Hydraulic Protection",
            "description": "Research linking cleanliness targets to valve lifespan and failure rates"
        },
    ],

    "Industry_Standards_Bodies": [
        {
            "title": "ISO/TC 131 - Fluid power systems and components",
            "url": "https://www.iso.org/committee/45874.html",
            "category": "Hydraulic Systems",
            "description": "Technical committee overseeing hydraulic and fluid power standards"
        },
        {
            "title": "SAE J1539 - Air Filter Test Standards for Engines",
            "url": "https://www.sae.org/standards/content/j1539/",
            "category": "Air Filtration",
            "description": "SAE standards for evaluating engine air filter performance and efficiency"
        },
        {
            "title": "ASTM D6304 - Water in Diesel Fuel",
            "url": "https://www.astm.org/d6304-22.html",
            "category": "Fuel Quality",
            "description": "Standard method for measuring water content in diesel fuel using Karl Fischer"
        },
    ],

    "Equipment_Manufacturer_Resources": [
        {
            "title": "Bearing Lifespan and Cleanliness Correlation - SKF Publication",
            "url": "https://www.skf.com/us/en/products/bearings/",
            "category": "Bearing Protection",
            "description": "Manufacturer data on how oil cleanliness extends bearing operational life"
        },
        {
            "title": "Cummins Diesel Engine Filtration Requirements",
            "url": "https://cumminsfilters.com/",
            "category": "Engine Protection",
            "description": "OEM specifications for lube oil, air, and fuel filtration in diesel engines"
        },
        {
            "title": "Parker Hydraulic System Contamination Guide",
            "url": "https://www.parker.com/en/US/products/filtration",
            "category": "Hydraulic Systems",
            "description": "Technical guides on contamination control in hydraulic power systems"
        },
    ],

    "Cost_of_Ownership_Studies": [
        {
            "title": "Total Cost of Ownership - Fleet Maintenance Analysis",
            "url": "https://scholar.google.com/scholar?q=total+cost+ownership+fleet+maintenance",
            "category": "Fleet Economics",
            "description": "Analysis of how contamination control reduces lifecycle costs of equipment"
        },
        {
            "title": "Downtime and Equipment Failure Correlation Study",
            "url": "https://scholar.google.com/scholar?q=industrial+equipment+downtime+failure+prevention",
            "category": "Operational Impact",
            "description": "Research quantifying operational impact of preventive maintenance vs reactive repairs"
        },
    ],
}

class NotebookLMDocumentationSystem:
    """Gestiona la integración con NotebookLM para documentación de protección de activos."""

    def __init__(self, profile: str = "default"):
        self.profile = profile
        self.config_file = Path.home() / ".notebooklm" / "elimfilters_config.json"
        self.notebook_id = None
        self.sources_added = []

    def setup(self) -> bool:
        """Configura la autenticación y el profile de NotebookLM."""
        print("\n🔐 Configurando NotebookLM...")

        # Verificar si ya está autenticado
        result = subprocess.run(
            ["notebooklm", "-p", self.profile, "status"],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            print(f"\n❌ No autenticado. Ejecuta primero:")
            print(f"   notebooklm -p {self.profile} login")
            return False

        print(f"✅ NotebookLM profile '{self.profile}' verificado")
        return True

    def create_notebook(self, name: str = "ELIMFILTERS Asset Protection - External Sources") -> bool:
        """Crea un nuevo notebook en NotebookLM."""
        print(f"\n📓 Creando notebook: {name}")

        result = subprocess.run(
            ["notebooklm", "-p", self.profile, "create", name],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            # Extraer ID del notebook de la salida
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'ID' in line or 'id' in line:
                    print(f"✅ Notebook creado: {line}")
                    return True
            print("✅ Notebook creado exitosamente")
            return True

        print(f"⚠️  {result.stderr}")
        return False

    def list_notebooks(self) -> list:
        """Lista todos los notebooks."""
        result = subprocess.run(
            ["notebooklm", "-p", self.profile, "list"],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print("\n📚 Notebooks disponibles:")
            print(result.stdout)
            return result.stdout

        return []

    def add_external_sources(self) -> dict:
        """Agrega fuentes externas confiables al notebook."""
        print("\n📎 Agregando fuentes externas...")

        results = {
            "added": [],
            "failed": [],
            "total": 0
        }

        for category, sources in EXTERNAL_SOURCES.items():
            print(f"\n  {category}:")

            for source in sources:
                results["total"] += 1

                # Nota: notebooklm add-research acepta URLs
                # para investigación automática
                cmd = [
                    "notebooklm", "-p", self.profile,
                    "source", "add-research",
                    source["url"],
                    "--description", source["description"]
                ]

                result = subprocess.run(cmd, capture_output=True, text=True)

                if result.returncode == 0:
                    print(f"    ✅ {source['title']}")
                    results["added"].append(source)
                else:
                    print(f"    ⚠️  {source['title']}")
                    results["failed"].append(source)

        print(f"\n📊 Resumen: {len(results['added'])} añadidas, {len(results['failed'])} fallidas")
        return results

    def generate_documentation(self, asset_type: str = "all") -> bool:
        """Genera documentación analítica sobre protección de activos."""
        print(f"\n📄 Generando documentación: {asset_type}")

        prompts = {
            "contamination": "Analiza los mecanismos de contaminación en sistemas industriales y su impacto en la vida útil de equipos. Incluye: fuentes de contaminación, modos de fallo, estándares de medición (ISO 4406, ISO 16889), y estrategias de control.",

            "bearing_protection": "Explica cómo la contaminación de aceite acelera el desgaste de cojinetes. Incluye: mecanismos de desgaste (abrasivo, adhesivo), criterios de limpieza óptima (ISO 4406), y extensión de vida útil mediante filtración.",

            "hydraulic_systems": "Analiza la relación entre limpieza hidráulica y confiabilidad de sistemas. Incluye: daño a válvulas proporcionales, códigos de limpieza ISO 16889, presión de by-pass, y fallos catastróficos por contaminación.",

            "fuel_systems": "Documenta los problemas de contaminación en combustible diesel. Incluye: contaminación por agua, crecimiento microbiano, daño a inyectores HPCR, pruebas Karl Fischer, y prevención.",

            "air_intake": "Explica la importancia de la filtración de aire en motores. Incluye: eficiencia volumétrica, by-pass de filtros, estándares ISO 5011/SAE J726, y impacto en consumo de combustible.",

            "all": "Crea un análisis comprehensivo de la protección de activos industriales mediante control de contaminación. Incluye: todos los dominios de filtración (aire, combustible, aceite, hidráulica), estándares ISO/ASTM/SAE, mecanismos de fallo, y estrategias de protección holística."
        }

        prompt = prompts.get(asset_type, prompts["all"])

        # Hacer pregunta al notebook
        cmd = [
            "notebooklm", "-p", self.profile,
            "ask", prompt
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            # Guardar salida a archivo
            output_path = Path(f"docs/external_analysis_{asset_type}.md")
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with open(output_path, "w") as f:
                f.write(result.stdout)

            print(f"✅ Análisis generado: {output_path}")
            return True
        else:
            print(f"⚠️  Error: {result.stderr}")
            return False

    def save_config(self):
        """Guarda la configuración para reutilización."""
        config = {
            "profile": self.profile,
            "created_at": datetime.now().isoformat(),
            "sources_count": len([s for sources in EXTERNAL_SOURCES.values() for s in sources]),
            "categories": list(EXTERNAL_SOURCES.keys()),
        }

        self.config_file.parent.mkdir(parents=True, exist_ok=True)

        with open(self.config_file, "w") as f:
            json.dump(config, f, indent=2)

        print(f"\n💾 Configuración guardada: {self.config_file}")

    def export_sources_list(self) -> Path:
        """Exporta la lista completa de fuentes como Markdown."""
        output_path = Path("docs/external_sources.md")
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w") as f:
            f.write("# Fuentes Externas - Protección de Activos Industriales\n\n")
            f.write(f"*Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")

            for category, sources in EXTERNAL_SOURCES.items():
                f.write(f"## {category.replace('_', ' ')}\n\n")

                for source in sources:
                    f.write(f"### {source['title']}\n\n")
                    f.write(f"- **URL:** {source['url']}\n")
                    f.write(f"- **Categoría:** {source['category']}\n")
                    f.write(f"- **Descripción:** {source['description']}\n\n")

        print(f"\n📋 Fuentes exportadas: {output_path}")
        return output_path


def main():
    parser = argparse.ArgumentParser(
        description="NotebookLM Asset Protection Documentation System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python scripts/notebooklm_asset_protection.py --setup
  python scripts/notebooklm_asset_protection.py --create-notebook
  python scripts/notebooklm_asset_protection.py --add-sources
  python scripts/notebooklm_asset_protection.py --generate-report contamination
  python scripts/notebooklm_asset_protection.py --export-sources
        """
    )

    parser.add_argument("-p", "--profile", default="default", help="NotebookLM profile")
    parser.add_argument("--setup", action="store_true", help="Configurar autenticación")
    parser.add_argument("--create-notebook", action="store_true", help="Crear nuevo notebook")
    parser.add_argument("--list", action="store_true", help="Listar notebooks")
    parser.add_argument("--add-sources", action="store_true", help="Agregar fuentes externas")
    parser.add_argument("--generate-report", choices=["contamination", "bearing_protection", "hydraulic_systems", "fuel_systems", "air_intake", "all"], help="Generar reporte analítico")
    parser.add_argument("--export-sources", action="store_true", help="Exportar lista de fuentes")

    args = parser.parse_args()

    system = NotebookLMDocumentationSystem(profile=args.profile)

    try:
        if args.setup:
            system.setup()

        if args.list:
            system.list_notebooks()

        if args.create_notebook:
            system.create_notebook()

        if args.add_sources:
            system.add_external_sources()

        if args.generate_report:
            system.generate_documentation(asset_type=args.generate_report)

        if args.export_sources:
            system.export_sources_list()

        system.save_config()

    except KeyboardInterrupt:
        print("\n⚠️  Operación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
