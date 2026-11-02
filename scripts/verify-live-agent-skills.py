#!/usr/bin/env python3
"""Fail-closed live verification of published public Agent Skills."""
import hashlib
import json
import urllib.request

BASE = "https://elimfilters.com/.well-known/agent-skills/"

def get(path):
    req = urllib.request.Request(BASE + path, headers={
        "User-Agent": "ELIMFILTERS-Agent-Skills-Audit/1.0",
        "Accept": "*/*",
    })
    with urllib.request.urlopen(req, timeout=20) as response:
        if response.status != 200:
            raise ValueError(f"{path}: HTTP {response.status}")
        content = response.read(262145)
        if len(content) > 262144:
            raise ValueError("Public skill file exceeds 256 KiB")
        return content, response.headers.get("Content-Type", "")

index_bytes, index_type = get("index.json")
if "json" not in index_type.lower():
    raise ValueError(f"Index content type is {index_type!r}")
index = json.loads(index_bytes)
skills = index.get("skills")
if not isinstance(skills, list) or len(skills) != 1:
    raise ValueError("Expected exactly one public skill")
skill = skills[0]
if skill.get("name") != "find-elimfilters-public-resources" or skill.get("type") != "skill-md":
    raise ValueError("Unexpected skill metadata")
path = skill.get("url", "").removeprefix("/.well-known/agent-skills/")
if path != "find-elimfilters-public-resources/SKILL.md":
    raise ValueError("Unexpected skill resource path")
body, body_type = get(path)
if not body.startswith(b"---\nname: find-elimfilters-public-resources\n"):
    raise ValueError("Invalid or nonmatching SKILL.md")
digest = "sha256:" + hashlib.sha256(body).hexdigest()
if digest != skill.get("digest"):
    raise ValueError(f"SHA-256 mismatch: actual {digest}, advertised {skill.get('digest')}")
print("PASS: both live files HTTP 200; JSON and skill valid; SHA-256 identical")
