#!/usr/bin/env python3
"""Extract CV data from work content files and write to cv-data.json."""

import glob
import json
import os
import sys
from datetime import datetime, date

import yaml

# ── Personal constants ────────────────────────────────────────────────────────
HEADER = {
    'name':    'Joseph Yu',
    'contact': [
        {'text': 'Davao, Philippines'},
        {'text': '+63 977 344 9488'},
        {'text': 'joseph@josefyu.com'},
        {'text': 'linkedin.com/in/josefyu', 'url': 'https://linkedin.com/in/josefyu'},
        {'text': 'github.com/josef-yu',     'url': 'https://github.com/josef-yu'},
    ],
}

EDUCATION = [
    {
        'institution': 'Ateneo de Davao University, Davao City',
        'degree':      'Bachelor of Science in Computer Science',
    }
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_frontmatter(path):
    with open(path) as f:
        text = f.read()
    parts = text.split('---', 2)
    if len(parts) < 3:
        return {}
    return yaml.safe_load(parts[1]) or {}


def to_datetime(val):
    if val is None:
        return datetime(2000, 1, 1)
    if isinstance(val, datetime):
        return val
    if isinstance(val, date):
        return datetime(val.year, val.month, val.day)
    try:
        return datetime.strptime(str(val), '%Y-%m-%d')
    except ValueError:
        return datetime(2000, 1, 1)


def fmt_date(val):
    if val is None:
        return 'Present'
    return to_datetime(val).strftime('%b %Y')


# ── Build functions ───────────────────────────────────────────────────────────

def build_skills(raw_entries):
    """Collect tech names from all entries, grouped by category in first-seen order."""
    cats_order  = []   # category names in first-seen order
    cats_skills = {}   # category -> ordered list of skill names
    cats_seen   = {}   # category -> set of skill names (dedup)
    aws_services = []
    aws_seen     = set()
    aws_cat      = None

    for entry in raw_entries:
        for tech in entry.get('tech_stack', []):
            cat  = tech.get('category')
            name = tech.get('name', '')
            if not cat or not name:
                continue
            if cat not in cats_skills:
                cats_order.append(cat)
                cats_skills[cat] = []
                cats_seen[cat]   = set()
            if name == 'AWS':
                aws_cat = aws_cat or cat
                note = tech.get('note')
                if note:
                    services = note if isinstance(note, list) else [s.strip() for s in note.split(',')]
                    for svc in services:
                        svc = svc.strip()
                        if svc and svc not in aws_seen:
                            aws_seen.add(svc)
                            aws_services.append(svc)
            else:
                if name not in cats_seen[cat]:
                    cats_seen[cat].add(name)
                    cats_skills[cat].append(name)

    if aws_cat:
        aws_label = f"AWS ({', '.join(aws_services)})" if aws_services else 'AWS'
        cats_skills[aws_cat].insert(0, aws_label)

    return [{'category': cat, 'items': cats_skills[cat]} for cat in cats_order]


def build_entry(e):
    """Convert a raw frontmatter dict into a CV entry dict."""
    role     = e.get('role',     '')
    employer = e.get('employer', '')
    org      = e.get('org',      '')
    location = e.get('location', '')
    etype    = e.get('type',     '')

    title = f"{role}, {employer}"
    if org:
        title += f" ({org})"
    title += f", {location}"
    if etype == 'freelance':
        title += ' (Freelance Contract)'

    stack_items = []
    for tech in e.get('tech_stack', []):
        if tech.get('showInHome') is False:
            continue
        name = tech.get('name', '')
        note = tech.get('note')
        if name == 'AWS' and note:
            services = ', '.join(note) if isinstance(note, list) else note
            stack_items.append(f"AWS ({services})")
        else:
            stack_items.append(name)

    return {
        'title':        title,
        'period':       f"{fmt_date(e.get('startDate'))} - {fmt_date(e.get('endDate'))}",
        'stack':        ', '.join(stack_items),
        'achievements': e.get('achievements', []),
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    script_dir   = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))
    work_dir     = os.path.join(project_root, 'packages', 'site', 'src', 'content', 'work')

    out_dir  = sys.argv[1] if len(sys.argv) > 1 else os.path.join(project_root, 'cv-output', 'generic')
    out_path = os.path.join(out_dir, 'cv-data.json')
    os.makedirs(out_dir, exist_ok=True)

    md_files = glob.glob(os.path.join(work_dir, '*.md'))
    if not md_files:
        print(f"No .md files found in {work_dir}", file=sys.stderr)
        sys.exit(1)

    raw_entries = [e for path in md_files if (e := parse_frontmatter(path))]
    raw_entries.sort(key=lambda e: to_datetime(e.get('startDate')), reverse=True)

    data = {
        'header':    HEADER,
        'skills':    build_skills(raw_entries),
        'entries':   [build_entry(e) for e in raw_entries],
        'education': EDUCATION,
    }

    with open(out_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"CV data written to: {os.path.abspath(out_path)}")


if __name__ == '__main__':
    main()
