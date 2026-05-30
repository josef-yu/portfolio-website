#!/usr/bin/env python3
"""Render cover-letter-joseph-yu.pdf from cover-letter-data.json.

Usage:
    python3 .claude/render_cover_letter_pdf.py path/to/cover-letter-data.json
"""

import json
import os
import sys

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas as rl_canvas

# ── Page geometry ──────────────────────────────────────────────────────────────
_, PAGE_H = letter
ML = 0.75 * inch
MT = 0.75 * inch
TW = 7 * inch
RULE_W = 0.75


# ── PDF class ──────────────────────────────────────────────────────────────────

class PDF:
    def __init__(self, path):
        self.c = rl_canvas.Canvas(path, pagesize=letter)
        self.y = PAGE_H - MT

    def rule(self):
        self.c.setLineWidth(RULE_W)
        self.c.setStrokeColorRGB(0, 0, 0)
        self.c.line(ML, self.y, ML + TW, self.y)

    def write(self, text, font, size, x=ML, max_w=TW):
        """Wrap and draw text, advancing self.y by line height per line."""
        lh = size * 1.3
        words = text.split()
        line = ''
        for word in words:
            candidate = (line + ' ' + word).strip()
            if stringWidth(candidate, font, size) <= max_w:
                line = candidate
            else:
                if line:
                    self.c.setFont(font, size)
                    self.c.drawString(x, self.y, line)
                    self.y -= lh
                line = word
        if line:
            self.c.setFont(font, size)
            self.c.drawString(x, self.y, line)
            self.y -= lh

    def save(self):
        self.c.save()


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 render_cover_letter_pdf.py path/to/cover-letter-data.json",
              file=sys.stderr)
        sys.exit(1)

    data_path = sys.argv[1]
    out_path  = os.path.join(os.path.dirname(os.path.abspath(data_path)),
                             'cover-letter-joseph-yu.pdf')

    with open(data_path) as f:
        data = json.load(f)

    header     = data['header']
    date       = data['date']
    recipient  = data.get('recipient', 'Hiring Manager')
    company    = data['company']
    role       = data['role']
    paragraphs = data['paragraphs']
    closing    = data.get('closing', 'Sincerely,')

    pdf = PDF(out_path)
    c   = pdf.c

    # ── Header ────────────────────────────────────────────────────────────────
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
    pdf.y -= 20

    # ── Date + salutation ─────────────────────────────────────────────────────
    pdf.write(date, 'Helvetica', 11)
    pdf.y -= 14

    pdf.write(f'Dear {recipient},', 'Helvetica', 11)
    pdf.y -= 4
    pdf.write(f'Re: {role} — {company}', 'Helvetica-Bold', 11)
    pdf.y -= 6

    # ── Body ──────────────────────────────────────────────────────────────────
    for para in paragraphs:
        pdf.write(para, 'Helvetica', 11)
        pdf.y -= 10

    # ── Closing ───────────────────────────────────────────────────────────────
    pdf.y -= 4
    pdf.write(closing, 'Helvetica', 11)
    pdf.y -= 36
    pdf.write(header['name'], 'Helvetica-Bold', 11)

    pdf.save()
    print(f"Cover letter saved to: {os.path.abspath(out_path)}")


if __name__ == '__main__':
    main()
