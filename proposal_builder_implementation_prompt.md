# Proposal Builder — Complete AI Agent Implementation Prompt

> **How to use this file:** Pass this entire document as your prompt to any AI coding agent (Cursor, Claude Code, Copilot Workspace, etc.). The agent should follow each phase sequentially. Do not skip phases. Every section marked ⚠️ is a hard requirement that must not be compromised.

---

## Project Summary

Build a **Proposal Builder** — a full-stack web application that eliminates repetitive manual proposal writing. Teams can create proposals from templates, edit them in a rich editor, submit for review, receive change requests, resubmit, and export to PDF/DOCX with **pixel-perfect formatting fidelity**.

The core loop is:
```
Create → Edit → Submit for Review → Receive Changes → Edit → Resubmit → Approve → Export → Save as Template
```

---

## Tech Stack (Do Not Deviate)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5+ |
| UI | React | 18+ |
| Database | PostgreSQL + Prisma ORM | Latest |
| Auth | NextAuth v5 (Auth.js) | beta |
| Rich Text Editor | Tiptap | 2+ |
| Styling | Tailwind CSS | 3+ |
| PDF Export | Puppeteer (headless Chrome) | Latest |
| DOCX Export | docx (npm) | 8+ |
| Email | Nodemailer | Latest |
| Validation | Zod | Latest |
| Icons | Lucide React | Latest |
| Password Hashing | bcryptjs | Latest |

> ⚠️ **Critical:** Use **Puppeteer** for PDF export (not jsPDF). Puppeteer renders the actual HTML/CSS of the proposal in a headless browser and captures it as PDF. This is the only reliable way to guarantee formatting fidelity between the editor view and the exported PDF.

---

## Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/proposal_builder"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-strong-secret-here"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASS="your-smtp-password"
SMTP_FROM="Proposal Builder <noreply@example.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Database Schema (Prisma)

Create `prisma/schema.prisma` with the following models exactly:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String       @id @default(cuid())
  name              String
  email             String       @unique
  password          String
  isActive          Boolean      @default(true)
  resetToken        String?
  resetTokenExpiry  DateTime?
  roleId            String?
  role              Role?        @relation(fields: [roleId], references: [id])
  userPermissions   UserPermission[]
  proposals         Proposal[]   @relation("ProposalCreator")
  comments          Comment[]
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

