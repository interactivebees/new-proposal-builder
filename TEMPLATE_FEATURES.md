# Template Features - Complete Guide

## ✅ Template Management System

### **1. Create Templates**
- **Page:** `/dashboard/templates/new`
- **Fields:**
  - Template Name (required)
  - Category (optional) - e.g., Sales, Marketing, Consulting
  - Multiple sections with rich text content
- **Features:**
  - Add/remove/reorder sections
  - Rich text editing for each section
  - Section types: Text, Pricing, Timeline, Custom

### **2. View Templates**
- **Page:** `/dashboard/templates`
- **Display:**
  - Table with Name, Category, Creator, Created Date
  - View and Delete actions
- **Features:**
  - List all available templates
  - Filter by category (visual grouping)
  - Quick access to view details

### **3. Template Details**
- **Page:** `/dashboard/templates/[id]`
- **Display:**
  - Template name and metadata
  - Read-only preview of all sections
  - Creator information
- **Actions:**
  - **Back** - Return to templates list
  - **Edit Template** - Modify template
  - **Use This Template** - Create proposal from template

### **4. Edit Templates** ✨ NEW
- **Page:** `/dashboard/templates/[id]/edit`
- **Features:**
  - Edit template name
  - Edit category
  - Modify all sections
  - Add/remove/reorder sections
  - Save changes
- **Permissions:**
  - Only template creator or OWNER role can edit

### **5. Use Templates in Proposals** ✨ ENHANCED
- **Method 1:** From Template Detail Page
  - Click "Use This Template" button
  - Redirects to `/dashboard/proposals/new?templateId=xxx`
  - Auto-loads template sections

- **Method 2:** Template Selector in Proposal Creation ✨ NEW
  - Go to `/dashboard/proposals/new`
  - See dropdown: "Start with a Template (Optional)"
  - Select any template from the list
  - Template sections load automatically
  - Can still customize everything

---

## 🎯 Complete Workflow

### Creating a Template:
1. Dashboard → Templates → "Create New Template"
2. Enter name (e.g., "Standard Sales Proposal")
3. Enter category (e.g., "Sales")
4. Add sections:
   - Executive Summary
   - Project Scope
   - Timeline
   - Pricing
   - Terms & Conditions
5. Fill in default content for each section
6. Click "Create Template"

### Editing a Template:
1. Dashboard → Templates → Click "View" on template
2. Click "Edit Template" button
3. Modify name, category, or sections
4. Add/remove/reorder sections as needed
5. Click "Save Changes"

### Using a Template (Method 1):
1. Dashboard → Templates → Click "View"
2. Click "Use This Template"
3. Fill in client details
4. Customize sections as needed
5. Click "Create Proposal"

### Using a Template (Method 2 - NEW):
1. Dashboard → Proposals → "Create New Proposal"
2. Select template from dropdown at top
3. Template sections load automatically
4. Fill in client details
5. Customize sections as needed
6. Click "Create Proposal"

---

## 🔐 Permissions

| Action | Who Can Do It |
|--------|---------------|
| View Templates | All authenticated users |
| Create Template | All authenticated users |
| Edit Template | Template creator or OWNER |
| Delete Template | Template creator or OWNER |
| Use Template | All authenticated users |

---

## 📊 API Endpoints

### Templates:
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template
- `GET /api/templates/[id]` - Get template details
- `PUT /api/templates/[id]` - Update template ✨ NEW
- `DELETE /api/templates/[id]` - Delete template

### Proposals with Templates:
- `POST /api/proposals` - Create proposal (with optional templateId)

---

## 💡 Key Features

### Template Selector ✨ NEW
- **Location:** Top of proposal creation form
- **Appearance:** Blue highlighted box
- **Options:**
  - "Start from scratch" (default)
  - List of all templates with categories
- **Behavior:**
  - Selecting a template loads its sections immediately
  - Shows confirmation message when loaded
  - Can switch between templates
  - Can still customize everything after loading

### Template Editor ✨ NEW
- **Full editing capabilities:**
  - Change template name
  - Change category
  - Modify all sections
  - Add new sections
  - Remove sections
  - Reorder sections
- **Same rich text editor as proposals:**
  - Bold, Italic, Underline, Strikethrough
  - Headings (H1, H2, H3)
  - Lists (bullet, numbered)
  - Blockquotes, Code blocks
  - Text alignment
  - Highlighting

---

## 🎨 UI/UX Enhancements

### Template Selector:
- **Blue background** to stand out
- **Dropdown with categories** in parentheses
- **Confirmation message** when template loaded
- **Optional** - can still start from scratch

### Edit Button:
- **Blue outline** button on template detail page
- **Between "Back" and "Use This Template"**
- **Clear action:** "Edit Template"

### Template List:
- **Category column** instead of description
- **Shows "General"** if no category set
- **Clean table layout**

---

## 🚀 Benefits

1. **Reusability:** Create once, use many times
2. **Consistency:** Standardized proposal structure across team
3. **Efficiency:** Faster proposal creation
4. **Flexibility:** 
   - Can edit templates anytime
   - Can customize proposals after using template
   - Can choose template during creation
5. **Organization:** Categories help organize templates
6. **Collaboration:** Share templates across team

---

## 📝 Example Use Cases

### Sales Team:
- Create "Standard Sales Proposal" template
- Include: Intro, Solution, Pricing, Terms
- Use for all new sales opportunities
- Edit template when process changes

### Marketing Team:
- Create "Marketing Campaign Proposal" template
- Include: Strategy, Timeline, Budget, KPIs
- Use for client campaigns
- Customize per client needs

### Consulting:
- Create "Consulting Engagement" template
- Include: Assessment, Recommendations, Implementation, Pricing
- Use for all consulting projects
- Edit template based on feedback

---

## ✨ What's New

### Template Editing:
- ✅ Full edit page at `/templates/[id]/edit`
- ✅ Edit button on template detail page
- ✅ PUT API endpoint for updates
- ✅ Permission checks (creator or OWNER only)

### Template Selector:
- ✅ Dropdown in proposal creation form
- ✅ Shows all templates with categories
- ✅ Auto-loads sections when selected
- ✅ Confirmation message
- ✅ Can switch templates
- ✅ Optional - can start from scratch

---

## 🔄 Data Flow

### Creating Proposal from Template:
1. User selects template from dropdown
2. Frontend fetches template via GET `/api/templates/[id]`
3. Template sections loaded into state
4. User fills client details
5. User can modify sections
6. POST `/api/proposals` with templateId
7. Proposal created with template reference

### Editing Template:
1. User clicks "Edit Template"
2. Frontend fetches template data
3. User modifies name/category/sections
4. PUT `/api/templates/[id]` with updates
5. Template updated in database
6. Redirects to template detail page

---

## 🎯 Summary

Templates are now **fully editable** and can be **easily selected** when creating proposals. The system provides:

- ✅ Complete CRUD operations for templates
- ✅ Easy template selection during proposal creation
- ✅ Flexible customization after using template
- ✅ Proper permissions and access control
- ✅ Clean, intuitive UI/UX

This makes the proposal creation process much more efficient while maintaining flexibility!
