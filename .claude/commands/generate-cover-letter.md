Generate a cover letter PDF tailored to a specific job. Can be used standalone or called from `/generate-cv --cover-letter`.

**Prerequisites:** `pip install -r .claude/requirements.txt`

## Arguments

| Argument              | Behaviour                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------- |
| _(none)_              | Default: runs `--interview` mode                                                              |
| `<url>`               | Fetch job details from the posting at the URL                                                 |
| `--interview`         | Gather job details by interviewing the user                                                   |
| `--output-dir <path>` | Write output to this folder instead of deriving it from the job info (used by `/generate-cv`) |

## Step 1 — Gather job details

**If a URL was provided:** fetch the posting and extract company name, role title, responsibilities, tech stack, and any notable requirements.

**If `--interview` or no argument:** ask the user these questions one at a time, waiting for each answer:

1. What is the company name and the role title?
2. What are the main responsibilities of the role?
3. What is the required or preferred tech stack?
4. What seniority level is the role targeting?
5. Are there any specific requirements, focus areas, or nice-to-haves worth highlighting?

## Step 2 — Research the company

Search for publicly available information about the company: what it does, its core product or service, the industry it operates in, any notable recent developments, and its stated mission or values if available. Use this context to make the cover letter specific and informed rather than generic.

If the company cannot be found or information is too limited, proceed with what is known from the job details.

## Step 3 — Resolve output folder

If `--output-dir <path>` was provided, use that path as the output folder.

Otherwise derive a slug from the job details using the `<company>-<role>` format in lowercase with hyphens (e.g. `acme-backend-engineer`) and use `cv-output/<slug>/` as the output folder. Create it if it does not exist.

## Step 4 — Load CV data

Read `<output-dir>/cv-data.json` if it exists. The bullets and skills provide context for tailoring the cover letter to the candidate's actual experience. If the file does not exist, rely solely on the job details and company research.

## Step 5 — Synthesize cover letter

Write `<output-dir>/cover-letter-data.json` with this structure:

```json
{
  "header": "<copy header from cv-data.json, or use the HEADER constant from extract_cv_data.py>",
  "date": "<today's date, e.g. May 30, 2026>",
  "recipient": "Hiring Manager",
  "company": "<company name>",
  "role": "<role title>",
  "paragraphs": [
    "<opening: state the role being applied for and briefly why this company specifically — grounded in the research from Step 2>",
    "<body: connect 2-3 specific achievements from the CV to the job requirements, citing metrics where available>",
    "<closing: brief call to action and availability for interview>"
  ],
  "closing": "Sincerely,"
}
```

Content guidelines:

- Three paragraphs, each 3-5 sentences
- Formal and professional tone throughout
- Concise — include only what is relevant and impactful; cut filler
- Do not use em dashes; use commas, colons, or semicolons instead
- Reference specific achievements by metric where relevant (e.g. "83% DevOps cost reduction")
- Do not use filler phrases like "I am excited to apply" or "I believe I would be a great fit"
- Do not repeat the CV verbatim; frame experience in terms of what it means for this role
- Incorporate one specific detail from the company research to show genuine familiarity

## Step 6 — Render

```bash
python3 .claude/render_cover_letter_pdf.py <output-dir>/cover-letter-data.json
```

Outputs `cover-letter-joseph-yu.pdf` inside the output folder.
