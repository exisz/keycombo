#!/usr/bin/env python3
"""Scrape keyboard shortcuts from defkey.com to supplement usethekeyboard.com data.

Usage:
  python3 scripts/scrape_defkey.py --slugs-file /tmp/keep_apps.txt --timeout 180

Outputs additions to src/data/apps.json and src/data/index.json (deduped, sorted).
Includes rate-limit guard: bails after 3 consecutive failures.
"""
import argparse, json, os, re, sys, time, urllib.request, urllib.error

BASE = "https://defkey.com"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"


def humanize(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.replace("-", " ").split())


def fetch(url: str, timeout: int = 15) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return 0, ""


KEY_HTML_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def clean(s: str) -> str:
    s = KEY_HTML_RE.sub(" ", s)
    s = s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&#39;", "'")
    return WS_RE.sub(" ", s).strip()


def parse_app(html: str, slug: str) -> dict | None:
    if not html:
        return None
    # Title
    m = re.search(r"<title>([^<]+) keyboard shortcuts", html, re.I)
    title = m.group(1).strip() if m else humanize(slug)

    # Find sections: each H2 followed by table
    # Pattern: <h2>SectionName (N shortcuts)</h2> ... <table ...>...</table>
    sections = []
    h2_iter = list(re.finditer(r"<h2[^>]*>(.*?)</h2>", html, re.DOTALL))
    table_iter = list(re.finditer(r"<table[^>]*>(.*?)</table>", html, re.DOTALL))

    # Pair tables to nearest preceding h2
    used_tables = set()
    for h2m in h2_iter:
        section_name_raw = clean(h2m.group(1))
        if not re.search(r"\(\d+ shortcuts?\)", section_name_raw):
            continue
        section_name = re.sub(r"\s*\(\d+ shortcuts?\)\s*", "", section_name_raw).strip()
        # Find the next table after this H2 (not yet used)
        chosen = None
        for ti, tm in enumerate(table_iter):
            if ti in used_tables:
                continue
            if tm.start() > h2m.end():
                chosen = (ti, tm)
                break
        if not chosen:
            continue
        ti, tm = chosen
        used_tables.add(ti)
        rows = re.findall(r"<tr[^>]*>(.*?)</tr>", tm.group(1), re.DOTALL)
        shortcuts = []
        for row in rows:
            cells = re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", row, re.DOTALL)
            if len(cells) < 3:
                continue
            cleaned = [clean(c) for c in cells]
            # Defkey layout: [popularity, keys, description, ...]
            keys_raw = cleaned[1]
            desc = cleaned[2]
            if not keys_raw or not desc:
                continue
            # Normalize keys: "Ctrl + C" pieces
            keys = re.sub(r"\s*\+\s*", "+", keys_raw).strip()
            if not keys:
                continue
            shortcuts.append({"description": desc, "keys": [keys]})
        if shortcuts:
            sections.append({"category": section_name, "shortcuts": shortcuts})

    if not sections:
        return None
    total = sum(len(s["shortcuts"]) for s in sections)
    return {
        "slug": slug,
        "name": humanize(slug),
        "title": title,
        "shortcutCount": total,
        "referenceUrl": f"{BASE}/{slug}-shortcuts",
        "sections": sections,
        "source": "defkey.com",
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slugs-file", required=True)
    ap.add_argument("--timeout", type=int, default=180, help="overall budget seconds")
    ap.add_argument("--per-request-timeout", type=int, default=15)
    ap.add_argument("--delay", type=float, default=1.5, help="seconds between requests")
    ap.add_argument("--data-file", default=None, help="apps.json path; default ../src/data/apps.json")
    ap.add_argument("--max-failures", type=int, default=3)
    args = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    data_path = args.data_file or os.path.join(here, "..", "src", "data", "apps.json")
    index_path = os.path.join(os.path.dirname(data_path), "index.json")

    with open(args.slugs_file) as f:
        slugs = [s.strip() for s in f if s.strip() and not s.startswith("#")]

    # Load existing data
    if os.path.exists(data_path):
        with open(data_path) as f:
            existing = json.load(f)
    else:
        existing = []
    existing_slugs = {a["slug"] for a in existing}

    # Filter out already-existing
    todo = [s for s in slugs if s not in existing_slugs]
    print(f"Existing apps: {len(existing)}; new candidates: {len(todo)}")

    start = time.time()
    new_records = []
    consecutive_failures = 0
    rate_limited = False

    for i, slug in enumerate(todo, 1):
        elapsed = time.time() - start
        if elapsed > args.timeout:
            print(f"[BUDGET] {elapsed:.1f}s elapsed, stopping at {i-1}/{len(todo)}")
            break
        url = f"{BASE}/{slug}-shortcuts"
        t0 = time.time()
        status, html = fetch(url, args.per_request_timeout)
        dt = time.time() - t0
        if status == 429:
            print(f"[429] RATE LIMITED on {slug} — bailing")
            rate_limited = True
            break
        if status != 200 or not html:
            consecutive_failures += 1
            print(f"  ✗ {slug}: status={status} dt={dt:.2f}s (fail #{consecutive_failures})")
            if consecutive_failures >= args.max_failures:
                print(f"[GUARD] {consecutive_failures} consecutive failures — bailing (RATE_LIMITED_EXIT)")
                rate_limited = True
                break
            time.sleep(args.delay)
            continue
        rec = parse_app(html, slug)
        if rec and rec["shortcutCount"] >= 5:
            new_records.append(rec)
            consecutive_failures = 0
            print(f"  ✓ {slug}: {rec['shortcutCount']} shortcuts, {len(rec['sections'])} sections (dt={dt:.2f}s)")
        else:
            consecutive_failures += 1
            n = rec["shortcutCount"] if rec else 0
            print(f"  ⚠ {slug}: parsed {n} shortcuts — skipping")
        time.sleep(args.delay)

    # Merge & save (always — even if rate limited)
    if new_records:
        merged = existing + new_records
        merged.sort(key=lambda a: a["slug"])
        with open(data_path, "w") as f:
            json.dump(merged, f, indent=2)
        # Rebuild index
        index = [
            {
                "slug": a["slug"],
                "name": a["name"],
                "shortcutCount": a["shortcutCount"],
                "categories": [s["category"] for s in a["sections"]],
            }
            for a in merged
        ]
        with open(index_path, "w") as f:
            json.dump(index, f, indent=2)
        print(f"Saved {len(new_records)} new apps. Total now: {len(merged)} apps, {sum(a['shortcutCount'] for a in merged)} shortcuts.")
    else:
        print("No new records collected.")

    if rate_limited:
        print("RATE_LIMITED_EXIT")
        sys.exit(0)


if __name__ == "__main__":
    main()
