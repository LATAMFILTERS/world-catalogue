#!/usr/bin/env python3
"""
ELIMFILTERS NotebookLM portfolio documentation system.

This registry replaces the old topic basket that over-weighted hydraulic
filtration. Sources are now organized around the complete ELIMFILTERS portfolio:
5 core systems, 10 canonical technologies and 12 industries.
"""

import argparse
import json
import re
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
    "hydrocore", "turbocore", "syntrax", "nanoforce", "thermacore",
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
- Use ELIMFILTERS technologies only when relevant to the subject: MACROCORE™, MICROKAPPA™, DRYCORE™, INTEKCORE™, SYNTAPORE™, HYDROCORE™, TURBOCORE™, SYNTRAX™, NANOFORCE™ and THERMACORE™.
- Never invent performance numbers, tests, certifications, service intervals or standards compliance.
- Do not mention competitor brands in public-facing outputs.
- Public content must remain technical-commercial, neutral, and free of AI hype.
""".strip()

# NotebookLM answers are Gemini syntheses: internal research signals only, never
# canonical evidence (see docs/KNOWLEDGE_GOVERNANCE_ARCHITECTURE.md).
PROPOSAL_NOTICE = """
> **Status: INTERNAL PROPOSAL - UNVALIDATED.** NotebookLM output is a research
> signal, not technical evidence. Verify each fact against the cited primary
> source and route it through Obsidian approval before any Knowledge Center,
> catalogue or public use. Competitor material stays internal.
""".strip()

GAP_CHECK_PROMPT = """Review your previous answers in this conversation against the original question below.
Using only the notebook sources, list any part of the question that is still unanswered or only partially answered.
If everything is fully answered from the sources, reply with exactly: COMPLETE

Original question: {question}"""

FOLLOW_UP_PROMPT = """Using only the notebook sources, answer these remaining gaps of the original question.
If the sources do not cover a gap, say so explicitly instead of inferring.

Original question: {question}

