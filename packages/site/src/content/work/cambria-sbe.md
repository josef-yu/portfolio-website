---
role: Senior Backend Engineer
employer: Cambria
org: 325 Technology
location: Makati City, PH
type: full-time
startDate: 2024-09-01
endDate: 2025-04-01
summary: Senior IC for the backend team. Delivered 60-90% performance gains through data model revisions and drove AI integration feasibility research.
achievements:
  - title: '60-90% performance gains across core workflows'
    metric: 'Per-query and per-workflow'
    context: >-
      Core workflows executed on Celery in the background, but users experienced excessive wait
      times under realistic fund sizes. The root cause was in the data model and the queries built on top of it.
    approach: >-
      Profiled worst-case inputs and revised the data model to address the root causes. Replaced
      inefficient ORM queries with raw SQL where needed, and applied partial indexes where the data
      distribution warranted them.
    result: >-
      Performance improved by 60 to 90 percent across the affected workflows. Wait times returned
      to acceptable levels under realistic load.
  - title: 'Senior IC and technical go-to for the backend team'
    metric: 'Architecture and firefighting ownership'
    context: >-
      Taking on the senior IC role meant becoming the primary technical escalation point alongside
      the CTO for complex problems and production incidents.
    approach: >-
      Led technical design and architecture decisions while distributing responsibility across the
      team. Maintained open communication throughout the development cycle.
    result: >-
      Served as the reliable technical layer between the team and the CTO. Complex problems were
      resolved faster and engineers had a clear point of escalation.
  - title: 'AI integration feasibility: RAG text-to-SQL prototype'
    metric: 'Proof of concept, informed production direction'
    context: >-
      The team wanted to explore integrating AI into the application but had no baseline for what
      approach was viable or cost-effective.
    approach: >-
      Built a RAG text-to-SQL prototype to test feasibility. Evaluated it against realistic scenarios,
      measuring accuracy and operational cost.
    result: >-
      The approach proved too expensive and insufficiently accurate to ship, but confirmed that AI
      integration was feasible and informed the direction the team pursued.
  - title: 'R&D on optimization and tooling feasibility'
    metric: 'Proposals to CTO, became product epics'
    context: >-
      As senior IC, part of the role involved identifying optimization opportunities and evaluating
      new tooling or approaches before they reached the roadmap.
    approach: >-
      Conducted investigations across optimization opportunities and tooling feasibility. Formalized
      findings into written proposals submitted to the CTO.
    result: >-
      Several proposals were adopted and scoped into product epics, feeding directly into the
      team's roadmap.
showInTimeline: true
projects:
  - 325-tax
tech_stack:
  - name: Python
    category: Languages
  - name: SQL
    category: Languages
    showInHome: false
  - name: Django
    category: Backend
  - name: Celery
    category: Backend
  - name: AWS
    category: Cloud · Infra
  - name: Terraform
    category: Cloud · Infra
  - name: Docker
    category: Cloud · Infra
  - name: PostgreSQL
    category: Data
  - name: Redis
    category: Data
  - name: GitLab
    category: DevOps & Tooling
  - name: AWS Bedrock
    category: AI / LLM
    note: [LLM inference, in-app chatbot]
tags:
  - Backend
  - Lead
---
