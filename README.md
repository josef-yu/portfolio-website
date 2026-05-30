# josefyu.com

Personal portfolio website. Built with Astro (static site) and a React-based admin UI for managing content without touching Markdown by hand.

## Packages

| Package             | Description                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `packages/site`     | Astro static site — all public-facing pages                                                      |
| `packages/admin-ui` | React + Vite admin panel, dev-only — injected into the dev server via a custom Astro integration |

## Getting started

```sh
npm install
npm run dev        # runs both site and admin UI concurrently
```

The site is served at `http://localhost:4321`. The admin panel is accessible at `http://localhost:4321/_admin` and is only available during development — it is not included in the production build.

## Commands

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start dev servers for both packages               |
| `npm run build`     | Build admin UI then site to `packages/site/dist/` |
| `npm run preview`   | Preview the production build locally              |
| `npm run site:dev`  | Site only                                         |
| `npm run admin:dev` | Admin UI only                                     |
| `npm run lint`      | ESLint across all packages                        |
| `npm run format`    | Prettier across all packages                      |
| `npm run test`      | Run Vitest                                        |

## Claude commands

| Command                    | What it does                                                              |
| -------------------------- | ------------------------------------------------------------------------- |
| `/generate-cv`             | Generate `cv-joseph-yu.pdf` from work content                             |
| `/generate-cv <url>`       | Tailored CV — fetches the job posting and filters bullets/skills to match |
| `/generate-cv --interview` | Tailored CV — interviews you about the role when no URL is available      |

Output is written to `cv-output/` (git-ignored). Standard mode writes to `cv-output/generic/`; tailored modes write to `cv-output/<company>-<role>/`, one subfolder per job.

Requires Python 3 with `pip install -r .claude/requirements.txt`.

## Features

### Site

**Content collections**

Three Markdown collections with Zod schemas live in `packages/site/src/content/`:

- **`work/`** — roles with employer, dates, employment type, achievements, and linked projects. `endDate` omitted means currently active. `showInTimeline` controls whether the entry appears on the home page.
- **`project/`** — projects with tags, tech stack, an `nda` flag for deliberately vague descriptions, and a `featured` flag for home page display.
- **`writing/`** — blog posts with tags, publish date, optional read-time estimate, and a `draft` flag.

Work entries reference projects via Astro's `reference()` — the projects page uses those links to compute display dates and year ranges from the linked work rather than storing them directly on the project.

**Tech stack aggregation**

The `getTechStack` utility (`src/utilities/getTechStack.ts`) aggregates tech across all work entries and computes years of experience with overlap-aware elapsed time — if the same technology spans two overlapping roles it isn't double-counted. Each tech item can also carry subcategory notes (e.g. `["ECS", "RDS", "Lambda"]`) that are merged and deduplicated across entries.

**Command palette**

`⌘K` / `Ctrl+K` opens a fuzzy-search palette across all content — pages, roles, posts, and projects. The index is generated at build time as `/search-index.json` and fetched lazily on first open. Keyboard navigation (↑ ↓ Enter Esc) and mouse hover both update selection.

**Tag filtering**

The writing list page has client-side tag filtering. Filter buttons are generated from the live tag set across all posts and toggle visibility without a page reload.

**Shared list components**

List markup and CSS are encapsulated in reusable components so pages are thin call-sites:

- `WorkList` / `WorkRow` — full-detail and compact variants of the work timeline, controlled by a single `compact` prop
- `ProjectGrid` / `ProjectCard` — 2-column grid of project cards
- `PostList` / `PostRow` — writing list rows with date, title, description, tag, and read time

All list components handle the empty state internally.

### Admin UI

A dev-only CMS served at `/_admin` via a custom Astro integration (`content-admin`). Nothing is emitted to the production build.

- **Sidebar** — browse all collections and their entries
- **Rich-text editor** — Tiptap editor that writes Markdown to disk
- **New entry form** — create new collection entries with a generated filename
- **Live preview** — toggle a split-pane preview of how the entry renders on the site
- **Dirty-state guard** — warns before navigating away with unsaved changes
- **Keyboard save** — `⌘S` / `Ctrl+S`
- **Image upload** — media files are written to `public/` and served at `/content-assets/`
- **Hot-reloadable handler** — the API handler is loaded via Vite's `ssrLoadModule` so edits to the handler take effect immediately without restarting the dev server

The integration exposes a small internal REST API consumed by the React app:

| Route                               | Purpose                       |
| ----------------------------------- | ----------------------------- |
| `GET /content-admin/collections`    | List all collections          |
| `GET /content-admin/:c/entries`     | List entries in a collection  |
| `GET /content-admin/:c/entries/:id` | Get a single entry            |
| `GET /content-admin/:c/tags`        | Get all tags for a collection |
| `POST /content-admin/:c/entries`    | Create a new entry            |
| `PUT /content-admin/:c/entries/:id` | Update an existing entry      |
| `POST /content-admin/upload`        | Upload a media file           |

## Project structure (site)

```
packages/site/src/
├── components/       # Reusable Astro components (list containers, row items, command palette)
├── content/          # Markdown content collections (work, project, writing)
├── content.config.ts # Zod schemas for all collections
├── data/             # Static JSON (highlights counters, etc.)
├── integrations/     # content-admin Astro integration — Vite middleware, request handler, API routes
├── layouts/          # Base layout (head, nav, footer)
├── pages/            # File-based routes (index, about, work, projects, writing)
├── styles/           # Global CSS and design tokens
└── utilities/        # Shared helpers (tech stack aggregation, time formatting, toolbelt grouping)
```

## Project structure (admin-ui)

```
packages/admin-ui/src/
├── components/   # UI components split into editor/, sidebar/, and ui/ subfolders
├── hooks/        # React hooks for editor state, sidebar, preview, toast, and keyboard shortcuts
├── utils/        # Frontmatter parsing, date helpers, read-time estimation
├── api.ts        # Typed fetch wrappers for the content-admin REST API
└── types.ts      # Shared TypeScript types
```
