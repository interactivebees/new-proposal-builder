# Interactive Bees — Enterprise Proposal Builder Workflow & System Architecture

This document provides a comprehensive end-to-end overview of the **Interactive Bees Proposal Builder** platform architecture, data model, user journeys, multi-level approval workflows, and page navigation map.

---

## 1. High-Level Architecture Overview

The system is built as a modern, high-performance full-stack Next.js application utilizing PostgreSQL as the relational data layer, Prisma ORM, NextAuth.js for session and role management, and TipTap for rich text editing.

```mermaid
graph TD
    User([User / Browser]) -->|HTTPS Requests| NextServer[Next.js App Router Server]
    
    subgraph Frontend & Middleware Layer
        NextServer --> Middleware[Auth Middleware & RBAC Router]
        Middleware --> DashboardPages[Dashboard React Pages]
        DashboardPages --> TipTap[TipTap WYSIWYG Section Editor]
    end

    subgraph API & Backend Service Layer
        DashboardPages -->|REST / JSON| APIRoutes[Next.js API Routes /api/*]
        APIRoutes --> AuthEngine[NextAuth v5 & Credentials Strategy]
        APIRoutes --> ExportEngine[DOCX / PDF Export Generators]
        APIRoutes --> UploadEngine[File Storage Upload Handler]
    end

    subgraph Data Layer
        APIRoutes --> PrismaORM[Prisma ORM Client]
        PrismaORM --> NeonDB[(Neon PostgreSQL Cloud DB)]
    end
```

---

## 2. Complete User Workflow & Lifecycle Flowchart

### 2.1 End-to-End Proposal Creation & Delivery Lifecycle

```mermaid
flowchart TD
    Start([User Logs In]) --> AuthCheck{Role & Session Valid?}
    AuthCheck -- No --> Login[Redirect to /login]
    AuthCheck -- Yes --> Dashboard[Dashboard Overview /dashboard]
    
    Dashboard --> SelectAction{Action Choice}
    
    SelectAction -->|Create New Proposal| ChooseTemplate[Browse & Select Template]
    SelectAction -->|Manage Templates| EditTemplate[Redesign & Configure Template]
    SelectAction -->|Manage CRM| ManageClients[Add / Edit Client Contacts]
    SelectAction -->|Admin Roles| ManageUsers[Manage Users & RBAC Permissions]

    ChooseTemplate --> ConfigClient[Select Client & Attach Contact Details]
    ConfigClient --> CustomizeSections[Customize Sections with TipTap Editor]
    CustomizeSections --> AddPricing[Add Pricing Table & Milestone Items]
    AddPricing --> SaveDraft[Save Draft Proposal]

    SaveDraft --> ReviewOptions{Proposal Actions}
    
    ReviewOptions -->|Submit for Approval| TriggerApproval[Multi-Level Approval Pipeline]
    ReviewOptions -->|Export Document| ChooseFormat{Select Format}
    ReviewOptions -->|Duplicate Proposal| CloneProposal[Duplicate for New Client]

    ChooseFormat -->|DOCX| GenerateDocx[Generate .docx File]
    ChooseFormat -->|PDF| GeneratePdf[Generate .pdf File]

    TriggerApproval --> ApprovalStatus{Approver Response}
    ApprovalStatus -- Approved --> StatusApproved[Status: APPROVED]
    ApprovalStatus -- Rejected --> StatusRejected[Status: REJECTED with Feedback]
    
    StatusApproved --> SendClient[Send Proposal to Client]
    SendClient --> End([Proposal Finalized])
```

---

## 3. Detailed Component Flow & Module Interactions

### 3.1 Template Editing & Accordion Section Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Sales / Admin User
    participant Page as EditTemplatePage
    participant Editor as SectionEditor (TipTap)
    participant API as /api/templates/[id]
    participant DB as PostgreSQL Database

    User->>Page: Navigate to /dashboard/templates/[id]/edit
    Page->>API: GET /api/templates/[id]
    API->>DB: Prisma Template.findUnique()
    DB-->>API: Return Template & JSON Sections
    API-->>Page: Return Template JSON Data
    Page->>Editor: Render Warm Golden Banner & Section Accordion (6 Default Sections)
    
    User->>Editor: Reorder, Expand Section, Edit Content in TipTap
    Editor-->>Page: Update Local React State
    
    User->>Page: Click "Save Template Changes"
    Page->>API: PUT /api/templates/[id] (Payload: name, category, description, sections)
    API->>DB: Prisma Template.update()
    DB-->>API: Return Updated Record
    API-->>Page: Return 200 OK
    Page-->>User: Show Success Toast & Redirect to /dashboard/templates
