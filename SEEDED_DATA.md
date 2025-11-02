# Seeded Data Reference

## Database Successfully Seeded! ✅

Your database now contains a comprehensive **Website Redesign & Digital Marketing Proposal** with realistic content.

## Test User Accounts

You can log in with any of these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Owner** | owner@example.com | owner123 |
| **Sales Team** | sales@example.com | sales123 |
| **Business Expert** | expert@example.com | expert123 |

## What Was Created

### 1. **Users**
- 3 users with different roles (Owner, Sales Team, Business Expert)
- All belong to "Acme Corp"

### 2. **Template**
- **Name:** Basic Proposal Template
- **Category:** General
- **Sections:** Executive Summary, Project Scope, Timeline, Pricing

### 3. **Proposal: "Website Redesign & Digital Marketing Proposal"**

The proposal includes 8 comprehensive sections:

#### Section 1: Executive Summary
- Overview of the project
- Key highlights and benefits

#### Section 2: Project Scope
- Discovery & Planning
- Design Phase
- Development
- Testing & Launch

#### Section 3: Timeline & Milestones
- 12-week project timeline
- 4 phases with clear milestones

#### Section 4: Investment & Pricing
- Detailed cost breakdown
- Total: $17,000
- Optional monthly maintenance: $500/month

#### Section 5: Our Approach & Methodology
- User-centered design
- Iterative development
- Quality assurance
- Knowledge transfer

#### Section 6: Why Choose Us
- Experience and expertise
- Proven results
- Client testimonials

#### Section 7: Terms & Conditions
- Payment terms (50/25/25 split)
- Revision policy
- Intellectual property rights
- Warranty information

#### Section 8: Next Steps
- Clear action items
- Contact information
- How to get started

### 4. **Client Information**
- **Client Name:** Alice Johnson
- **Company:** Tech Startup Inc
- **Email:** alice@techstartup.com
- **Address:** 123 Innovation Drive, San Francisco, CA 94105

### 5. **Pricing Items**
Three pricing items were created:
1. Website Design - $5,000 (one-time)
2. Development - $8,000 (one-time)
3. Monthly Maintenance - $500 (monthly)

## How to View the Proposal

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Log in** with any of the test accounts above

3. **Navigate to:**
   - Dashboard → Proposals
   - You'll see the "Website Redesign & Digital Marketing Proposal"

4. **View/Edit** the proposal to see all sections

## Re-seeding the Database

If you need to reset and re-seed:

```bash
# Reset the database (WARNING: This deletes all data!)
npx prisma migrate reset

# Or just run the seed again (will create duplicates if data exists)
npm run db:seed
```

## Customizing the Seed Data

Edit `prisma/seed.ts` to:
- Add more proposals
- Change client information
- Modify section content
- Add different pricing structures
- Create additional templates

## Notes

- The proposal status is set to **DRAFT**
- Created by the Sales Team member
- All content is in HTML format for rich text editing
- Sections are ordered and can be reordered in the UI