model Role {
  id          String           @id @default(cuid())
  name        String           @unique
  description String?
  isSystem    Boolean          @default(false)
  users       User[]
  permissions RolePermission[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model Permission {
  id              String           @id @default(cuid())
  name            String           @unique
  description     String?
  rolePermissions RolePermission[]
  userPermissions UserPermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
}

model UserPermission {
  userId       String
  permissionId String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([userId, permissionId])
}

model Proposal {
  id          String         @id @default(cuid())
  title       String
  clientName  String?
  projectName String?
  status      ProposalStatus @default(DRAFT)
  content     Json
  variables   Json?
  templateId  String?
  template    Template?      @relation(fields: [templateId], references: [id])
  creatorId   String
  creator     User           @relation("ProposalCreator", fields: [creatorId], references: [id])
  comments    Comment[]
  versions    ProposalVersion[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum ProposalStatus {
  DRAFT
  UNDER_REVIEW
  CHANGES_REQUESTED
  APPROVED
  EXPORTED
}

model ProposalVersion {
  id         String   @id @default(cuid())
  proposalId String
  proposal   Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  content    Json
  version    Int
  createdAt  DateTime @default(now())
}

model Comment {
  id         String   @id @default(cuid())
  proposalId String
  proposal   Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])
  body       String
  resolved   Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Template {
  id          String     @id @default(cuid())
  name        String
  description String?
  content     Json
  variables   Json?
  isGlobal    Boolean    @default(false)
  proposals   Proposal[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model CompanySettings {
  id          String   @id @default(cuid())
  companyName String
  logo        String?
  primaryColor String  @default("#2563eb")
  address     String?
  website     String?
  phone       String?
  email       String?
  footerText  String?
  updatedAt   DateTime @updatedAt
}
```

---

## Phase 1 — Project Scaffolding

**Step 1.1 — Initialize the project**
```bash
npx create-next-app@latest proposal-builder --typescript --tailwind --app --eslint
cd proposal-builder
```

**Step 1.2 — Install all dependencies**
```bash
npm install @prisma/client prisma
npm install next-auth@beta @auth/prisma-adapter
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-text-style @tiptap/extension-color
npm install @tiptap/extension-font-family @tiptap/extension-highlight
npm install @tiptap/extension-text-align @tiptap/extension-underline
npm install @tiptap/extension-table @tiptap/extension-table-row
npm install @tiptap/extension-table-cell @tiptap/extension-table-header
npm install @tiptap/extension-image @tiptap/extension-link
npm install @tiptap/extension-placeholder @tiptap/extension-character-count
npm install docx
npm install nodemailer
npm install bcryptjs
npm install zod
npm install lucide-react
npm install puppeteer
npm install @types/nodemailer @types/bcryptjs --save-dev
```

**Step 1.3 — Setup Prisma**
```bash
npx prisma init
# Paste the schema above into prisma/schema.prisma
npx prisma migrate dev --name init
```

---

## Phase 2 — Authentication

### 2.1 NextAuth Configuration (`lib/auth.ts`)

Implement NextAuth v5 with:
- Credentials provider (email + password)
- JWT strategy, 24-hour session
- JWT callback must embed: `id`, `name`, `email`, `roleId`, `permissions[]`
- Session callback must expose the same fields on `session.user`
- On sign-in, resolve user's role permissions + individual user permissions into a flat array of permission name strings
- Return `ACCOUNT_DEACTIVATED` error if `user.isActive === false`

### 2.2 Auth Pages

Create these pages under `app/auth/`:

**`/auth/signin`** — Login form
- Email + password fields
- Show error messages inline
- Redirect to `/dashboard` on success

**`/auth/forgot-password`** — Forgot password form
- Accept email input
- POST to `/api/auth/forgot-password`
- Show success message regardless of whether email exists (security)

**`/auth/reset-password`** — Reset password form
- Read `?token=` from URL
- Validate token on load (GET `/api/auth/reset-password?token=xxx`)
- Allow new password entry if valid
- Show error if expired/invalid

### 2.3 Auth API Routes

**`POST /api/auth/forgot-password`**
1. Find user by email
2. Generate 32-byte hex token
3. Save token + expiry (now + 1 hour) to user record
4. Send email with reset link: `${NEXT_PUBLIC_APP_URL}/auth/reset-password?token=xxx`
5. Return 200 regardless of whether email was found

**`POST /api/auth/reset-password`**
1. Find user where `resetToken === token` AND `resetTokenExpiry > now()`
2. Hash new password with bcrypt (cost 10)
3. Update password, clear `resetToken` and `resetTokenExpiry`
4. Return 200

---

## Phase 3 — Dashboard Layout

Create `app/dashboard/layout.tsx`:
- Sidebar navigation with links to: Proposals, Templates, Users (admin only), Roles (admin only), Settings
- Header showing current user name + role
- Auth guard: redirect unauthenticated users to `/auth/signin`
- Wrap with `<SessionProvider>`

Dashboard home `app/dashboard/page.tsx`:
- Stats cards: Total Proposals, Under Review, Approved, Exported
- Recent Proposals table (last 10, with status badges)
- Quick action button: "New Proposal"

---

## Phase 4 — Rich Text Editor (CRITICAL)

> ⚠️ This is the most important UI component. Every formatting feature must work correctly because the export system depends on the HTML output from this editor.

### 4.1 Create `components/Word365Editor.tsx`

Build a full Word-processor-style editor using **Tiptap**. The toolbar must include:

**Text Formatting**
- Bold, Italic, Underline, Strikethrough
- Font family selector (dropdown: Arial, Times New Roman, Georgia, Calibri, Helvetica)
- Font size selector (8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72)
- Text color picker
- Highlight color picker
- Clear formatting button

**Paragraph Formatting**
- Heading styles: H1, H2, H3, Normal paragraph
- Text alignment: Left, Center, Right, Justify
- Line spacing: 1.0, 1.15, 1.5, 2.0
- Paragraph spacing before/after

**Lists**
- Bullet list
- Numbered list
- Indent / Outdent

**Insertions**
- Table (with row/column picker grid)
- Image (upload or URL)
- Horizontal rule / Page break divider

**Document Structure**
- The editor renders on a white A4-like canvas (794px wide, auto height)
- Page background is white
- Editor area has proper padding (margins: top 72px, bottom 72px, left 80px, right 80px)
- Font defaults: Arial 12pt, line-height 1.5

### 4.2 Editor Output Format

The editor must store content as **Tiptap JSON** in the database. When needed for export, convert to HTML using Tiptap's `generateHTML()` utility server-side.

### 4.3 Section-Based Editor

Proposals are composed of named **sections** (e.g., "Executive Summary", "Scope of Work", "Pricing", "Terms"). Each section:
- Has a title (editable)
- Has its own Tiptap editor instance
- Can be reordered (up/down buttons, or drag-and-drop if possible)
- Can be added or deleted
- Collapsed/expanded toggle for long proposals

Store sections as a JSON array:
```json
{
  "sections": [
    {
      "id": "uuid",
      "title": "Executive Summary",
      "content": { /* tiptap json */ }
    }
  ]
}
```

---

## Phase 5 — Proposal Management

### 5.1 Proposal List (`app/dashboard/proposals/page.tsx`)

- Table with columns: Title, Client, Status, Created By, Last Updated, Actions
- Status filter dropdown
- Search by title or client name
- Action buttons: View, Edit, Duplicate, Delete (with permission checks)
- Status badge colors: Draft=gray, Under Review=blue, Changes Requested=orange, Approved=green, Exported=purple

### 5.2 Create Proposal (`app/dashboard/proposals/new/page.tsx`)

Form fields:
- Proposal title (required)
- Client name
- Project name
- Select template (optional dropdown of available templates)
- If template selected: pre-populate sections from template content
- If no template: start with blank section titled "Introduction"

On submit: POST to `/api/proposals`, redirect to `/dashboard/proposals/[id]`

### 5.3 View/Edit Proposal (`app/dashboard/proposals/[id]/page.tsx`)

This is the main editing page. It must include:

**Top bar:**
- Proposal title (editable inline)
- Status badge
- Action buttons based on status and user role:
  - DRAFT: "Submit for Review" button
  - UNDER_REVIEW: "Request Changes" (reviewer), "Approve" (approver)
  - CHANGES_REQUESTED: "Resubmit" (creator)
  - APPROVED: "Export PDF", "Export DOCX"
  - Any status: "Save Draft" (auto-save every 30 seconds + manual save)

**Editor area:**
- Section-based editor (Phase 4)
- Variable substitution panel (sidebar) showing `{{client_name}}`, `{{project_name}}`, etc., with fill fields

**Comments panel (right sidebar):**
- List of comments with author, timestamp, resolved status
- Add comment input
- Resolve/unresolve toggle
- Comments visible to all roles
- When status is CHANGES_REQUESTED, unresolved comments are highlighted

**Version history panel:**
- List of saved versions with timestamp
- Click to preview a past version (read-only)
- "Restore this version" button

### 5.4 Proposal API Routes

**`GET /api/proposals`** — List proposals (filtered by user role)
**`POST /api/proposals`** — Create proposal
**`GET /api/proposals/[id]`** — Get single proposal with comments + versions
**`PUT /api/proposals/[id]`** — Update proposal content/title (auto-saves a new version)
**`DELETE /api/proposals/[id]`** — Delete (OWNER only)
**`PATCH /api/proposals/[id]/status`** — Update status (with role checks)
**`POST /api/proposals/[id]/duplicate`** — Clone proposal as new DRAFT

**Version saving logic:**
Every time a proposal is saved (PUT), save the previous content as a new `ProposalVersion` record with an incremented version number.

---

## Phase 6 — Export System (MOST CRITICAL)

> ⚠️ This is the highest-priority technical requirement. Formatting must be identical between the editor view and exported files. Read every instruction carefully.

### 6.1 Shared HTML Rendering (`lib/proposalRenderer.ts`)

Create a single HTML rendering function used by BOTH the editor preview and both exporters:

```typescript
export function renderProposalToHTML(
  proposal: ProposalWithSections,
  settings: CompanySettings,
  options: { mode: 'preview' | 'pdf' | 'docx' }
): string
```

This function must:
1. Accept the proposal's section JSON array
2. Convert each section's Tiptap JSON to HTML using Tiptap's `generateHTML()` with all extensions registered
3. Assemble a complete, self-contained HTML document with:
   - All CSS inlined (not external stylesheets)
   - Company branding (logo, colors, fonts) from `CompanySettings`
   - Header with company logo + proposal title on every page
   - Footer with company name + page number on every page
   - Section titles as H2 headings
   - A4 page dimensions: width 210mm, content padding 20mm on all sides
4. The HTML must use only web-safe fonts OR embed Google Fonts via `<link>` tag
5. Tables must be styled with borders, padding, alternating row colors
6. Images must be base64-encoded inline (not external URLs) for PDF/DOCX mode

### 6.2 PDF Export (`app/api/export/pdf/route.ts`)

> ⚠️ Use **Puppeteer** — NOT jsPDF. jsPDF strips formatting. Puppeteer renders the actual HTML.

```typescript
// POST /api/export/pdf
// Body: { proposalId: string }

export async function POST(req: Request) {
  // 1. Auth check
  // 2. Fetch proposal + company settings from DB
  // 3. Call renderProposalToHTML(proposal, settings, { mode: 'pdf' })
  // 4. Launch Puppeteer:
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // 5. Print to PDF with exact settings:
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: false, // headers/footers are part of the HTML itself
  });
  
  await browser.close();
  
  // 6. Return as downloadable file
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposal.title}.pdf"`,
    },
  });
}
```

**Puppeteer in production (Vercel/Docker):**
- For local development: `puppeteer` (includes Chromium)
- For production serverless: use `@sparticuz/chromium` + `puppeteer-core`
- Always add `--no-sandbox`, `--disable-setuid-sandbox` to launch args

### 6.3 DOCX Export (`app/api/export/docx/route.ts`)

> ⚠️ DOCX is structurally different from HTML. You must map every HTML element to its `docx` library equivalent. Do not use shortcuts that lose formatting.

Use the `docx` npm package to build the document programmatically:

**HTML → DOCX Mapping Rules:**

| HTML Element | DOCX Element |
|---|---|
| `<h1>` | `Paragraph` with `HeadingLevel.HEADING_1` |
| `<h2>` | `Paragraph` with `HeadingLevel.HEADING_2` |
| `<h3>` | `Paragraph` with `HeadingLevel.HEADING_3` |
| `<p>` | `Paragraph` with `TextRun` children |
| `<strong>` / `<b>` | `TextRun` with `bold: true` |
| `<em>` / `<i>` | `TextRun` with `italics: true` |
| `<u>` | `TextRun` with `underline: {}` |
| `<s>` | `TextRun` with `strike: true` |
| `<ul>` `<li>` | `Paragraph` with `numbering: { reference: 'bullet-list', level: 0 }` |
| `<ol>` `<li>` | `Paragraph` with `numbering: { reference: 'numbered-list', level: 0 }` |
| `<table>` | `Table` |
| `<tr>` | `TableRow` |
| `<td>` / `<th>` | `TableCell` |
| `<img>` | `Paragraph` containing `ImageRun` |
| `<br>` | `Paragraph` with empty `TextRun` |
| Font size | `TextRun` with `size: pt * 2` (half-points) |
| Text color | `TextRun` with `color: "RRGGBB"` (no #) |
| Text align | `Paragraph` with `alignment: AlignmentType.CENTER` etc. |

**Document structure:**
```typescript
const doc = new Document({
  numbering: {
    config: [
      { reference: 'bullet-list', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•' }] },
      { reference: 'numbered-list', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.' }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, bottom: 1440, left: 1800, right: 1800 }, // twips (1440 = 1 inch)
        size: { width: 12240, height: 15840 }, // A4 in twips
      }
    },
    headers: {
      default: new Header({ children: [/* company logo + proposal title */] }),
    },
    footers: {
      default: new Footer({ children: [/* company name + page number */] }),
    },
    children: [/* all parsed paragraphs and tables */],
  }]
});