```

---

## 4. Entity-Relationship Diagram (Database Schema)

```mermaid
erDiagram
    USER ||--o{ PROPOSAL : "creates"
    USER ||--o{ TEMPLATE : "creates"
    USER ||--o{ AUDIT_LOG : "triggers"
    USER ||--o{ APPROVAL_REQUEST : "reviews"
    ROLE ||--o{ USER : "assigned to"

    CLIENT ||--o{ CLIENT_CONTACT : "has"
    CLIENT ||--o{ PROPOSAL : "associated with"

    TEMPLATE ||--o{ PROPOSAL : "base for"
    
    PROPOSAL ||--o{ PRICING_ITEM : "contains"
    PROPOSAL ||--o{ COMMENT : "has"
    PROPOSAL ||--o{ VERSION_HISTORY : "tracks"
    PROPOSAL ||--o{ PROPOSAL_SHARE : "shared via"
    PROPOSAL ||--o{ APPROVAL_REQUEST : "subject of"

    USER {
        string id PK
        string email UK
        string name
        string role
        boolean isActive
    }

    ROLE {
        string id PK
        string name UK
        string permissions
    }

    CLIENT {
        string id PK
        string companyName
        string email
        string category
    }

    TEMPLATE {
        string id PK
        string name
        string category
        json sections
    }

    PROPOSAL {
        string id PK
        string proposalNumber UK
        string title
        json content
        string status
        float opportunityValue
    }

    PRICING_ITEM {
        string id PK
        string serviceDescription
        float cost
        string frequency
    }
```

---

## 5. Page Navigation & Route Map

| Route Path | Description | Access Level |
| :--- | :--- | :--- |
| `/login` | Authentication Login & Credentials Form | Public |
| `/dashboard` | Executive Dashboard Metrics & Recent Proposals | All Authenticated Roles |
| `/dashboard/proposals` | Proposal List, Filters, Status Badges, & Search | All Authenticated Roles |
| `/dashboard/proposals/new` | Create Proposal Wizard & Template Selector | Sales, Admin, Owner |
| `/dashboard/proposals/[id]` | Proposal Detail, TipTap Editor, Pricing & PDF/DOCX Export | All Authenticated Roles |
| `/dashboard/templates` | Proposal Template Library Grid & Category Filters | Sales, Admin, Owner |
| `/dashboard/templates/[id]/edit` | Redesigned Template Accordion Editor with Warm Golden Hero Banner | Admin, Owner |
| `/dashboard/clients` | Client CRM Directory, Contacts, & Company Overview | Sales, Admin, Owner |
| `/dashboard/content-library` | Reusable Content Snippets & Scope Modules | Business Expert, Admin |
| `/dashboard/asset-library` | Brand Logos, Media Assets & Document Files | All Authenticated Roles |
| `/dashboard/users` | User Directory Management & Status Toggles | Owner, Admin |
| `/dashboard/roles` | Role-Based Access Control (RBAC) Permission Matrix | Owner, Admin |
| `/dashboard/settings` | Company Settings, Branding & Default Terms | Admin, Owner |

---

## 6. Key Features Summary

1. **Warm Golden Enterprise UI/UX**:
   - Uniform design tokens featuring curated warm gold banners, responsive card layouts, handwritten brand callouts (*"we believe. we can."*), and crisp typography.

2. **TipTap Rich Text Section Editor**:
   - WYSIWYG section builder with custom typography, font sizing, alignment, list controls, tables, code blocks, and drag-and-drop section ordering.

3. **Multi-Level Approval Engine**:
   - Structured multi-stage approval flow (Sales, Technical, Finance, Management) with automated status tracking.

4. **Multi-Format Export**:
   - Native DOCX document generation and PDF export capabilities preserving proposal formatting and pricing structures.

5. **PostgreSQL Cloud Storage**:
   - Powered by Neon PostgreSQL cloud database with full version history snapshots and audit logging.
