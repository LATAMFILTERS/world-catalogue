#!/usr/bin/env python3
"""
ELIMFILTERS NotebookLM portfolio documentation system.

This registry replaces the old topic basket that over-weighted hydraulic
filtration. Sources are now organized around the complete ELIMFILTERS portfolio:
5 core systems, 9 canonical technologies and 12 industries.
"""

import argparse
import json
import subprocess
from datetime import datetime
from pathlib import Path

BASE = "https://elimfilters.com"

SYSTEMS = {
    "air-intake": "Air Intake & Airflow Protection",
    "fuel-cleanliness": "Fuel Cleanliness Protection",
    "lubrication": "Lubrication Protection",
    "hydraulic": "Hydraulic Protection",
    "cooling-system": "Cooling System Protection",
}

TECHNOLOGIES = [
    "macrocore", "microkappa", "drycore", "intekcore", "syntapore",
    "hydrocore", "syntrax", "nanoforce", "thermacore",
]

INDUSTRIES = [
    "agriculture", "automotive", "bus-coach", "construction", "manufacturing",
    "marine", "mining", "oil-gas", "power-generation", "railway",
    "trucks-fleets", "waste-municipal",
]

PORTFOLIO_SOURCES = {
    "systems": [
        {
            "title": title,
            "url": f"{BASE}/systems/{slug}/",
            "category": "Core System",
            "description": f"Canonical ELIMFILTERS system page for {title}.",
        }
        for slug, title in SYSTEMS.items()
    ],
    "technologies": [
        {
            "title": slug.upper(),
            "url": f"{BASE}/technologies/{slug}/",
            "category": "Canonical Technology",
            "description": "Canonical ELIMFILTERS technology page. Use only claims supported by the source.",
        }
        for slug in TECHNOLOGIES
    ],
    "industries": [
        {
            "title": slug.replace("-", " ").title(),
            "url": f"{BASE}/industries/{slug}/",
            "category": "Industry",
            "description": "Canonical ELIMFILTERS industry page describing operating context and relevant protection systems.",
        }
        for slug in INDUSTRIES
    ],
    "knowledge_center": [
        {
            "title": "ELIMFILTERS Knowledge Center",
            "url": f"{BASE}/knowledge-center/",
            "category": "Knowledge Center",
            "description": "Primary governed technical knowledge hub.",
        },
        {
            "title": "Engineering Terminology Glossary",
            "url": f"{BASE}/knowledge-center/glossary/",
            "category": "Knowledge Center",
            "description": "Governed engineering terminology and definitions.",
        },
        {
            "title": "Contamination Failure Modes",
            "url": f"{BASE}/knowledge-center/problems/",
            "category": "Knowledge Center",
            "description": "Governed contamination and failure-mode reference.",
        },
    ],
}

BALANCE_RULES = """
Mandatory ELIMFILTERS content balance rules:
- Do not use hydraulic filtration as the default example.
- Treat hydraulic as one of five core systems, not as the center of the portfolio.
- When the task is general, distribute examples across air intake, fuel cleanliness, lubrication, hydraulic and cooling.
- Rotate industry examples across agriculture, automotive, bus & coach, construction, manufacturing, marine, mining, oil & gas, power generation, railway, truck fleets, and waste & municipal.
- Use ELIMFILTERS technologies only when relevant to the subject: MACROCORE™, MICROKAPPA™, DRYCORE™, INTEKCORE™, SYNTAPORE™, HYDROCORE™, SYNTRAX™, NANOFORCE™ and THERMACORE™.
- Never invent performance numbers, tests, certifications, service intervals or standards compliance.
- Do not mention competitor brands in public-facing outputs.
- Public content must remain technical-commercial, neutral, and free of AI hype.
""".strip()


