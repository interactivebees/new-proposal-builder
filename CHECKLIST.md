# Setup Checklist

Use this checklist to get your Proposal Builder up and running.

## Prerequisites ✓

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 15+ installed and running
- [ ] Git installed (optional)
- [ ] Code editor (VS Code recommended)

## Database Setup

- [ ] PostgreSQL service is running
- [ ] Created database: `proposal_builder`
  ```bash
  psql -U postgres -c "CREATE DATABASE proposal_builder;"
  ```

## Environment Configuration

- [ ] Created `.env` file in project root
- [ ] Set `DATABASE_URL` with correct credentials
- [ ] Generated and set `NEXTAUTH_SECRET`
  ```bash
  openssl rand -base64 32
  ```
- [ ] Set `NEXTAUTH_URL` to `http://localhost:3000`

## Installation

- [ ] Ran `npm install` successfully
- [ ] No installation errors

## Database Migration

- [ ] Ran `npm run db:migrate`
- [ ] Migration completed without errors
- [ ] All tables created in database

## Database Seeding (Optional)

- [ ] Ran `npm run db:seed`
- [ ] Test users created successfully
- [ ] Sample data loaded

## Start Application

- [ ] Ran `npm run dev`
- [ ] Server started on http://localhost:3000
- [ ] No startup errors

## Verification Tests

- [ ] Opened http://localhost:3000 in browser
- [ ] Redirected to sign-in page
- [ ] Signed in with test account (owner@example.com / owner123)
- [ ] Dashboard loaded successfully
- [ ] Can navigate to Proposals page
- [ ] Can click "Create New Proposal"
- [ ] Proposal form loads
- [ ] Can type in rich text editor

## Optional Checks

- [ ] Opened Prisma Studio: `npm run db:studio`
- [ ] Verified data in database
- [ ] Tested API endpoints with browser DevTools
- [ ] Checked console for errors

## Troubleshooting

If you encounter issues, check:

1. **Database Connection**
   - [ ] PostgreSQL is running: `pg_isready`
   - [ ] Database exists: `psql -U postgres -l | grep proposal`
   - [ ] Credentials in `.env` are correct

2. **Environment Variables**
   - [ ] `.env` file exists in root directory
   - [ ] All required variables are set
   - [ ] No typos in variable names

3. **Dependencies**
   - [ ] `node_modules` folder exists
   - [ ] No errors in `npm install`
   - [ ] Try deleting `node_modules` and running `npm install` again

4. **Port Conflicts**
   - [ ] Port 3000 is not in use by another app
   - [ ] Try different port: `npm run dev -- -p 3001`

## Next Steps

Once everything is working:

- [ ] Read `README.md` for full documentation
- [ ] Review `PROJECT_STATUS.md` for feature status
- [ ] Check `SETUP.md` for detailed setup info
- [ ] Start building additional features!

## Quick Reference

### Test Users
```
Owner:    owner@example.com   / owner123
Sales:    sales@example.com   / sales123
Expert:   expert@example.com  / expert123
```

### Useful Commands
```bash
npm run dev          # Start development server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Prisma Studio GUI
npm run build        # Build for production
npm run start        # Start production server
```

### Important URLs
```
App:            http://localhost:3000
Sign In:        http://localhost:3000/auth/signin
Dashboard:      http://localhost:3000/dashboard
Prisma Studio:  http://localhost:5555 (when running)
```

---

**Status:** [ ] Setup Complete ✅

**Date Completed:** _______________

**Notes:**
_____________________________________
_____________________________________
_____________________________________
