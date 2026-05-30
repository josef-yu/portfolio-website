#!/usr/bin/env python3
"""Render cv-joseph-yu.pdf from cv-data.json.

Usage:
    python3 .claude/render_cv_pdf.py              # reads cv-data.json from project root
    python3 .claude/render_cv_pdf.py path/to.json # reads from specified file
"""

import json
import os
import sys

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas as rl_canvas

# ── Page geometry ──────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = letter
ML = 0.75 * inch
MR = 0.75 * inch
MT = 0.75 * inch
MB = 0.75 * inch
TW = PAGE_W - ML - MR
RULE_W = 0.75


# ── PDF class ──────────────────────────────────────────────────────────────────

class PDF:
    def __init__(self, path, max_pages=2):
        self.c = rl_canvas.Canvas(path, pagesize=letter)
        self.y = PAGE_H - MT
        self.page_num = 1
        self.max_pages = max_pages
        self.at_limit = False

    def check(self, need=13):
        if self.at_limit:
            return
        if self.y - need < MB:
            if self.page_num >= self.max_pages:
                self.at_limit = True
                return
            self.c.showPage()
            self.y = PAGE_H - MT
            self.page_num += 1

    def rule(self):
        self.c.setLineWidth(RULE_W)
        self.c.setStrokeColorRGB(0, 0, 0)
        self.c.line(ML, self.y, ML + TW, self.y)

    def section(self, title):
        self.check(35)
        self.c.setFont('Helvetica-Bold', 13)
        self.c.drawString(ML, self.y, title)
        self.y -= 7
        self.rule()
        self.y -= 10

    def write(self, text, font, size, x=ML, hang_x=None, max_w=TW, hang_max_w=None):
        """Wrap text with optional hanging indent. Updates self.y in place.

        Uses self.y as the single source of truth — synced correctly after
        any page break triggered by self.check().
        """
        if self.at_limit:
            return
        hang_x      = hang_x      if hang_x      is not None else x
        hang_max_w  = hang_max_w  if hang_max_w  is not None else max_w
        lh = size * 1.3
        words = text.split()
        line = ''
        first = True
        for word in words:
            candidate = (line + ' ' + word).strip()
            mw = max_w if first else hang_max_w
            if stringWidth(candidate, font, size) <= mw:
                line = candidate
            else:
                if line:
                    self.check(lh)
                    if self.at_limit:
                        return
                    self.c.setFont(font, size)
                    self.c.drawString(x if first else hang_x, self.y, line)
                    self.y -= lh
                    first = False
                line = word
        if line:
            self.check(lh)
            if not self.at_limit:
                self.c.setFont(font, size)
                self.c.drawString(x if first else hang_x, self.y, line)
                self.y -= lh

    def write_pair(self, label, value, size=10,
                   label_font='Helvetica-Bold', value_font='Helvetica'):
        """Label + value on the same baseline; value wraps with hanging indent."""
        if self.at_limit:
            return
        label_w = stringWidth(label, label_font, size)
        self.check(size * 1.3)
        if self.at_limit:
            return
        self.c.setFont(label_font, size)
        self.c.drawString(ML, self.y, label)
        self.write(value, value_font, size,
                   x=ML + label_w, hang_x=ML + label_w,
                   max_w=TW - label_w, hang_max_w=TW - label_w)

    def save(self):
        self.c.save()


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))

    data_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(project_root, 'cv-output', 'generic', 'cv-data.json')
    out_path  = os.path.join(os.path.dirname(os.path.abspath(data_path)), 'cv-joseph-yu.pdf')

    with open(data_path) as f:
        data = json.load(f)

    header    = data['header']
    skills    = data['skills']
    entries   = data['entries']
    education = data.get('education', [])

    pdf = PDF(out_path)
    c   = pdf.c

    # ── Header ────────────────────────────────────────────────────────────────
    pdf.check(80)
    c.setFont('Helvetica-Bold', 28)
    c.drawString(ML, pdf.y, header['name'])
    pdf.y -= 20

    contact_y = pdf.y
    c.setFont('Helvetica', 10)
    x = ML
    for i, item in enumerate(header['contact']):
        prefix = '' if i == 0 else ' | '
        if prefix:
            c.drawString(x, contact_y, prefix)
            x += stringWidth(prefix, 'Helvetica', 10)
        text = item['text']
        c.drawString(x, contact_y, text)
        if 'url' in item:
            w = stringWidth(text, 'Helvetica', 10)
            c.linkURL(item['url'], (x, contact_y - 2, x + w, contact_y + 8), relative=0)
        x += stringWidth(text, 'Helvetica', 10)
    pdf.y -= 10 * 1.2 + 4
    pdf.rule()
    pdf.y -= 14

    # ── Technical Skills ──────────────────────────────────────────────────────
    pdf.section('Technical Skills')
    for skill_group in skills:
        if pdf.at_limit:
            break
        pdf.write_pair(skill_group['category'] + ': ', ', '.join(skill_group['items']))
    pdf.y -= 10

    # ── Professional Experience ───────────────────────────────────────────────
    pdf.section('Professional Experience')

    for idx, entry in enumerate(entries):
        if pdf.at_limit:
            break

        pdf.check(60)
        pdf.write(entry['title'], 'Helvetica-Bold', 10.5)
        pdf.write(entry['period'], 'Helvetica', 10)
        pdf.write_pair('Stack: ', entry['stack'],
                       label_font='Helvetica-Oblique', value_font='Helvetica-Oblique')

        for bullet in entry['bullets']:
            if pdf.at_limit:
                break
            pdf.check(10 * 1.3)
            if pdf.at_limit:
                break
            c.setFont('Helvetica', 10)
            c.drawString(ML, pdf.y, '*')
            pdf.write(bullet, 'Helvetica', 10, x=ML + 12, max_w=TW - 12)

        if idx < len(entries) - 1:
            pdf.y -= 8

    # ── Education ─────────────────────────────────────────────────────────────
    if not pdf.at_limit:
        pdf.y -= 10
        pdf.section('Education')
        for edu in education:
            if pdf.at_limit:
                break
            pdf.write(edu['institution'], 'Helvetica-Bold', 10.5)
            pdf.write(edu['degree'], 'Helvetica', 10)

    pdf.save()
    print(f"CV saved to: {os.path.abspath(out_path)}")


if __name__ == '__main__':
    main()
