# Proposal Builder

A professional proposal management web application that enables sales teams to create, manage, and export polished business proposals. Features a Word365-style rich text editor, role-based access control, multi-format export (PDF/DOCX), and a complete proposal workflow system.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Authentication System](#1-authentication-system)
  - [Role-Based Access Control](#2-role-based-access-control)
  - [Proposal Management](#3-proposal-management)
  - [Rich Text Editor](#4-rich-text-editor)
  - [Section-Based Editing](#5-section-based-editing)
  - [Export System](#6-export-system)
  - [Template System](#7-template-system)
  - [Company Settings](#8-company-settings)
  - [File Upload](#9-file-upload)
- [Internal Working](#internal-working)
  - [Database Schema](#database-schema)
  - [Authentication Flow](#authentication-flow)
  - [Editor Architecture](#editor-architecture)
  - [Export Pipeline](#export-pipeline)
- [Suggested Improvements](#suggested-improvements)
- [Development Setup](#development-setup)
- [API Reference](#api-reference)

---

## Overview

Proposal Builder is a full-stack web application designed for business development teams to streamline their proposal creation process. It replaces manual document creation with a structured, reusable system that maintains brand consistency across all client-facing proposals.

**Key Value Propositions:**
- **Structured Workflow** — Proposals move through defined statuses (Draft → Review → Approval → Sent), ensuring proper oversight before client delivery
- **Reusable Templates** — Start from pre-built templates to maintain consistency and save time
- **Rich Formatting** — Word365-style editor with font controls, tables, lists, and custom styling
- **Multi-Format Export** — Export polished PDF or DOCX files ready for client distribution
- **Team Collaboration** — Role-based access ensures the right people see the right proposals

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|--------|
| **Framework** | Next.js (App Router) | 16.0.1 |
| **Language** | TypeScript | 5.9.3 |
| **UI Library** | React | 19.2.0 |
| **Database** | PostgreSQL + Prisma ORM | 6.18.0 |
| **Authentication** | NextAuth v5 (Auth.js) | beta-30 |
| **Rich Text Editor** | Tiptap | 3.10.1 |
| **Styling** | Tailwind CSS | 4.1.16 |
| **PDF Export** | jsPDF | 4.2.1 |
| **DOCX Export** | docx | 9.5.1 |
| **Email** | Nodemailer | 8.0.7 |
| **Validation** | Zod | 4.1.12 |
| **Icons** | Lucide React | 1.14.0 |
| **Password Hashing** | bcrypt | 6.0.0 |
| **Run Scripts** | tsx | 4.20.6 |

---

## Project Structure

```
/
├── app/                          # Next.js App Router pages and API routes
│   ├── api/                      # REST API endpoints
│   │   ├── auth/
│   │   │   ├── forgot-password/
│   │   │   │   └── route.ts     # Password reset email trigger
│   │   │   ├── reset-password/
│   │   │   │   └── route.ts    # Token validation & reset
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth handler
│   │   ├── export/
│   │   │   ├── docx/
│   │   │   │   └── route.ts    # DOCX export with HTML parsing
│   │   │   └── pdf/
│   │   │       └── route.ts     # PDF export
│   │   ├── permissions/
│   │   │   └── route.ts        # List all permissions
│   │   ├── proposals/
│   │   │   ├── [id]/
│   │   │   │   ├── duplicate/
│   │   │   │   │   └── route.ts  # Duplicate proposal
│   │   │   │   ├── route.ts      # GET/PUT/DELETE single proposal
│   │   │   │   └── status/
│   │   │   │       └── route.ts  # Update proposal status
│   │   │   └── route.ts       # GET/POST proposals
│   │   ├── roles/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts   # Update/delete role
│   │   │   └── route.ts       # GET/POST roles
│   │   ├── settings/
│   │   │   └── route.ts       # Company settings CRUD
│   │   ├── templates/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts  # Template CRUD
│   │   │   └── route.ts      # List/create templates
│   │   ├── upload/
│   │   │   └── route.ts     # Image upload to local storage
│   │   └── users/
│   │       ├── [id]/
│   │       │   ├── permissions/
│   │       │   │   │   └── route.ts  # User-level permissions
│   │       │   │   └── route.ts    # User CRUD
│   │       └── route.ts       # User listing & creation
│   ├── auth/                   # Public auth pages
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── signin/
│   │       └── page.tsx       # Login page
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── layout.tsx         # Dashboard auth guard
│   │   ├── page.tsx          # Dashboard home
│   │   ├── proposals/
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # Create proposal
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx   # View/edit proposal
│   │   │   └── page.tsx      # Proposal list
│   │   ├── roles/
│   │   │   └── page.tsx      # Role management
│   │   ├── settings/
│   │   │   └── page.tsx      # Company settings
│   │   ├── templates/
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # Create template
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx  # Edit template
│   │   │   │   └── page.tsx   # View template
│   │   │   └── page.tsx      # Template list
│   │   └── users/
│   │       └── page.tsx       # User management
│   ├── layout.tsx             # Root layout
│   └── page.tsx             # Root redirect
│
├── components/                 # React components
│   ├── Header.tsx            # App header with user info
│   ├── ProposalEditor.tsx   # Basic Tiptap editor (legacy)
│   ├── Providers.tsx         # NextAuth session provider
│   ├── SectionEditor.tsx     # Multi-section editor component
│   └── Word365Editor.tsx      # Full Word365-style rich editor
│
├── lib/                     # Server-side utilities
│   ├── auth.ts             # NextAuth config & callbacks
│   ├── email.ts           # Nodemailer email service
│   ├── formatDate.ts      # Date formatting utility
│   └── prisma.ts          # Prisma client singleton
│
├── prisma/                 # Database layer
│   ├── schema.prisma       # 12-model database schema
│   ├── seed.ts           # Base seeder
│   ├── seed-from-docx.ts  # DOCX import seeder
│   ├── seed-century-ply.ts  # Sample data seeder
│   └── seed-role-permissions.ts  # RBAC seeder
│
├── public/                  # Static assets
│   └── uploads/            # Uploaded files storage
│
├── scripts/
│   └── extract-docx.ts     # DOCX parsing script
│
└── types/
    └── next-auth.d.ts      # NextAuth type augmentation
```

---

## Features

### 1. Authentication System

**Sign In**
- Email and password authentication using NextAuth v5 Credentials provider
- JWT-based sessions with 24-hour expiry
- Automatic redirect (authenticated users go to `/dashboard`, unauthenticated to `/auth/signin`)
- Error handling for invalid credentials and deactivated accounts

**Password Reset Flow**
1. User submits email at `/auth/forgot-password`
2. Server generates a secure random token (32 bytes hex)
3. Token stored in DB with 1-hour expiry (`resetTokenExpiry`)
4. Email sent with reset link containing token
5. User clicks link → lands at `/auth/reset-password?token=xxx`
6. Server validates token existence and expiry
7. User submits new password → bcrypt hash updated in DB
8. Token cleared after use

**Account Management**
- Users can change their own password via Settings page
- Admin can activate/deactivate user accounts
- Deactivated accounts cannot sign in (returns `ACCOUNT_DEACTIVATED` error)

**Internal Working:**
- Passwords hashed with bcrypt (cost factor 10)
- JWT stores: `id`, `role`, `permissions` (array of permission names)
- Session callback merges role permissions + custom user permissions into single array
- All API routes use `auth()` from `@/lib/auth` to protect endpoints

---

### 2. Role-Based Access Control

**Built-in Roles:**
| Role | Description | Default Permissions |
|------|-------------|-----------------|
| OWNER | Full system access | All permissions |
| SALES_TEAM | Proposal creators | Create/edit own proposals |
| BUSINESS_EXPERT | View proposals | View all proposals |

**Custom Roles:**
- Administrators can create new roles via `/dashboard/roles`
- Each role has a name, description, and set of default permissions
- Roles can be marked as "default" (new users get this role automatically)
- Roles with users assigned cannot be deleted (protection)

**Permission Categories:**
- Permissions grouped by category (e.g., `Proposal`, `User`, `Template`)
- Each permission has: `id`, `name`, `description`, `category`
- Many-to-many: Roles ↔ Permissions, Users ↔ Permissions
- User effective permissions = Role permissions + Custom permissions

**User-Level Override:**
- Users can have custom permissions beyond their role
- Custom permissions are additive (not subtractive)
- Useful for granting temporary access without role changes

**Internal Working:**
- Prisma schema defines `Role`, `Permission`, and junction tables
- `User` model has `roleId` (FK to Role) and `customPermissions` (M2M)
- Auth callbacks in `lib/auth.ts` resolve permissions at login
- API routes check `session.user.role` and `session.user.permissions`

---

### 3. Proposal Management

**Proposal Lifecycle:**
```
DRAFT → IN_REVIEW → PENDING_APPROVAL → APPROVED → REJECTED → SENT
```

- **DRAFT** — Initial state, editable by creator
- **IN_REVIEW** — Submitted for internal review
- **PENDING_APPROVAL** — Awaiting approver decision
- **APPROVED** — Cleared for client delivery
- **REJECTED** — Needs revision (stores `rejectionReason`)
- **SENT** — Delivered to client

**Access Control:**
- SALES_TEAM users see only their own proposals
- OWNER and BUSINESS_EXPERT can see all proposals
- Only OWNER can delete proposals
- Proposals track `createdBy` (user FK) and `approvedBy` (user FK)

**Client Information:**
- Client name, company, email, address
- Client logo (uploaded image URL)
- Stored in proposal record for use in exports

**Comments System:**
- Threaded comments on proposals
- Comments can be tied to a specific section (`sectionId`)
- Comments can be marked as resolved
- Parent-child structure for replies

**Proposal Sharing:**
- Proposals can be shared with other users
- Share permission: `VIEW` (currently only option)
- Tracks `sharedBy` and `sharedWith` (both User FK)
- `sharedAt` timestamp

**Version History:**
- Every proposal update saves a snapshot (`contentSnapshot`)
- Tracks `changedBy` user and change description
- Useful for audit trail and rollback

**Internal Working:**
- Proposal status updated via `/api/proposals/[id]/status` (PATCH)
- Rejection reason stored in `rejectionReason` field
- Approval updates `approvedBy` and `approvedAt`
- All proposal changes logged via `VersionHistory`

---

### 4. Rich Text Editor

**Word365Editor Component** (`components/Word365Editor.tsx`)

The centerpiece of the application — a feature-rich Tiptap-based WYSIWYG editor styled like Microsoft Word 365.

**Text Formatting:**
- **Bold** (Ctrl+B), **Italic** (Ctrl+I), **Underline** (Ctrl+U), **Strikethrough**
- Active state indicators (blue highlight + border on active buttons)

**Font Controls:**
- Font family dropdown: Arial, Times New Roman, Calibri, Georgia, Verdana, Courier New, Comic Sans MS, Impact, Trebuchet MS, Palatino
- Font size dropdown: 10px to 40px (11 options)
- Custom Tiptap extension (`FontSize`) handles size rendering

**Color Controls:**
- Text color picker: 14 colors in 2×7 grid
- Highlight color picker: 12 pastel colors
- Remove highlight button

**Paragraph Styles:**
- Heading 1, Heading 2, Heading 3, Normal
- Lists: Bullet list, Numbered list (with custom SVG icons)
- Text alignment: Left, Center, Right, Justify

**Table Support:**
- Insert table (3×3 default, with header row)
- Add/remove columns and rows
- Merge/split cells
- Delete table
- Visual selection highlighting (blue background on selected cells)

**Undo/Redo:**
- Full history stack
- Disabled state when at boundary

**Internal Working:**
- Tiptap extensions: StarterKit, Placeholder, Link, Underline, TextAlign, Highlight, TextStyle, FontFamily, Color, Table family
- `immediatelyRender: false` for SSR compatibility
- Content stored as `{ html, json }` object
- `useEffect` syncs content when prop changes
- `setEditable()` toggles read-only mode
- Custom CSS styles via `ProseMirror` selectors for headings, lists, tables, blockquotes, code blocks
- Dynamic import (`ssr: false`) to avoid hydration issues

---

### 5. Section-Based Editing

**SectionEditor Component** (`components/SectionEditor.tsx`)

Proposals are organized into multiple independently-editable sections.

**Section Properties:**
- `id` — Unique identifier (timestamp-based)
- `title` — Section heading (inline editable)
- `content` — Word365Editor JSON content
- `order` — Sort index (0-based)
- `type` — Section category

**Section Types:**
| Type | Description | Use Case |
|------|-------------|---------|
| `text` | Standard rich text | Body content, descriptions |
| `pricing` | Pricing table | Service costs and fees |
| `timeline` | Timeline/milestones | Project phases |
| `custom` | Custom content | Specialized sections |

**Interactions:**
- **Add Section** — Appends new section with "New Section" title
- **Delete Section** — Removes from array
- **Reorder** — Move up/down buttons swap adjacent sections
- **Expand/Collapse** — Chevron toggle shows/hides content
- **Section Type** — Dropdown to change type (non-readonly only)

**Internal Working:**
- Sections stored as JSON array in proposal's `content` field
- `onChange` callback propagates changes to parent state
- Collapsed state managed via `expandedSections` string array
- Each section renders its own `Word365Editor`
- Dynamic import wraps editor for SSR safety

---

### 6. Export System

**PDF Export** (`/api/export/pdf`)

Uses `jsPDF` to generate downloadable PDF files.

**Document Structure:**
1. **Header** — Company name (top right)
2. **Title** — Proposal title (28pt, centered)
3. **Horizontal rule** — Visual separator
4. **Submitted to** — Client name, company, address
5. **Submitted by** — Creator name, company
6. **Content sections** — Parsed HTML → plain text
7. **Pricing table** — Services + costs (if pricing items exist)
8. **Footer** — Date, title, page number (all pages)

**Internal Working:**
- HTML stripped of tags, entities decoded (`&nbsp;` → space, etc.)
- Text wrapped via `splitTextToSize()` for line breaking
- Automatic page breaks when `yPosition > pageHeight - 30`
- Company settings fetched for branding
- Access check: creator, OWNER, or BUSINESS_EXPERT only
- Returns `application/pdf` with sanitized filename

---

**DOCX Export** (`/api/export/docx`)

Uses the `docx` npm package to generate Microsoft Word-compatible files.

**Document Structure:**
1. **Header** — Company logo (right-aligned) or company name
2. **Cover page** — Client logo, title, submitted to/by sections
3. **Page break** — Before content
4. **Section headings** — Bold section titles
5. **Section content** — Parsed HTML with full formatting
6. **Pricing breakdown** — If pricing items exist

**Advanced HTML Parsing Engine:**

The DOCX export includes a custom-built HTML parser that handles:

| Feature | Implementation |
|---------|---------------|
| **Inline formatting** | Bold (`<strong>`, `<b>`), italic (`<em>`, `<i>`), underline, strikethrough, code |
| **Font styling** | Color extraction from `style` attribute (hex or RGB) |
| **Font size** | Parses `font-size` from `style` (px, pt, or unitless), converts to half-points |
| **Font family** | Extracts and applies font |
| **Background/highlight** | Converts background-color to DOCX highlight |
| **Text alignment** | Left, center, right, justified from `text-align` |
| **Tables** | Full `<table>` → DOCX `Table` conversion with headers, rows, cells, spans |
| **Lists** | `<ul>` → bullet list, `<ol>` → numbered list (3 levels deep) |
| **Headings** | H1/H2/H3 → DOCX heading levels |
| **Images** | Local files (`/uploads/`) and remote URLs (http/https) |
| **Page/line breaks** | Preserved as appropriate |
| **Entity decoding** | `&nbsp;`, `&amp;`, `&lt;`, `&gt;` decoded |

**Tiptap JSON → HTML Converter:**
- Converts Tiptap's internal JSON format to HTML
- Handles all marks: bold, italic, underline, strike, code, textStyle, highlight
- Converts nodes: doc, paragraph, heading, bulletList, orderedList, listItem, table, tableRow, tableCell, tableHeader

**Internal Working:**
- Images loaded via `readFileSync` (local) or `http/https` (remote)
- Paragraph alignment from `style="text-align: center"` detection
- Header/footer with date, title, and page number (using `PageNumber.CURRENT`)
- Numbering configuration for ordered/unordered lists
- Returns `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

### 7. Template System

**Template Model:**
- `name` — Template title
- `category` — Grouping (e.g., "Sales", "Technical")
- `sections` — JSON array (same structure as proposal sections)
- `thumbnailUrl` — Preview image
- `isActive` — Soft delete flag
- `createdBy` — Creator user

**Usage:**
1. User navigates to `/dashboard/proposals/new`
2. Selects a template from dropdown
3. Template sections loaded into editor
4. User customizes content
5. Creates proposal from template

**API Endpoints:**
- `GET /api/templates` — List all templates
- `POST /api/templates` — Create template
- `GET /api/templates/[id]` — Get single template
- `PUT /api/templates/[id]` — Update template
- `DELETE /api/templates/[id]` — Soft delete (sets `isActive = false`)

**Seeders:**
- `prisma/seed.ts` — Base seed
- `prisma/seed-role-permissions.ts` — RBAC data
- `prisma/seed-century-ply.ts` — Sample proposal data
- `prisma/seed-from-docx.ts` — Import from DOCX file

---

### 8. Company Settings

**Per-User Settings** (`CompanySetting` model):
- Company name, logo URL
- Address, phone, email, website
- Default payment terms (e.g., "Net 30")
- Default validity days (default: 30)
- Tax rate (default: 18.0%)

**API:**
- `GET/POST /api/settings` — Fetch or create settings
- Uses current user's ID (`session.user.id`)

**UI:**
- Settings page at `/dashboard/settings`
- Company logo upload
- Password change form
- Validation (logo: 2MB max, image types only)

---

### 9. File Upload

**Endpoint:** `POST /api/upload`

**Features:**
- Accepts image files only (JPEG, PNG, GIF, WEBP)
- Max size: 5MB
- Saves to `public/uploads/` with timestamp prefix
- Returns public URL path (`/uploads/filename`)

**Internal Working:**
- `FormData` parsing via `req.formData()`
- File type and size validation
- Unique filename: `{timestamp}-{sanitized-original-name}`
- Uses Node.js `fs/promises` (not filesystem in production — see improvements)
- Directory auto-created if missing

---

## Internal Working

### Database Schema

**12 Prisma Models:**

```
User (1) ─── (1) Role
  │             │
  │             └─── M2M ─── Permission
  │
  ├─── M2M ─── Permission (custom overrides)
  │
  └─── 1:1 ─── CompanySetting

User ─── 1:N ─── Proposal (createdBy)
User ─── 1:N ─── Proposal (approvedBy)
User ─── 1:N ─── Comment
User ─── 1:N ─── Image (uploadedBy)
User ─── 1:N ─── ProposalShare (sharedWith / sharedBy)
User ─── 1:N ─── VersionHistory (changedBy)

Proposal (1) ─── (M) Comment
Proposal (1) ─── (M) PricingItem
Proposal (1) ─── (M) Image
Proposal (1) ─── (M) ProposalShare
Proposal (1) ─── (M) VersionHistory
Proposal (M) ─── (1) Template
```

**Key Enums:**
- `ProposalStatus`: DRAFT, IN_REVIEW, PENDING_APPROVAL, APPROVED, REJECTED, SENT

**Key JSON Fields:**
- `Template.sections` — Array of section objects
- `Proposal.content` — Nested sections with `{ html, json }` content
- `VersionHistory.contentSnapshot` — Full proposal state at point in time

---

### Authentication Flow

```
1. User submits email + password
       │
       ▼
2. NextAuth.authorize() in lib/auth.ts
       │
       ▼
3. Prisma query: find user by email (include role + permissions)
       │
       ▼
4. Check isActive flag ── ✗ ── Return null (signin fails)
       │
       ▼ Yes
5. bcrypt.compare(password, hash)
       │
       ▼ ✗ ── Return null (signin fails)
       │
       ▼ Yes
6. Build permissions array: role.permissions[] + user.customPermissions[]
       │
       ▼
7. JWT callback stores: id, role, permissions
       │
       ▼
8. Session callback merges into session.user
       │
       ▼
9. Return session object
```

**JWT Strategy:**
- `maxAge: 24 * 60 * 60` (24 hours)
- `strategy: 'jwt'` (database sessions not used)
- Trust host enabled for NextAuth URL configuration

---

### Editor Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ProposalEditor                        │
│  (Basic Tiptap - legacy, used in older pages)            │
│  Extensions: StarterKit, Placeholder, Link,          │
│  Underline, TextAlign, Highlight                     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ rendered by
┌─────────────────────────────────────────────────────────┐
│                   SectionEditor                       │
│  • Manages sections[] array                         │
│  • Expand/collapse, reorder, add, delete            │
│  • Renders Word365Editor per section                │
│  • Dynamic import (ssr: false)                   │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ rendered by
┌─────────────────────────────────────────────────────────┐
│                   Word365Editor                       │
│  Full-featured Tiptap editor with Word UI             │
│  Extensions: StarterKit, TextStyle, FontFamily,     │
│  Color, Table, TableRow, TableCell, TableHeader   │
│  + custom FontSize extension                      │
│  • Font family/size dropdowns                    │
│  • Formatting buttons with active state             │
│  • Color/highlight pickers                       │
│  • Paragraph styles (H1-H3, Normal)           │
│  • Lists, alignment, tables                    │
│  • Undo/redo                                  │
└─────────────────────────────────────────────────────────┘
```

**Content Format:**
```typescript
interface SectionContent {
  html: string   // Raw HTML string
  json: object  // Tiptap JSON representation
}
```

---

### Export Pipeline

**PDF Export:**
```
Request { proposalId }
       │
       ▼
Auth check (session.user required)
       │
       ▼
Fetch proposal + company settings
       │
       ▼
Access check (creator or OWNER or BUSINESS_EXPERT)
       │
       ▼
Parse sections from content.sections[]
       │
       ▼
For each section:
  • Strip HTML tags
  • Decode entities
  • Wrap text for A4 width
  • Add to jsPDF doc
       │
       ▼
Add pricing table if items exist
       │
       ▼
Add page numbers to all pages
       │
       ▼
Return PDF buffer as attachment
```

**DOCX Export:**
```
Request { proposalId }
       │
       ▼
Auth check
       │
       ▼
Fetch proposal + company settings
       │
       ▼
Access check
       │
       ▼
Load images (local file or remote URL)
       │
       ▼
Build HTML from sections:
  • Parse Tiptap JSON → HTML (tiptapJsonToHtml)
  • Parse HTML → HTML nodes (parseHtmlToNodes)
       │
       ▼
Convert nodes to DOCX elements:
  • Inline nodes → TextRun[]
  • Block nodes → Paragraph[] / Table[]
  • Lists with numbering config
  • Tables with cell merging
       │
       ▼
Build document with header/footer
       │
       ▼
Return DOCX buffer as attachment
```

---

## Suggested Improvements

### High Priority

| # | Improvement | Description | Effort |
|---|-------------|-------------|--------|
| 1 | **Object Storage** | Migrate file uploads from local disk (`public/uploads/`) to AWS S3 or Cloudflare R2. Local storage doesn't scale, loses files on redeploy, and has no CDN. | Medium |
| 2 | **Real-Time Collaboration** | Add Y.js or Hocuspocus for multi-user simultaneous editing. Currently only one user can edit at a time. | High |
| 3 | **Rate Limiting** | Add rate limiting on auth endpoints to prevent brute-force attacks. Use `rate-limiter-flexible` or middleware. | Low |
| 4 | **2FA / MFA** | Add TOTP-based two-factor authentication for enhanced security. | Medium |
| 5 | **Unit/Integration Tests** | Add tests with Vitest + React Testing Library. Current codebase has no test coverage. | Medium |
| 6 | **Audit Logging** | Log all CRUD operations on proposals, users, and roles with timestamps and user ID. | Medium |

### Medium Priority

| # | Improvement | Description | Effort |
|---|-------------|-------------|--------|
| 7 | **Template Versioning** | Track template changes over time, allow rollback to previous versions. | Medium |
| 8 | **Proposal Analytics** | Track proposal views, time spent, export downloads. Add dashboard metrics. | Medium |
| 9 | **E-Signature Integration** | Integrate DocuSign, HelloSign, or Adobe Sign for client e-signatures. | High |
| 10 | **Full-Text Search** | Implement Postgres `tsvector` or Meilisearch for searching proposal content. | Medium |
| 11 | **Loading States** | Add skeleton screens during data fetching instead of "Loading..." text. | Low |
| 12 | **Query Optimization** | Add Prisma `select` to avoid over-fetching, pagination for list endpoints, and index suggestions. | Low |
| 13 | **Webhooks** | Send webhook notifications on proposal status changes for CRM integrations. | Medium |
| 14 | **Proposal Cloning** | Clone existing proposals (not just templates) as starting point. | Low |
| 15 | **Duplicate Detection** | Warn users when creating proposals similar to existing ones. | Medium |

### Lower Priority

| # | Improvement | Description | Effort |
|---|-------------|-------------|--------|
| 16 | **Mobile Responsive Views** | Optimize the UI for mobile/tablet with a separate mobile layout or responsive breakpoints. | High |
| 17 | **In-App Notifications** | Add notification bell with alerts for comments, approvals, and proposal shares. | Medium |
| 18 | **Public API** | Expose REST API for third-party integrations (CRM, analytics tools). | High |
| 19 | **Theme Customization** | Allow per-user or per-company color themes and branding beyond just logo. | Medium |
| 20 | **Scheduled Reports** | Email weekly/monthly proposal summary reports to stakeholders. | Medium |
| 21 | **AI Assistant** | Integrate LLM for proposal content suggestions, grammar checking, and tone adjustment. | High |
| 22 | **Drag-and-Drop Reorder** | Replace up/down buttons with drag-and-drop reordering for sections. | Low |
| 23 | **Comments Mentions** | @mention users in comments with notification. | Medium |
| 24 | **Bulk Actions** | Bulk status changes, delete, export for multiple proposals. | Medium |

---

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- SMTP server (for password reset emails)

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/proposal_builder"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# SMTP (for emails)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASS="smtp-password"
SMTP_FROM="Proposal Builder <noreply@example.com>"
```

### Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev
```

### Database Scripts

```bash
# Seed base data (users, roles, permissions)
npm run db:seed

# Import sample data from DOCX
npm run db:seed-docx

# Seed sample proposal data
npm run db:seed-century
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/forgot-password` | Send reset email | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |
| GET | `/api/auth/[...nextauth]` | NextAuth handler | — |

### Proposal Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/proposals` | List proposals | Required |
| POST | `/api/proposals` | Create proposal | SALES_TEAM, OWNER |
| GET | `/api/proposals/[id]` | Get proposal | Owner or Creator |
| PUT | `/api/proposals/[id]` | Update proposal | Owner or Creator |
| DELETE | `/api/proposals/[id]` | Delete proposal | OWNER |
| PATCH | `/api/proposals/[id]/status` | Update status | Required |
| POST | `/api/proposals/[id]/duplicate` | Duplicate proposal | Creator |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | List users | OWNER |
| POST | `/api/users` | Create user | OWNER |
| PUT | `/api/users/[id]` | Update user | OWNER |
| DELETE | `/api/users/[id]` | Delete user | OWNER |
| PATCH | `/api/users/[id]/permissions` | User permissions | OWNER |

### Role Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/roles` | List roles | Required |
| POST | `/api/roles` | Create role | OWNER |
| PUT | `/api/roles/[id]` | Update role | OWNER |
| DELETE | `/api/roles/[id]` | Delete role | OWNER |

### Template Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/templates` | List templates | Required |
| POST | `/api/templates` | Create template | Required |
| GET | `/api/templates/[id]` | Get template | Required |
| PUT | `/api/templates/[id]` | Update template | Owner |
| DELETE | `/api/templates/[id]` | Delete template | Owner |

### Other Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/permissions` | List permissions | Required |
| GET | `/api/settings` | Get company settings | Required |
| POST | `/api/settings` | Save company settings | Required |
| POST | `/api/upload` | Upload image | Required |
| POST | `/api/export/pdf` | Export as PDF | Required |
| POST | `/api/export/docx` | Export as DOCX | Required |

---

*Built with Next.js, Tiptap, Prisma, and NextAuth.*