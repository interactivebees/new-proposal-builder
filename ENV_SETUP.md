# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your_database_connection_string"

# NextAuth v5 - Required
AUTH_SECRET="your_secret_key_here"

# Optional: Specify the auth URL (defaults to http://localhost:3000)
# AUTH_URL="http://localhost:3000"
```

## Generate AUTH_SECRET

Run this command to generate a secure secret:

```bash
npx auth secret
```

Or use this PowerShell command:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Example .env file

```env
DATABASE_URL="postgresql://user:password@localhost:5432/proposal_builder"
AUTH_SECRET="your-generated-secret-here"
```
