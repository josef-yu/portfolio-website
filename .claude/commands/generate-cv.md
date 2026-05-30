Generate a CV PDF from the portfolio work content. Runs in three phases (four with `--cover-letter`).
All output is written to `cv-output/` (git-ignored), under a subfolder per run.

**Prerequisites:** `pip install -r .claude/requirements.txt`

## Standard mode

Output folder: `cv-output/generic/`

**Phase 1 — Extract**

```bash
python3 .claude/extract_cv_data.py cv-output/generic
```

**Phase 2 — Synthesize bullets**
Read `cv-output/generic/cv-data.json`. For each entry, synthesize `bullets` from its `achievements` array.
Each bullet must:

- Start with a strong action verb
- Be concise (one sentence)
- Include the metric if it is not already present in the synthesized text
- Avoid em dashes; use a colon or semicolon to attach the metric if needed
- Replace any special characters (₱ → PHP, – → -, → → to) for PDF compatibility

Write `bullets` (array of strings) back onto each entry in `cv-data.json`, removing `achievements`.

**Phase 3 — Render**

```bash
python3 .claude/render_cv_pdf.py cv-output/generic/cv-data.json
```

## Tailored mode (a job URL is provided as argument)

1. Fetch the job posting at the provided URL. Derive a short slug from it: `<company>-<role>` in lowercase with hyphens (e.g. `acme-backend-engineer`). This becomes the output folder: `cv-output/<slug>/`.

2. Run Phase 1:

   ```bash
   python3 .claude/extract_cv_data.py cv-output/<slug>
   ```

3. Run Phase 2 (bullet synthesis) as above, but read/write `cv-output/<slug>/cv-data.json`.

4. Tailor `cv-output/<slug>/cv-data.json` in-place:
   - Reorder the `skills` array so the most relevant categories appear first.
   - For each entry, keep only the 2–3 most relevant bullets for this specific role; remove the rest.

5. Run Phase 3:

   ```bash
   python3 .claude/render_cv_pdf.py cv-output/<slug>/cv-data.json
   ```

6. If `--cover-letter` is also present, run Phase 4 (see below).

## Tailored mode with `--interview` flag (no URL available)

When the argument is `--interview`, gather the job details by asking the user these questions one at a time, waiting for each answer before proceeding:

1. What is the company name and the role title?
2. What are the main responsibilities of the role?
3. What is the required or preferred tech stack?
4. What seniority level is the role targeting?
5. Are there any specific requirements, focus areas, or nice-to-haves worth highlighting?

Once all answers are collected, treat them as the job description and proceed identically to tailored mode above. Derive the slug from the answers using the same `<company>-<role>` format in lowercase with hyphens (e.g. `acme-backend-engineer`).

If `--cover-letter` is also present, run Phase 4 (see below) after the CV is rendered.

## Phase 4 — Cover letter (requires `--cover-letter` flag, tailored modes only)

Follow the `/generate-cover-letter` command instructions with `--output-dir cv-output/<slug>`. Job details are already available from the tailored mode steps above — skip Step 1 of that command.

Outputs `cv-joseph-yu.pdf` (and `cover-letter-joseph-yu.pdf` if `--cover-letter`) inside the run folder. CV maximum 2 pages; cover letter 1 page.

**To update CV content:** edit the relevant `.md` files in `packages/site/src/content/work/`, then re-run.
