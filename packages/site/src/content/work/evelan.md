---
role: Software Engineer
employer: Evelan GmbH
location: Hamburg, DE (Remote)
type: freelance
startDate: 2023-03-01
endDate: 2024-08-01
summary: Built in-app workflow features and real-time data sync across two SaaS products for a German property investment firm.
achievements:
  - title: "SharePoint-integrated workflow feature"
    metric: "End-to-end ownership"
    context: >-
      Customer workflows were split between the application and SharePoint. Maintaining consistency
      between the two systems was a recurring manual effort for users.
    approach: >-
      Led the development of a workflow feature that kept both systems in sync via an interval-based
      sync layer. Users interact with a single source of truth at any given time.
    result: >-
      Users no longer needed to maintain or sync data manually. The feature shipped and remained stable.
  - title: "Real-time event system"
    metric: "Server-pushed create/update events"
    context: >-
      The application had optimistic updates but no mechanism to propagate changes to related data.
      Records and tables across the client could fall out of sync without the user's awareness.
    approach: >-
      Designed a push system that emits create and update events from the server. Clients subscribe
      by record, and cache invalidation hooks respond to relevant events across all fetched resources.
    result: >-
      Data across the application updated in real time. Cache staleness dropped to near zero. The
      system became the foundation for two additional features built subsequently.
  - title: "In-app notification system"
    metric: "Unlimited nested replies + attachment linking"
    context: >-
      The application had no in-context communication layer. Users had no way to discuss or track
      activity tied to specific records.
    approach: >-
      Built a notification system supporting unlimited nested replies. Attachments link directly to
      their respective detail pages, preserving context without requiring the user to leave the thread.
    result: >-
      In-context communication became part of the core workflow.
  - title: "Jira-like client pipeline board"
    metric: "Stage-based workflow, mobile responsive"
    context: >-
      The client required a structured way to manage their sales pipeline across stages, accessible
      to agents working in the field.
    approach: >-
      Contributed to building a Kanban-style pipeline board with stage-based workflows. Mobile
      responsiveness was a primary requirement from the outset.
    result: >-
      Agents could manage their client pipeline from any device. The board became the primary
      workflow surface for the sales team.
  - title: "Agent-facing real estate purchase interface"
    metric: "Desktop + mobile, starts the pipeline"
    context: >-
      Agents required a way to browse available properties and initiate purchases on behalf of
      clients. This served as the entry point into the pipeline.
    approach: >-
      Built the interface from property listing to offer creation, including filtering, property
      cards, and an offer initiation flow across desktop and mobile.
    result: >-
      Agents could initiate client pipelines directly from the interface. The flow became the
      standard entry point for new deals.
showInTimeline: true
projects:
  - real-estate-saas
  - workflow-saas
tech_stack:
  - name: TypeScript
    category: Languages
  - name: JavaScript
    category: Languages
    showInHome: false
  - name: React
    category: Frontend
  - name: Next.js
    category: Frontend
    note: [SSR, App Router, API routes]
  - name: Node.js
    category: Backend
    note: [REST APIs, Lambda, real-time events]
  - name: REST APIs
    category: Backend
    showInHome: false
  - name: AWS
    category: Cloud · Infra
  - name: PostgreSQL
    category: Data
  - name: DynamoDB
    category: Data
  - name: Vercel
    category: DevOps & Tooling
  - name: Bitbucket
    category: DevOps & Tooling
  - name: Logflare
    category: DevOps & Tooling
tags:
  - Full Stack
  - Freelance
---
