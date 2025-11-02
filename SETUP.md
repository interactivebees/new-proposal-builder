# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is installed and running on your machine.

Create a new database:
```sql
CREATE DATABASE proposal_builder;
```

Or using psql command:
```bash
psql -U postgres -c "CREATE DATABASE proposal_builder;"
```

### 2. Environment Configuration

Copy the environment template and fill in your values:
```bash
cp env.template .env
```

Edit `.env` and update:
- `DATABASE_URL` with your PostgreSQL credentials
- `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)

Example `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/proposal_builder"
NEXTAUTH_SECRET="generated-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration

Run Prisma migrations to create all tables:
```bash
npm run db:migrate
```

When prompted for a migration name, you can use: `init`

### 5. Seed Database (Optional but Recommended)

Create test users and sample data:
```bash
npm run db:seed
```

This creates three test users:
- **Owner:** owner@example.com / owner123
- **Sales Team:** sales@example.com / sales123
- **Business Expert:** expert@example.com / expert123

### 6. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 7. Sign In

Use one of the test accounts to sign in:
- Go to http://localhost:3000/auth/signin
- Enter email and password from the seeded users

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `.env`
3. Ensure the database exists: `psql -U postgres -l`

### Migration Errors

**Error:** `Migration failed`

**Solution:**
1. Reset the database: `npx prisma migrate reset`
2. Run migrations again: `npm run db:migrate`

### NextAuth Errors

**Error:** `[next-auth][error][SIGNIN_EMAIL_ERROR]`

**Solution:**
1. Verify NEXTAUTH_SECRET is set in `.env`
2. Check that the user exists in the database
3. Verify password is correct

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
1. Kill the process using port 3000
2. Or use a different port: `npm run dev -- -p 3001`

## Next Steps

After successful setup:

1. **Explore the Dashboard**
   - Navigate to `/dashboard`
   - View proposals, templates, and settings

2. **Create Your First Proposal**
   - Click "Create New Proposal"
   - Fill in client details
   - Use the rich text editor
   - Save as draft

3. **Test Role-Based Access**
   - Sign in with different user roles
   - Notice permission differences

4. **Explore API Endpoints**
   - Open Prisma Studio: `npm run db:studio`
   - Test API routes with tools like Postman

## Development Tips

- **Hot Reload:** Changes auto-reload in dev mode
- **Database GUI:** Use `npm run db:studio` for visual database management
- **API Testing:** Use browser DevTools Network tab or Postman
- **Logs:** Check terminal for server logs and errors

## Production Deployment

For production deployment:

1. Set production environment variables
2. Build the application: `npm run build`
3. Start production server: `npm start`
4. Use a process manager like PM2
5. Set up reverse proxy (nginx/Apache)
6. Enable HTTPS with SSL certificate

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [TipTap Documentation](https://tiptap.dev)
