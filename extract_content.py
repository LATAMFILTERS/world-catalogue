#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path
from bs4 import BeautifulSoup

def clean_text(text):
    """Remove HTML tags and clean whitespace"""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_from_html(html_content):
    """Extract structured content from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')

    result = {
        "title": "",
        "subtitle": "",
        "description": "",
        "features": [],
        "stats": {},
        "cta": ""
    }

    # Extract title and subtitle from h1 tags
    h1_tags = soup.find_all('h1')
    if h1_tags:
        result["title"] = clean_text(h1_tags[0].get_text())
        if len(h1_tags) > 1:
            result["subtitle"] = clean_text(h1_tags[1].get_text())

    # Extract description from paragraphs (first 2)
    p_tags = soup.find_all('p')
    description_parts = []
    for p in p_tags[:2]:
        text = clean_text(p.get_text())
        if text and len(text) > 20:
            description_parts.append(text)
    result["description"] = " ".join(description_parts)[:300]

    # Extract features from h3 or h4 tags
    headers = soup.find_all(['h3', 'h4'])
    features = []
    for header in headers[:4]:
        text = clean_text(header.get_text())
        if text and len(text) > 3:
            features.append(text)
    result["features"] = features[:4]

    # Extract statistics (percentages and numbers)
    stats = {}
    all_text = soup.get_text()

    # Look for percentages
    percentages = re.findall(r'(\d+\.?\d*%)', all_text)
    if percentages:
        stats["percentages"] = percentages[:3]

    # Look for PSI, micron ratings, etc.
    ratings = re.findall(r'(\d+\s*(?:PSI|MICRON|micron|µm|psi))', all_text)
    if ratings:
        stats["ratings"] = ratings[:2]

    result["stats"] = stats

    # Extract CTA (look for button text or link text)
    buttons = soup.find_all(['a', 'button'])
    ctas = []
    for btn in buttons:
        text = clean_text(btn.get_text())
        if text and len(text) > 3 and len(text) < 50:
            ctas.append(text)

    result["cta"] = ctas[0] if ctas else "Find My Filter"

    return result

def process_files(directory):
    """Process all HTML files in directory"""
    items = []

    for file in sorted(Path(directory).glob('*.html')):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                html = f.read()

            content = extract_from_html(html)

            item = {
                "name": file.stem.replace('-', ' ').title(),
                "file": file.name,
                **content
            }
            items.append(item)
        except Exception as e:
            print(f"Error processing {file.name}: {e}")
            continue

    return items

# Main extraction
industries_dir = "/home/user/world-catalogue/industries"
products_dir = "/home/user/world-catalogue/products"
technologies_dir = "/home/user/world-catalogue/technologies"

catalogue = {
    "industries": process_files(industries_dir),
    "products": process_files(products_dir),
    "technologies": process_files(technologies_dir)
}

# Output JSON
output_file = "/home/user/world-catalogue/catalogue.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(catalogue, f, indent=2, ensure_ascii=False)

print(f"Catalogue extracted to {output_file}")
print(f"Industries: {len(catalogue['industries'])}")
print(f"Products: {len(catalogue['products'])}")
print(f"Technologies: {len(catalogue['technologies'])}")