const buffer = await Packer.toBuffer(doc);
```

**HTML Parser for DOCX:**
Create a recursive HTML-to-DOCX parser (`lib/htmlToDocx.ts`) using the `node-html-parser` or `cheerio` library:
1. Parse the HTML string into a DOM tree
2. Walk the tree recursively
3. For each node, create the appropriate `docx` element
4. Handle nested inline elements (e.g., `<strong><em>text</em></strong>` → `TextRun` with both `bold` and `italics`)
5. Return an array of `docx` `Paragraph` and `Table` objects

### 6.4 Export Fidelity Validation

Add a preview endpoint:

**`GET /api/export/preview/[id]`** — Returns the raw HTML that will be used for PDF export. This lets users visually verify before downloading.

On the proposal page, add a "Preview Export" button that opens this HTML in a new tab. The user should see exactly what will be in the PDF.

---

## Phase 7 — Template System

### 7.1 Template List (`app/dashboard/templates/page.tsx`)

- Grid of template cards showing: name, description, section count, created date
- "New Template" button
- Edit and Delete actions

### 7.2 Create Template (`app/dashboard/templates/new/page.tsx`)

- Template name (required)
- Description
- Section-based editor (same component as proposals)
- Variable placeholders panel: insert `{{variable_name}}` tokens into content
- Save as template (POST `/api/templates`)

### 7.3 Edit Template (`app/dashboard/templates/[id]/edit/page.tsx`)

Same as create, pre-populated with existing template content.

### 7.4 Save Proposal as Template (MUST HAVE)

> ⚠️ This is a required feature. Users must be able to promote any approved proposal into a reusable template.

On the proposal detail page, add a **"Save as Template"** button. It must:

1. Open a modal with:
   - Template name field (pre-filled with proposal title)
   - Description field
   - A checklist of sections to include (all checked by default)
   - A "Variables to extract" step: scan content for `{{variable}}` patterns and list them
   - A list of fields to clear before saving (e.g., client name, pricing amounts)

2. On confirm: POST to `/api/proposals/[id]/save-as-template`
   - Server creates a new `Template` record
   - Copies section content from proposal
   - Replaces client-specific text with variable placeholders where user indicated

3. Show success toast: "Template saved! You can find it in the Templates section."

**`POST /api/proposals/[id]/save-as-template`**
```typescript
// Body: { name, description, sections (array of section ids to include), variableMappings }
// Returns: { templateId }
```

### 7.5 Template API Routes

**`GET /api/templates`** — List all templates
**`POST /api/templates`** — Create template
**`GET /api/templates/[id]`** — Get template
**`PUT /api/templates/[id]`** — Update template
**`DELETE /api/templates/[id]`** — Delete template

---

## Phase 8 — Role-Based Access Control

### 8.1 Seed Default Roles and Permissions

Create `prisma/seed.ts`:

**Roles:**
- `OWNER` — Full system access
- `SALES_TEAM` — Create and manage own proposals
- `REVIEWER` — View and comment on proposals, request changes
- `APPROVER` — Approve or reject proposals

**Permissions (seed these as Permission records):**
```
proposals:create
proposals:read:own
proposals:read:all
proposals:update:own
proposals:update:all
proposals:delete
proposals:submit
proposals:review
proposals:approve
templates:create
templates:read
templates:update
templates:delete
users:manage
roles:manage
settings:manage
export:pdf
export:docx
```

### 8.2 Permission Checks

Create a `lib/permissions.ts` helper:
```typescript
export function hasPermission(user: SessionUser, permission: string): boolean
export function requirePermission(user: SessionUser, permission: string): void // throws if not permitted
```

Apply these checks in every API route and conditionally in the UI to show/hide action buttons.

### 8.3 User Management (`app/dashboard/users/page.tsx`)

- Table of users: Name, Email, Role, Status (Active/Inactive), Actions
- "Invite User" button → form with name, email, role selection → creates user with a temporary password and sends welcome email
- Edit user: change name, role, active status
- Custom permissions panel: add/remove individual permissions beyond what the role grants

### 8.4 Role Management (`app/dashboard/roles/page.tsx`)

- List of roles
- Create custom role with name + permission checkboxes
- Edit existing custom roles
- Cannot delete or edit system roles (OWNER, SALES_TEAM, REVIEWER, APPROVER)

---

## Phase 9 — Dynamic Variables

### 9.1 Variable Substitution

Support the following built-in variables in proposal and template content:

```
{{client_name}}     → Proposal.clientName
{{project_name}}    → Proposal.projectName
{{date}}            → Current date (formatted)
{{company_name}}    → CompanySettings.companyName
{{author_name}}     → Proposal.creator.name
```

### 9.2 Custom Variables

Users can define additional variables when creating a proposal:
- A "Variables" panel in the proposal editor
- Key-value input (e.g., `pricing` = `$50,000`)
- These are stored in `Proposal.variables` (JSON)

### 9.3 Variable Resolution

Before rendering HTML for export, run a substitution pass:
```typescript
function resolveVariables(html: string, variables: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}
```

Run this in `renderProposalToHTML()` after Tiptap JSON → HTML conversion.

---

## Phase 10 — Company Settings

### 10.1 Settings Page (`app/dashboard/settings/page.tsx`)

Form fields:
- Company name
- Logo upload (display inline preview)
- Primary brand color (color picker)
- Address
- Website
- Phone
- Email
- Footer text (appears in exported documents)

Save to `CompanySettings` table via `POST /api/settings`.

### 10.2 Logo in Exports

When exporting:
- Load the company logo from the database (stored as a URL path)
- Convert to base64 for embedding in HTML/DOCX
- Place in document header: logo on the left, proposal title on the right

---

## Phase 11 — Comments & Review Workflow

### 11.1 Comment System

**`POST /api/proposals/[id]/comments`** — Add comment
**`PATCH /api/comments/[commentId]/resolve`** — Toggle resolved

Comment model fields: `body`, `authorId`, `proposalId`, `resolved`, `createdAt`

### 11.2 Status Transition Rules

Enforce these transitions server-side:

| Current Status | Allowed Next Status | Who Can Change |
|---|---|---|
| DRAFT | UNDER_REVIEW | Creator (requires `proposals:submit`) |
| UNDER_REVIEW | CHANGES_REQUESTED | Reviewer (requires `proposals:review`) |
| UNDER_REVIEW | APPROVED | Approver (requires `proposals:approve`) |
| CHANGES_REQUESTED | DRAFT | Creator (reopen for editing) |
| DRAFT | UNDER_REVIEW | Creator (resubmit) |
| APPROVED | EXPORTED | System (on export) |

Reject any other transitions with a 403 error.

### 11.3 Email Notifications

Send emails on these events:
- Proposal submitted for review → email all users with `proposals:review` permission
- Changes requested → email proposal creator
- Proposal approved → email proposal creator
- New comment added → email proposal creator (if not the commenter)

---

## Phase 12 — Section Library (Should Have)

### 12.1 Reusable Section Blocks

Allow users to save individual sections as reusable library items:

- "Save to Library" button on each section in the editor
- Library panel (accessible from the section menu) showing all saved blocks
- Click to insert a library block into the current proposal

**Database model:**
```prisma
model SectionLibraryItem {
  id        String   @id @default(cuid())
  name      String
  category  String   // "intro", "scope", "pricing", "terms", "testimonials"
  content   Json     // Tiptap JSON
  createdAt DateTime @default(now())
}
```

**`GET /api/section-library`** — List all library items (optionally filter by category)
**`POST /api/section-library`** — Save a section
**`DELETE /api/section-library/[id]`** — Remove

---

## Phase 13 — Additional Features (Should Have)

### 13.1 Duplicate Proposal

**`POST /api/proposals/[id]/duplicate`**
- Creates a new proposal with status DRAFT
- Copies all sections, title (prefixed with "Copy of"), clientName, projectName
- Redirects to the new proposal

### 13.2 Proposal Search & Filter

On the proposals list page:
- Full-text search across title and client name (use Postgres `ILIKE`)
- Filter by status
- Filter by creator
- Date range filter
- Sort by: created date, updated date, title

### 13.3 Auto-Save

In the proposal editor:
- Auto-save content every 30 seconds if there are unsaved changes
- Show "Saving..." → "Saved" indicator in the top bar
- On page unload: warn if there are unsaved changes

---

## Phase 14 — AI Assistance (Could Have)

> This is optional but highly recommended. Implement after all MUST HAVE and SHOULD HAVE features are complete.

### 14.1 AI Section Rewriter

Add an "AI" button in the section toolbar. On click:
- Show a dropdown: "Improve Writing", "Make More Formal", "Summarize", "Expand", "Fix Grammar"
- On selection: call `/api/ai/rewrite` with the section HTML and the chosen action
- Replace section content with AI response (with an "Undo" option)

**`POST /api/ai/rewrite`**
```typescript
// Uses Anthropic API or OpenAI API
// Body: { content: string (HTML), action: 'improve' | 'formal' | 'summarize' | 'expand' | 'grammar' }
// Returns: { rewritten: string (HTML) }
```

Add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` to `.env`.