Remaining gaps:
{gaps}"""


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "query"


class NotebookLibrary:
    """Local registry of notebooks with metadata, so a question can be routed
    to the right notebook. Notebook IDs belong to the operator's Google account,
    so the registry lives next to the profile config, not in the repository."""

    def __init__(self, path: Path):
        self.path = path

    def load(self) -> dict:
        if not self.path.exists():
            return {"notebooks": {}}
        return json.loads(self.path.read_text(encoding="utf-8"))

    def save(self, data: dict):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def add(self, notebook_id: str, name: str, description: str, topics: list) -> dict:
        if not (notebook_id and name and description.strip() and topics):
            raise ValueError("notebook id, name, description and topics are all required")
        data = self.load()
        entry = {
            "id": notebook_id,
            "name": name,
            "description": description.strip(),
            "topics": topics,
            "added_at": datetime.now().isoformat(),
        }
        data["notebooks"][notebook_id] = entry
        self.save(data)
        return entry

    def remove(self, notebook_id: str) -> bool:
        data = self.load()
        removed = data["notebooks"].pop(notebook_id, None) is not None
        if removed:
            self.save(data)
        return removed

    def _scored(self, query: str) -> list:
        # Topic hits weigh double: topics are the curated routing metadata.
        terms = [t for t in re.split(r"[\s,]+", query.lower()) if t]
        scored = []
        for entry in self.load()["notebooks"].values():
            topics = " ".join(entry["topics"]).lower()
            text = f"{entry['name']} {entry['description']}".lower()
            score = sum(2 * (t in topics) + (t in text) for t in terms)
            if score:
                scored.append((score, entry))
        scored.sort(key=lambda item: item[0], reverse=True)
        return scored

    def search(self, query: str) -> list:
        return [entry for _, entry in self._scored(query)]

    def resolve(self, query: str) -> dict:
        """Best-matching notebook for a query; fails closed on no match or a tie."""
        scored = self._scored(query)
        if not scored:
            raise LookupError(f"No library notebook matches '{query}'. Use --notebook-id or --library-add.")
        if len(scored) > 1 and scored[0][0] == scored[1][0]:
            names = ", ".join(entry["name"] for _, entry in scored[:3])
            raise LookupError(f"Ambiguous notebook for '{query}' ({names}). Use --notebook-id.")
        return scored[0][1]


class NotebookLMDocumentationSystem:
    def __init__(self, profile: str = "default"):
        self.profile = profile
        self.config_file = Path.home() / ".notebooklm" / "elimfilters_config.json"
        self.library = NotebookLibrary(Path.home() / ".notebooklm" / f"elimfilters_library_{profile}.json")

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
            "technologies": f"""Create a structured overview of the ten canonical ELIMFILTERS technologies and their relevant engineering roles. Do not force a technology into an application where the source does not support it.
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

    def _ask(self, notebook_id: str, prompt: str, conversation_id: str = None) -> dict:
        # Prompt goes through stdin so long questions never hit argv limits.
        cmd = ["notebooklm", "-p", self.profile, "ask", "-n", notebook_id, "--json", "--prompt-file", "-"]
        if conversation_id:
            cmd += ["-c", conversation_id]
        result = subprocess.run(cmd, input=prompt, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "notebooklm ask failed")
        return json.loads(result.stdout)

    def research(self, question: str, notebook_id: str = None, topic_query: str = None,
                 max_follow_ups: int = 2) -> Path:
        """Ask a library notebook, then keep asking follow-ups in the same
        conversation until NotebookLM reports the question COMPLETE or the
        follow-up budget is spent. Each call uses one NotebookLM daily query."""
        if notebook_id:
            entry = self.library.load()["notebooks"].get(notebook_id, {"id": notebook_id, "name": notebook_id})
        else:
            entry = self.library.resolve(topic_query or question)
        print(f"Notebook: {entry['name']} ({entry['id']})")

        turns = []
        first = self._ask(entry["id"], question)
        conversation_id = first.get("conversation_id")
        turns.append(("Question", question, first))
        status = "INCOMPLETE"
        for _ in range(max_follow_ups):
            check = self._ask(entry["id"], GAP_CHECK_PROMPT.format(question=question), conversation_id)
            gaps = check.get("answer", "").strip()
            if gaps.upper().rstrip(".") == "COMPLETE":
                status = "COMPLETE"
                break
            turns.append(("Gap check", "Remaining gaps reported by NotebookLM", check))
            prompt = FOLLOW_UP_PROMPT.format(question=question, gaps=gaps)
            turns.append(("Follow-up", prompt, self._ask(entry["id"], prompt, conversation_id)))
        print(f"Coverage: {status} after {len(turns)} recorded turn(s)")
        return self._write_proposal(question, entry, conversation_id, status, turns)

    def _write_proposal(self, question, entry, conversation_id, status, turns) -> Path:
        now = datetime.now()
        lines = [
            f"# NotebookLM research proposal: {question[:80]}",
            "",
            PROPOSAL_NOTICE,
            "",
            f"- Generated: {now.isoformat(timespec='seconds')}",
            f"- Notebook: {entry['name']} (`{entry['id']}`)",
            f"- Conversation: `{conversation_id}`",
            f"- Coverage self-check: {status}",
            "",
        ]
        for label, prompt, response in turns:
            lines += [f"## {label}", "", prompt, "", "### Answer", "", response.get("answer", "").strip(), ""]
            references = response.get("references") or []
            if references:
                lines += ["### Cited source passages", ""]
                for ref in references:
                    cited = " ".join((ref.get("cited_text") or "").split())
                    lines.append(f"- [{ref.get('citation_number')}] source `{ref.get('source_id')}`: {cited[:500]}")
                lines.append("")
        output_path = Path(f"docs/external_analysis_notebooklm_{slugify(question)}_{now:%Y%m%d}.md")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text("\n".join(lines), encoding="utf-8")
        print(f"Saved proposal: {output_path}")
        return output_path

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
    library = parser.add_argument_group("notebook library")
    library.add_argument("--library-list", action="store_true")
    library.add_argument("--library-search", metavar="QUERY")
    library.add_argument("--library-add", action="store_true", help="requires --notebook-id, --name, --description, --topics")
    library.add_argument("--library-remove", metavar="NOTEBOOK_ID")
    library.add_argument("--notebook-id")
    library.add_argument("--name")
    library.add_argument("--description")
    library.add_argument("--topics", help="comma-separated, e.g. fuel-cleanliness,iso-4406,mining")
    research = parser.add_argument_group("research with follow-ups")
    research.add_argument("--ask", metavar="QUESTION")
    research.add_argument("--topic-query", help="route by library topics instead of the question text")
    research.add_argument("--max-follow-ups", type=int, default=2,
                          help="each follow-up round costs two NotebookLM queries (default 2)")
    args = parser.parse_args()

    system = NotebookLMDocumentationSystem(profile=args.profile)
    if args.library_add:
        topics = [t.strip() for t in (args.topics or "").split(",") if t.strip()]
        entry = system.library.add(args.notebook_id, args.name, args.description or "", topics)
        print(f"Added: {entry['name']} ({entry['id']})")
    if args.library_remove:
        print("Removed" if system.library.remove(args.library_remove) else "Not in library")
    if args.library_list or args.library_search:
        entries = (system.library.search(args.library_search) if args.library_search
                   else list(system.library.load()["notebooks"].values()))
        for entry in entries:
            print(f"{entry['id']}  {entry['name']}  [{', '.join(entry['topics'])}]\n    {entry['description']}")
    if args.ask:
        system.research(args.ask, args.notebook_id, args.topic_query, args.max_follow_ups)
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