class NotebookLMDocumentationSystem:
    def __init__(self, profile: str = "default"):
        self.profile = profile
        self.config_file = Path.home() / ".notebooklm" / "elimfilters_config.json"

    def setup(self) -> bool:
        result = subprocess.run(["notebooklm", "-p", self.profile, "status"], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Not authenticated. Run: notebooklm -p {self.profile} login")
            return False
        return True

    def create_notebook(self, name: str = "ELIMFILTERS Balanced Portfolio Knowledge") -> bool:
        result = subprocess.run(["notebooklm", "-p", self.profile, "create", name], capture_output=True, text=True)
        if result.returncode == 0:
            print("Notebook created")
            return True
        print(result.stderr)
        return False

    def list_notebooks(self):
        result = subprocess.run(["notebooklm", "-p", self.profile, "list"], capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout)
        return result.stdout if result.returncode == 0 else []

    def add_sources(self) -> dict:
        results = {"added": [], "failed": [], "total": 0}
        for category, sources in PORTFOLIO_SOURCES.items():
            print(f"\n{category}:")
            for source in sources:
                results["total"] += 1
                description = f"{source['description']} {BALANCE_RULES}"
                cmd = [
                    "notebooklm", "-p", self.profile, "source", "add-research",
                    source["url"], "--description", description,
                ]
                result = subprocess.run(cmd, capture_output=True, text=True)
                target = results["added"] if result.returncode == 0 else results["failed"]
                target.append(source)
                print(("  OK " if result.returncode == 0 else "  FAIL ") + source["title"])
        return results

    def generate_documentation(self, scope: str = "portfolio") -> bool:
        prompts = {
            "portfolio": f"""Create a balanced ELIMFILTERS asset-protection overview from the notebook sources.
Cover all five core systems, the canonical technologies, and the 12 industries without making any one domain dominant.
{BALANCE_RULES}""",
            "systems": f"""Compare the five ELIMFILTERS core protection systems: air intake, fuel cleanliness, lubrication, hydraulic and cooling. Give each system comparable attention and explain where they interact.
{BALANCE_RULES}""",
            "technologies": f"""Create a structured overview of the nine canonical ELIMFILTERS technologies and their relevant engineering roles. Do not force a technology into an application where the source does not support it.
{BALANCE_RULES}""",
            "industries": f"""Create a cross-industry asset-protection overview covering all 12 ELIMFILTERS industries. Rotate examples and explain how system priorities change by operating environment.
{BALANCE_RULES}""",
        }
        result = subprocess.run(["notebooklm", "-p", self.profile, "ask", prompts[scope]], capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stderr)
            return False
        output_path = Path(f"docs/notebooklm_{scope}_analysis.md")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.stdout, encoding="utf-8")
        print(f"Saved: {output_path}")
        return True

    def save_config(self):
        config = {
            "profile": self.profile,
            "created_at": datetime.now().isoformat(),
            "systems": len(SYSTEMS),
            "technologies": len(TECHNOLOGIES),
            "industries": len(INDUSTRIES),
            "sources_count": sum(len(items) for items in PORTFOLIO_SOURCES.values()),
            "balance_policy": "No default hydraulic bias; portfolio-distributed generation",
        }
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        self.config_file.write_text(json.dumps(config, indent=2), encoding="utf-8")

    def export_sources_list(self) -> Path:
        output_path = Path("docs/notebooklm_portfolio_sources.md")
        lines = ["# ELIMFILTERS NotebookLM Portfolio Sources", "", BALANCE_RULES, ""]
        for category, sources in PORTFOLIO_SOURCES.items():
            lines.extend([f"## {category.replace('_', ' ').title()}", ""])
            for source in sources:
                lines.append(f"- [{source['title']}]({source['url']}) — {source['description']}")
            lines.append("")
        output_path.write_text("\n".join(lines), encoding="utf-8")
        return output_path


def main():
    parser = argparse.ArgumentParser(description="ELIMFILTERS balanced NotebookLM portfolio system")
    parser.add_argument("-p", "--profile", default="default")
    parser.add_argument("--setup", action="store_true")
    parser.add_argument("--create-notebook", action="store_true")
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--add-sources", action="store_true")
    parser.add_argument("--generate-report", choices=["portfolio", "systems", "technologies", "industries"])
    parser.add_argument("--export-sources", action="store_true")
    args = parser.parse_args()

    system = NotebookLMDocumentationSystem(profile=args.profile)
    if args.setup:
        system.setup()
    if args.list:
        system.list_notebooks()
    if args.create_notebook:
        system.create_notebook()
    if args.add_sources:
        system.add_sources()
    if args.generate_report:
        system.generate_documentation(args.generate_report)
    if args.export_sources:
        system.export_sources_list()
    system.save_config()


if __name__ == "__main__":
    main()