---

## Phase 15 — File Uploads

### 15.1 Image Upload API

**`POST /api/upload`**
- Accept `multipart/form-data` with file field
- Validate: image types only (jpg, png, gif, webp), max 5MB
- Save to `public/uploads/` (local) or S3 (production)
- Return: `{ url: "/uploads/filename.jpg" }`

### 15.2 Image Embedding in Tiptap

Configure the Tiptap `Image` extension to upload on drop/paste:
```typescript
// In the editor component
const handleImageUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const { url } = await res.json();
  return url;
};
```

---

## Phase 16 — Final Checks & Quality Requirements

### 16.1 Export Fidelity Checklist

Before considering the project complete, verify:

- [ ] Bold text in editor → bold in PDF → bold in DOCX
- [ ] Italic text in editor → italic in PDF → italic in DOCX
- [ ] Underline in editor → underline in PDF → underline in DOCX
- [ ] Font size 14pt in editor → 14pt in PDF → 14pt in DOCX
- [ ] Font family "Georgia" in editor → Georgia in PDF → Georgia in DOCX
- [ ] Red text in editor → red text in PDF → red text in DOCX
- [ ] Center-aligned paragraph → center in PDF → center in DOCX
- [ ] 3-column table in editor → 3-column table in PDF → 3-column table in DOCX
- [ ] Table borders visible in PDF and DOCX
- [ ] Bullet list in editor → bullet list in PDF → bullet list in DOCX
- [ ] Numbered list in editor → numbered list in PDF → numbered list in DOCX
- [ ] Inserted image visible in PDF and DOCX
- [ ] Company logo in header of PDF and DOCX
- [ ] Footer text in PDF and DOCX
- [ ] Page numbers in PDF and DOCX
- [ ] Multiple sections each with headings → preserved in both exports
- [ ] `{{client_name}}` resolved correctly in both exports

