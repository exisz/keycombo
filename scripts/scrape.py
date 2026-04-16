#!/usr/bin/env python3.13
"""Scrape keyboard shortcuts from usethekeyboard.com"""
import asyncio, json, re, sys, os
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode

BASE = "https://usethekeyboard.com"

# App name mapping for display names
APP_NAMES = {}

async def get_app_list(crawler, config):
    """Get list of all app slugs from homepage"""
    result = await crawler.arun(BASE, config=config)
    md = result.markdown.raw_markdown
    # Extract links and names: [App Name](https://usethekeyboard.com/slug)
    matches = re.findall(r'\[([^\]]+)\]\(https://usethekeyboard\.com/([a-z0-9-]+)\)', md)
    apps = {}
    for name, slug in matches:
        if slug not in apps:
            apps[slug] = name
    return apps

def parse_shortcuts(md):
    """Parse markdown into structured shortcut data"""
    sections = []
    current_section = None
    current_shortcuts = []
    
    lines = md.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Section header
        if line.startswith('## ') and not line.startswith('### '):
            if current_section and current_shortcuts:
                sections.append({"category": current_section, "shortcuts": current_shortcuts})
            current_section = line[3:].strip()
            current_shortcuts = []
            i += 1
            continue
        
        # Shortcut: description followed by key list items
        if line and not line.startswith('#') and not line.startswith('*') and not line.startswith('[') and not line.startswith('!') and current_section:
            desc = line
            keys = []
            i += 1
            while i < len(lines):
                kline = lines[i].strip()
                if kline.startswith('* '):
                    keys.append(kline[2:].strip())
                    i += 1
                elif kline == '':
                    i += 1
                    # Check if next non-empty line is also a key
                    while i < len(lines) and lines[i].strip() == '':
                        i += 1
                    if i < len(lines) and lines[i].strip().startswith('* '):
                        continue
                    else:
                        break
                else:
                    break
            if keys:
                current_shortcuts.append({"description": desc, "keys": keys})
            continue
        i += 1
    
    if current_section and current_shortcuts:
        sections.append({"category": current_section, "shortcuts": current_shortcuts})
    
    return sections

async def scrape_app(crawler, config, slug, name):
    """Scrape a single app page"""
    url = f"{BASE}/{slug}"
    try:
        result = await crawler.arun(url, config=config)
        md = result.markdown.raw_markdown
        
        # Extract title
        title_match = re.search(r'# Keyboard shortcuts for (.+)', md)
        title = title_match.group(1) if title_match else name
        
        # Extract shortcut count
        count_match = re.search(r'(\d+) keyboard shortcuts', md)
        count = int(count_match.group(1)) if count_match else 0
        
        # Extract reference link
        ref_match = re.search(r'\[Original Reference\]\(([^)]+)\)', md)
        ref = ref_match.group(1) if ref_match else None
        
        sections = parse_shortcuts(md)
        total = sum(len(s["shortcuts"]) for s in sections)
        
        return {
            "slug": slug,
            "name": name,
            "title": title,
            "shortcutCount": count or total,
            "referenceUrl": ref,
            "sections": sections
        }
    except Exception as e:
        print(f"  ERROR {slug}: {e}", file=sys.stderr)
        return None

async def main():
    config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    async with AsyncWebCrawler() as crawler:
        # Get app list
        apps = await get_app_list(crawler, config)
        print(f"Found {len(apps)} apps")
        
        # Scrape all apps in batches of 10
        all_data = []
        slugs = list(apps.keys())
        
        for batch_start in range(0, len(slugs), 10):
            batch = slugs[batch_start:batch_start+10]
            print(f"Batch {batch_start//10 + 1}: {batch}")
            tasks = [scrape_app(crawler, config, s, apps[s]) for s in batch]
            results = await asyncio.gather(*tasks)
            for r in results:
                if r and r["sections"]:
                    all_data.append(r)
                    print(f"  ✓ {r['slug']}: {r['shortcutCount']} shortcuts, {len(r['sections'])} sections")
        
        # Save
        out_path = os.path.join(data_dir, 'apps.json')
        with open(out_path, 'w') as f:
            json.dump(all_data, f, indent=2)
        print(f"\nSaved {len(all_data)} apps to {out_path}")
        
        # Also save index
        index = [{"slug": a["slug"], "name": a["name"], "shortcutCount": a["shortcutCount"], 
                  "categories": [s["category"] for s in a["sections"]]} for a in all_data]
        idx_path = os.path.join(data_dir, 'index.json')
        with open(idx_path, 'w') as f:
            json.dump(index, f, indent=2)
        print(f"Saved index to {idx_path}")

asyncio.run(main())
