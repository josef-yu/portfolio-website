---
role: Backend Engineer
employer: Cambria
org: 325 Technology
location: Makati City, PH
type: full-time
startDate: 2023-09-01
endDate: 2024-09-01
summary: Built XBRL/XML calculation and messaging modules covering 80% of submission data.
achievements:
  - title: "XBRL/XML calculation and messaging"
    metric: "80% of submission data covered"
    context: >-
      New tax-form formats introduced a gap between the regulator's specification, the project
      timeline, and a significant number of edge cases requiring resolution.
    approach: >-
      Built calculation and messaging modules covering the bulk of submission data. Treated the
      specification as the source of truth and wrote tests against the example messages first.
    result: >-
      Submissions were delivered on time and in compliance through the next tax year. The
      implementation held up when a second wave of format changes arrived.
  - title: "Reusable ingestion/egress components"
    metric: "Integration time reduced"
    context: >-
      Each new data integration was being built from scratch. The underlying patterns were nearly
      identical across integrations, but the implementations were not.
    approach: >-
      Extracted the common shape into small, composable utilities scoped to what was needed rather
      than a general-purpose framework.
    result: >-
      New workflows were delivered in hours rather than days. The components have been reused by
      every workflow shipped since.
  - title: "RFC-style proposal process"
    metric: "Three sections, no committee"
    context: >-
      There was no shared artifact for non-trivial technical decisions. Architecture choices were
      being made in informal channels and were not preserved.
    approach: >-
      Introduced a lightweight RFC template covering context, proposal, and alternatives considered.
      The alternatives section is the only mandatory field.
    result: >-
      Decisions are now documented in a persistent record the team can reference when revisiting
      past choices. Several decisions have since been re-validated against the original RFC.
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
  - name: Django REST Framework
    category: Backend
  - name: Celery
    category: Backend
  - name: XBRL/XML
    category: Backend
    note: [ATO submissions, tax form formats]
  - name: REST APIs
    category: Backend
    showInHome: false
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
tags:
  - Backend
---