### 16.2 Security Requirements

- All API routes must call `auth()` and reject unauthenticated requests with 401
- Role/permission checks must be server-side (never trust client-side permission claims)
- File uploads must validate MIME type server-side (not just file extension)
- Password reset tokens must be single-use and expire in 1 hour
- No raw SQL — use Prisma only

### 16.3 Error Handling

- All API routes must return consistent error format: `{ error: string, code?: string }`
- All forms must show field-level validation errors using Zod
- Export failures must show a user-friendly error message (not a raw exception)
- 404 pages for unknown proposal/template IDs

### 16.4 Performance

- Proposal list: use `select` to avoid over-fetching (don't fetch full `content` JSON in the list)
- Images in exports: cache base64 conversions within a single export request
- Auto-save: debounce 30 seconds, don't save if content hasn't changed

---

## File Structure

The final project must follow this structure:

```
/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── forgot-password/route.ts
│   │   │   ├── reset-password/route.ts
│   │   │   └── [...nextauth]/route.ts
│   │   ├── proposals/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── status/route.ts
│   │   │       ├── duplicate/route.ts
│   │   │       ├── save-as-template/route.ts
│   │   │       └── comments/route.ts
│   │   ├── templates/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── comments/
│   │   │   └── [id]/resolve/route.ts
│   │   ├── section-library/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── export/
│   │   │   ├── pdf/route.ts
│   │   │   ├── docx/route.ts
│   │   │   └── preview/[id]/route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── permissions/route.ts
│   │   ├── roles/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── permissions/route.ts
│   │   ├── settings/route.ts
│   │   └── upload/route.ts
│   ├── auth/
│   │   ├── signin/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── proposals/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── users/page.tsx
│   │   ├── roles/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── Word365Editor.tsx
│   ├── SectionEditor.tsx
│   ├── SectionLibraryPanel.tsx
│   ├── VariablesPanel.tsx
│   ├── CommentsPanel.tsx
│   ├── VersionHistoryPanel.tsx
│   ├── StatusBadge.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Providers.tsx
│
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── email.ts
│   ├── permissions.ts
│   ├── proposalRenderer.ts    ← shared HTML renderer
│   ├── htmlToDocx.ts          ← HTML → docx element converter
│   └── resolveVariables.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── types/
│   └── next-auth.d.ts
│
└── public/
    └── uploads/
```

---

## Implementation Order (Follow This Exactly)

1. **Scaffold project** and install all dependencies
2. **Set up Prisma** schema and run migration
3. **Seed database** with roles, permissions, and one admin user
4. **Implement authentication** (NextAuth config, sign-in page, forgot/reset password)
5. **Build dashboard layout** with sidebar and auth guard
6. **Build the Word365Editor** component (this takes the most time — do it right)
7. **Build SectionEditor** using Word365Editor
8. **Implement Proposal CRUD** (list, create, view/edit pages + API routes)
9. **Implement the Export system** (proposalRenderer → PDF via Puppeteer → DOCX via docx library)
10. **Test exports end-to-end** before continuing (verify fidelity checklist)
11. **Implement Template system** (list, create, edit + API routes)
12. **Implement Save as Template** feature
13. **Implement Comments and review workflow**
14. **Implement RBAC** (user management, role management, permission enforcement)
15. **Implement Dynamic Variables**
16. **Implement Company Settings**
17. **Implement Section Library**
18. **Implement Duplicate, Search, Auto-save**
19. **Implement AI Assistance** (optional, last)
20. **Final QA** against the Export Fidelity Checklist

---

## Common Pitfalls to Avoid

| Pitfall | Correct Approach |
|---|---|
| Using jsPDF for PDF export | Use Puppeteer — it renders real HTML/CSS |
| Storing editor HTML as plain string | Store as Tiptap JSON, convert to HTML on demand |
| External CSS in exported HTML | Inline all styles with `<style>` tags |
| External image URLs in exports | Convert images to base64 before embedding |
| Skipping server-side permission checks | Always validate permissions in API routes |
| Losing formatting in DOCX | Map every HTML tag to its exact `docx` equivalent |
| Not running variable substitution before export | Always resolve `{{variables}}` before rendering HTML |
| Saving a new version on every keystroke | Save versions only on explicit save or status change |
| Fetching full content JSON in list views | Use Prisma `select` to exclude heavy fields |

---

## Success Criteria

The implementation is complete when:

✅ A user can create a proposal from a template in under 2 minutes  
✅ A proposal can be submitted, reviewed, have changes requested, and resubmitted  
✅ An exported PDF looks visually identical to the editor preview  
✅ An exported DOCX opens in Microsoft Word with correct formatting  
✅ A completed proposal can be saved as a template in one click  
✅ Variables like `{{client_name}}` are resolved in all exports  
✅ Role-based access prevents unauthorized actions  
✅ Company logo and footer text appear in all exports  

---

*This document was generated as a complete implementation specification. Pass it in full to your AI coding agent.*
