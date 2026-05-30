---
role: Software Developer 1
employer: Solutions Resource LLC
location: Quezon City, PH
type: full-time
startDate: 2022-01-01
endDate: 2022-11-01
summary: Identified and fixed a loyalty rewards abuse pattern that recovered significant leaked revenue, and built a generic voucher system.
achievements:
  - title: "Found and fixed a loyalty-abuse pattern"
    metric: 'Significant revenue recovered'
    context: >-
      A nationwide loyalty rewards program was experiencing recurring downtime. The proximate cause
      was load; the underlying cause was an abuse pattern that had not been identified.
    approach: >-
      Worked back through transaction logs until the duplicate-transaction pattern was clear.
      Built an automated identification and remediation tool to detect and act on the pattern at write time.
    result: >-
      Outages stopped. The business recovered significant revenue that had been leaking through the abuse.
      The investigation led to a promotion to Software Developer II four months into the role.
  - title: "Loyalty rewards admin website"
    metric: "Management pages, OCR review, dashboards"
    context: >-
      The loyalty rewards program had no internal surface for administrators to manage the program,
      review submissions, or monitor activity.
    approach: >-
      Implemented the admin website against provided designs, covering management pages, an
      approver-facing receipt OCR review interface, and dashboards.
    result: >-
      The business gained a centralized surface to manage the loyalty rewards program. Approvers
      could review OCR-processed receipts directly within the system.
  - title: "Generic voucher system"
    metric: "Nationwide adoption inside the program"
    context: >-
      Multiple teams were maintaining separate voucher logic for promotions. The implementations
      were nearly identical and inconsistently buggy.
    approach: >-
      Built a generic voucher engine with the abstractions teams required: eligibility, expiration,
      redemption, and fraud signals.
    result: >-
      Adopted across the program. Teams that had been maintaining separate voucher implementations
      migrated to the shared engine.
showInTimeline: true
projects:
  - loyalty-rewards
tech_stack:
  - name: Java
    category: Languages
  - name: Python
    category: Languages
  - name: TypeScript
    category: Languages
  - name: JavaScript
    category: Languages
    showInHome: false
  - name: SQL
    category: Languages
    showInHome: false
  - name: Spring Boot
    category: Backend
  - name: Django
    category: Backend
  - name: Node.js
    category: Backend
  - name: Quartz
    category: Backend
    note: [Java scheduler, cron jobs]
  - name: REST APIs
    category: Backend
    showInHome: false
  - name: React
    category: Frontend
  - name: React Native
    category: Frontend
    note: [iOS, Android, Expo]
  - name: Angular
    category: Frontend
  - name: Ionic
    category: Frontend
    note: [iOS, hybrid mobile, Angular]
  - name: PostgreSQL
    category: Data
  - name: MySQL
    category: Data
  - name: AWS
    category: Cloud · Infra
tags:
  - Backend
---
