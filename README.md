# Proposal Builder

A modern web application for sales teams to create, collaborate on, and export professional business proposals.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5 (JWT)
- **Rich Text Editor:** TipTap
- **Export:** DOCX (docx library), PDF (pdf-lib)

## Features

- ✅ Role-based authentication (Owner, Sales Team, Business Expert)
- ✅ Proposal creation and management
- ✅ Template system
- ✅ Rich text editor with TipTap
- ✅ Comments and collaboration
- ✅ Pricing items management
- ✅ Version history tracking
- ✅ DOCX export functionality
- ✅ Approval workflow

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd propsal-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/proposal_builder"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   Generate a secret for NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**
   
   Run Prisma migrations:
   ```bash
   npm run db:migrate
   ```

5. **Seed the database (optional)**
   
   Create test users and sample data:
   ```bash
   npm run db:seed
   ```

   Test users created:
   - Owner: `owner@example.com` / `owner123`
   - Sales: `sales@example.com` / `sales123`
   - Expert: `expert@example.com` / `expert123`

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
propsal-builder/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── proposals/    # Proposal CRUD
│   │   ├── templates/    # Template management
│   │   ├── comments/     # Comments system
│   │   └── export/       # Export functionality
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Protected dashboard pages
│   └── layout.tsx        # Root layout
├── components/           # React components
│   └── ProposalEditor.tsx
├── lib/                  # Utilities
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
└── types/               # TypeScript definitions
```

## User Roles & Permissions

| Action | Sales Team | Business Expert | Owner |
|--------|-----------|-----------------|-------|
| Create Proposal | ✓ | ✗ | ✓ |
| Edit Own Proposal | ✓ | ✗ | ✓ |
| View All Proposals | ✗ | ✓ | ✓ |
| Comment/Feedback | ✓ | ✓ | ✓ |
| Approve Proposal | ✗ | ✗ | ✓ |
| Export DOCX | ✓ | ✓ | ✓ |

## API Endpoints

### Proposals
- `GET /api/proposals` - List all proposals
- `POST /api/proposals` - Create new proposal
- `GET /api/proposals/[id]` - Get proposal details
- `PUT /api/proposals/[id]` - Update proposal
- `DELETE /api/proposals/[id]` - Delete proposal

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template

### Comments
- `POST /api/comments` - Add comment to proposal

### Export
- `POST /api/export/docx` - Export proposal as DOCX

## Database Commands

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio

# Generate Prisma Client
npx prisma generate
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Generated with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
