# Proposal Builder - Technical Scope Document (Next.js + Prisma + PostgreSQL)

## 1. Project Overview

**Product Name:** Proposal Builder  
**Purpose:** Web-based application for sales teams to create, collaborate on, and export professional business proposals  
**Target Users:** Sales team members, business experts, and business owners

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Sales Team Member** | Creates and edits proposals | Create, edit own proposals, request approval |
| **Business Expert** | Reviews proposals for accuracy | View, comment, suggest edits |
| **Owner** | Final approval authority | Full access, approve/reject, view all proposals |

### 2.2 Permission Matrix

| Action | Sales Team | Business Expert | Owner |
|--------|-----------|-----------------|-------|
| Create Proposal | ✓ | ✗ | ✓ |
| Edit Own Proposal | ✓ | ✗ | ✓ |
| View All Proposals | ✗ | ✓ | ✓ |
| Comment/Feedback | ✓ | ✓ | ✓ |
| Approve Proposal | ✗ | ✗ | ✓ |
| Export DOCX | ✓ | ✓ | ✓ |
| Share for Collaboration | ✓ | ✓ | ✓ |

---

## 3. Core Features

All functionality remains identical to the Laravel document, including:
- Authentication & User Management
- Section Library & Template Builder
- Proposal Editor with Rich Text and Dynamic Sections
- Collaboration, Comments, and Approval Workflow
- DOCX/PDF Export and Delivery

---

## 4. Technical Architecture (Updated)

### 4.1 Technology Stack

**Frontend:**
- Framework: **Next.js 15 (App Router, React 19)**
- Language: **TypeScript**
- UI Library: **Tailwind CSS** or **SCSS**
- State Management: **Zustand / React Query**
- Rich Text Editor: **TipTap** or **CKEditor 5**
- Table Builder: Custom React component
- File Upload: **AWS S3 (via presigned URLs)**
- Routing: **Next.js App Router**

**Backend (API):**
- Framework: **Next.js API Routes** (server actions) or **Express within Next.js server)**
- ORM: **Prisma ORM**
- Database: **PostgreSQL 15+**
- Authentication: **NextAuth.js (JWT sessions)**
- File Storage: **AWS S3**
- Export Engine:
  - **DOCX:** `docx` / `docxtemplater`
  - **PDF:** `pdf-lib` / `puppeteer`

**Hosting:**
- Frontend + API: **Vercel / AWS EC2 / DigitalOcean**
- Database: **AWS RDS (PostgreSQL)**
- File Storage: **AWS S3**
- CDN: **CloudFront** or **Vercel Edge**

---

## 4.2 Prisma Database Schema (PostgreSQL)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SALES_TEAM
  BUSINESS_EXPERT
  OWNER
}

enum ProposalStatus {
  DRAFT
  IN_REVIEW
  PENDING_APPROVAL
  APPROVED
  REJECTED
  SENT
}

enum Permission {
  VIEW
  EDIT
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  password       String
  name           String
  role           Role
  companyName    String?
  phone          String?
  avatarUrl      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  templates      Template[]
  proposals      Proposal[] @relation("CreatedProposals")
  approvedProposals Proposal[] @relation("ApprovedProposals")
  comments       Comment[]
  images         Image[]
  companySetting CompanySetting?
}

