---
role: Team Lead
employer: Cambria
org: 325 Technology
location: Makati City, PH
type: full-time
startDate: 2025-04-01
summary: Leading an 8-person team building tax-compliance software for Australian property funds.
achievements:
  - title: '83% DevOps cost reduction'
    metric: '$9,000 → $1,550 / yr'
    context: >-
      Production load was unpredictable, resulting in overprovisioned resources that sat idle during
      low-traffic periods while incurring full cost.
    approach: >-
      Migrated the overprovisioned infrastructure to a serverless model, enabling automatic scaling
      with load and suspension during periods of no traffic.
    result: >-
      $7,450 in annual savings with no capability regression. A quarterly cost review was established
      to prevent similar accumulation going forward.
  - title: 'Application-ownership model'
    metric: '8-person team, primary + backup per surface'
    context: >-
      The application had no defined feature boundaries. Work was distributed without clear
      accountability for who owned or oversaw development on a given area.
    approach: >-
      Defined the application into discrete feature surfaces along business flows and architecture
      boundaries. Assigned a primary owner per surface responsible for overseeing its development,
      with a backup for coverage. Boundaries were designed with intentional overlap to promote
      collaboration rather than isolation.
    result: >-
      Coverage during time off improved without requiring formal management overhead. Ownership
      became concrete without isolating engineers from adjacent work.
  - title: 'AI-integrated spec-driven development workflow'
    metric: 'Specs in codebase, phase-by-phase AI assistance'
    context: >-
      Specifications were distributed across Jira and Confluence, making them difficult to maintain
      and inaccessible to tooling. The team was already working in a spec-driven manner, with each
      development phase aligned to the Jira workflow.
    approach: >-
      Moved specifications into the codebase, establishing them as a living knowledge base that
      grows alongside the code. Integrated AI assistance into each development phase using the
      specs as context, reducing ambiguity by design.
    result: >-
      Specifications provide direct context to AI assistance across the development workflow.
      Developers receive accurate, low-ambiguity support without excessive prompting.
  - title: 'ATO conformance automation'
    metric: '1 week → 30 minutes, fully automated'
    context: >-
      Each tax year, the Australian Taxation Office releases updated packages requiring the system
      to demonstrate conformance. The process previously required a full week of manual effort
      from one engineer.
    approach: >-
      The ATO packages include their own test suite. Built tooling to extract and inject those tests
      directly into the application, running the full conformance protocol end-to-end against ATO
      test endpoints.
    result: >-
      Conformance verification now takes thirty minutes and can be run by any engineer on local
      or development servers.
showInTimeline: true
projects:
  - 325-tax
tech_stack:
  - name: Python
    category: Languages
    note: [Backend, automation, AI tooling]
  - name: TypeScript
    category: Languages
    note: [React, Next.js, type safety]
  - name: JavaScript
    category: Languages
    showInHome: false
  - name: SQL
    category: Languages
    showInHome: false
  - name: Django
    category: Backend
    note: [DRF, Celery, ORM optimization]
  - name: Django REST Framework
    category: Backend
  - name: Celery
    category: Backend
    note: [Async tasks, beat scheduler]
  - name: REST APIs
    category: Backend
    showInHome: false
  - name: React
    category: Frontend
    note: [Next.js, TypeScript, React Native]
  - name: AWS
    category: Cloud · Infra
    note: [ECS, RDS, S3, Lambda, Bedrock]
  - name: Terraform
    category: Cloud · Infra
    note: [IaC, ECS, networking, modules]
  - name: Docker
    category: Cloud · Infra
    note: [Containerization, ECS deployment]
  - name: PostgreSQL
    category: Data
    note: [Performance, partial indexes, window functions]
  - name: Redis
    category: Data
    note: [Caching, Celery broker]
  - name: GitLab
    category: DevOps & Tooling
    note: [CI/CD, merge requests, pipelines]
  - name: Git
    category: DevOps & Tooling
    showInHome: false
  - name: Linux
    category: DevOps & Tooling
    showInHome: false
  - name: Anthropic Claude API
    category: AI / LLM
    note: [Code review pipeline, AI workflows]
  - name: AWS Bedrock
    category: AI / LLM
    note: [LLM inference, in-app chatbot]
  - name: LLM integration
    category: AI / LLM
    showInHome: false
  - name: Prompt engineering
    category: AI / LLM
    showInHome: false
tags:
  - Lead
  - Full Stack
  - DevOps
---
