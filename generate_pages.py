#!/usr/bin/env python3
"""Generate 43 normalized HTML pages from catalogue.json and template"""

import json
import os
from pathlib import Path

# Load catalogue data
with open('catalogue.json', 'r') as f:
    catalogue = json.load(f)

# Load template
with open('template-unified.html', 'r') as f:
    template = f.read()

def generate_features_list(features):
    """Convert features list to HTML"""
    if not features:
        return ""
    return "\n      ".join([f"<li>{feat}</li>" for feat in features])

def generate_stats_boxes(stats, name):
    """Generate stats boxes from stats dict"""
    if not stats or not stats.get('percentages'):
        # Default stats
        return f'''<div class="card">
        <div class="stat-box">
          <div class="number">100%</div>
          <div class="label">Reliability</div>
        </div>
      </div>
      <div class="card">
        <div class="stat-box">
          <div class="number">99.9%</div>
          <div class="label">Efficiency</div>
        </div>
      </div>
      <div class="card">
        <div class="stat-box">
          <div class="number">0%</div>
          <div class="label">Downtime Tolerance</div>
        </div>
      </div>'''

    boxes = []
    percentages = stats.get('percentages', [])
    labels = ['Performance', 'Separation', 'Protection', 'Reliability']

    for i, perc in enumerate(percentages[:3]):
        boxes.append(f'''<div class="card">
        <div class="stat-box">
          <div class="number">{perc}</div>
          <div class="label">{labels[i]}</div>
        </div>
      </div>''')

    return "\n      ".join(boxes)

def generate_technologies_tags(features):
    """Convert features to technology tags"""
    if not features:
        return ""
    tech_mapping = {
        'AIR': 'SYNTEPORE™', 'FUEL': 'AQUAGUARD™', 'HYDRAULIC': 'NANOFORCE™',
        'LUBRICATION': 'SYNTRAX™', 'INTAKE': 'MACROCORE™', 'OIL': 'COOLTECH™'
    }

    tags = []
    for feat in features[:4]:
        # Extract tech name if present
        for key, tech in tech_mapping.items():
            if key in feat.upper():
                tags.append(f'<span class="tech-tag">{tech}</span>')
                break

    return "\n          ".join(tags) if tags else '<span class="tech-tag">ELIMFILTERS™ Standard Protection</span>'

def process_item(item, category):
    """Process one catalogue item and generate HTML"""
    html = template

    # Replace placeholders
    title = item.get('title', item['name']).upper()
    subtitle = item.get('subtitle', '').upper()
    description = item.get('description', 'Advanced filtration engineering for maximum asset protection.')
    features = item.get('features', [])
    stats = item.get('stats', {})

    html = html.replace('{{CATEGORY_TAG}}', f"{category.upper()}_ENGINEERING")
    html = html.replace('{{TITLE}}', title)
    html = html.replace('{{SUBTITLE}}', subtitle)
    html = html.replace('{{DESCRIPTION}}', description[:250] + '...' if len(description) > 250 else description)
    html = html.replace('{{FEATURES_LIST}}', generate_features_list(features))
    html = html.replace('{{STATS_BOXES}}', generate_stats_boxes(stats, item['name']))
    html = html.replace('{{TECHNOLOGIES_TAGS}}', generate_technologies_tags(features))
    html = html.replace('{{CATEGORY}}', category)

    # Default content for sections without specific data
    overview = f"ELIMFILTERS provides engineered filtration solutions optimized for {item['name']} operations. Our systems deliver maximum asset protection with extended service intervals and reduced total cost of ownership."
    html = html.replace('{{OVERVIEW_PARAGRAPH}}', overview)

    tech_specs = f"Engineered for {item['name']} environments with precision filtration, water separation, and thermal stability. Every system designed for 24/7 reliability."
    html = html.replace('{{TECH_SPECS}}', tech_specs)

    applications = f"<li>{item['name']} equipment</li><li>Heavy-duty operations</li><li>Extended service cycles</li>"
    html = html.replace('{{APPLICATIONS_LIST}}', applications)

    return html

def main():
    """Generate all 43 pages"""

    categories = {
        'industries': ('industries', catalogue.get('industries', [])),
        'products': ('products', catalogue.get('products', [])),
        'technologies': ('technologies', catalogue.get('technologies', []))
    }

    total = 0
    for category_key, (folder, items) in categories.items():
        for item in items:
            filename = item.get('file', f"{item['name'].lower().replace(' ', '-')}.html")
            filepath = f"{folder}/{filename}"

            # Generate HTML
            html_content = process_item(item, category_key.rstrip('s'))

            # Write file
            Path(filepath).parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, 'w') as f:
                f.write(html_content)

            print(f"✓ {filepath}")
            total += 1

    print(f"\n✅ Generated {total} normalized HTML pages")

if __name__ == '__main__':
    main()