model Template {
  id          String   @id @default(cuid())
  name        String
  category    String?
  sections    Json
  thumbnailUrl String?
  isActive    Boolean  @default(true)
  createdBy   String?
  creator     User?    @relation(fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Proposal {
  id              String   @id @default(cuid())
  title           String
  templateId      String?
  template        Template? @relation(fields: [templateId], references: [id])
  content         Json
  clientName      String?
  clientCompany   String?
  clientEmail     String?
  clientAddress   String?
  clientLogoUrl   String?
  status          ProposalStatus @default(DRAFT)
  createdBy       String
  creator         User           @relation("CreatedProposals", fields: [createdBy], references: [id])
  approvedBy      String?
  approver        User?          @relation("ApprovedProposals", fields: [approvedBy], references: [id])
  approvedAt      DateTime?
  rejectionReason String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  shares          ProposalShare[]
  comments        Comment[]
  pricingItems    PricingItem[]
  images          Image[]
  versions        VersionHistory[]
}

model ProposalShare {
  id                String   @id @default(cuid())
  proposalId        String
  proposal          Proposal @relation(fields: [proposalId], references: [id])
  sharedWithUserId  String
  sharedWith        User     @relation(fields: [sharedWithUserId], references: [id])
  permission        Permission @default(VIEW)
  sharedById        String
  sharedBy          User     @relation(fields: [sharedById], references: [id])
  sharedAt          DateTime @default(now())
}

model Comment {
  id                String   @id @default(cuid())
  proposalId        String
  proposal          Proposal @relation(fields: [proposalId], references: [id])
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  sectionId         String?
  content           String
  parentCommentId   String?
  parentComment     Comment? @relation("CommentReplies", fields: [parentCommentId], references: [id])
  replies           Comment[] @relation("CommentReplies")
  isResolved        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model PricingItem {
  id              String   @id @default(cuid())
  proposalId      String
  proposal        Proposal @relation(fields: [proposalId], references: [id])
  serviceDescription String
  cost            Float
  frequency       String?
  orderIndex      Int?
  createdAt       DateTime @default(now())
}

model Image {
  id          String   @id @default(cuid())
  proposalId  String?
  proposal    Proposal? @relation(fields: [proposalId], references: [id])
  url         String
  filename    String?
  fileSize    Int?
  imageType   String?
  uploadedBy  String?
  uploader    User?    @relation(fields: [uploadedBy], references: [id])
  uploadedAt  DateTime @default(now())
}

model VersionHistory {
  id              String   @id @default(cuid())
  proposalId      String
  proposal        Proposal @relation(fields: [proposalId], references: [id])
  contentSnapshot Json
  changedBy       String?
  changer         User?    @relation(fields: [changedBy], references: [id])
  changeDescription String?
  createdAt       DateTime @default(now())
}

model CompanySetting {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  companyName     String?
  logoUrl         String?
  address         String?
  phone           String?
  email           String?
  website         String?
  defaultPaymentTerms String?
  defaultValidityDays Int? @default(30)
  taxRate         Float?  @default(18.0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 5. Authentication Flow (NextAuth.js)
- Email/password authentication
- JWT session tokens stored in cookies
- Roles (Sales Team, Business Expert, Owner) handled via middleware
- Protected API routes using Next.js middleware

---

## 6. API Layer (Next.js API Routes)
Endpoints mirror the Laravel routes, but implemented as `/api/*` routes within Next.js:

Example:
```
GET /api/proposals
POST /api/proposals
PUT /api/proposals/[id]
DELETE /api/proposals/[id]
```

Additional routes for:
- `/api/templates`
- `/api/sections`
- `/api/comments`
- `/api/export/pdf`
- `/api/export/docx`
- `/api/settings/company`

---

## 7. Export & File Handling
- **DOCX:** Generated using `docx` or `pizzip + docxtemplater` from structured JSON.
- **PDF:** Generated from HTML using `puppeteer` (headless Chrome) or `pdf-lib`.
- **Image Uploads:** AWS S3 (presigned URLs, managed via server API).

---

## 8. Non-Functional Requirements
- JWT expiry: 24 hours
- API response time: < 500ms
- Auto-save every 30 seconds
- Secure HTTPS via SSL
- XSS, CSRF, SQL injection protection
- DB Indexing on frequently queried columns

---

## 9. Development Setup

### Local Development
```
1. git clone <repo-url>
2. cd proposal-builder
3. npm install
4. npx prisma migrate dev
5. npm run dev
```

### Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/proposal_builder
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=proposal-builder-assets
```

---

## 10. Deployment
- **Frontend + API:** Deployed to Vercel or AWS EC2
- **Database:** PostgreSQL on AWS RDS
- **Storage:** AWS S3
- **CDN:** CloudFront or Vercel Edge

---

## 11. Timeline (16 Weeks)
Same as original — only difference is Next.js & Prisma setup during backend phase.

---

## 12. Success Metrics
Same as before: faster proposal creation, higher approval efficiency, export accuracy, and user adoption.

---

**Document Version:** 3.0  
**Tech Stack:** Next.js + Prisma + PostgreSQL  
**Last Updated:** November 2025  
**Status:** Migrated from Laravel to Next.js Architecture

