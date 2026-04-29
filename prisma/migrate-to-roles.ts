import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function migrate() {
  console.log('Starting migration...')

  try {
    // 0. Drop old Role and Permission enums if they exist (they block new tables)
    await p.$executeRaw`DROP TYPE IF EXISTS "Role" CASCADE`.catch(() => {})
    await p.$executeRaw`DROP TYPE IF EXISTS "Permission" CASCADE`.catch(() => {})
    console.log('✓ Dropped old enums (if existed)')

    // 1. Create Role table
    await p.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Role" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "description" TEXT,
        "isDefault" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )`
    console.log('✓ Created Role table')

    // 2. Create Permission table
    await p.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Permission" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now()
      )`
    console.log('✓ Created Permission table')

    // 3. Create Role-Permission junction table
    await p.$executeRaw`
      CREATE TABLE IF NOT EXISTS "_RoleToPermission" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        PRIMARY KEY ("A", "B"),
        FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE,
        FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE
      )`
    console.log('✓ Created _RoleToPermission junction')

    // 4. Add roleId and UserToPermission to User
    await p.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" TEXT REFERENCES "Role"("id")`
    await p.$executeRaw`
      CREATE TABLE IF NOT EXISTS "_UserToPermission" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        PRIMARY KEY ("A", "B"),
        FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE
      )`
    console.log('✓ Added roleId and _UserToPermission columns')

    // 5. Check if roles already exist, otherwise create them
    let ownerId: string, salesId: string, expertId: string

    const existingRoles = await p.$queryRaw<{ id: string, name: string }[]>`SELECT "id", "name" FROM "Role"`
    const roleMap = Object.fromEntries(existingRoles.map(r => [r.name, r.id]))
    
    if (roleMap['OWNER']) {
      ownerId = roleMap['OWNER']
      salesId = roleMap['SALES_TEAM']
      expertId = roleMap['BUSINESS_EXPERT']
      console.log('✓ Roles already exist, reusing...')
    } else {
      ownerId = 'rol_owner_' + Date.now()
      salesId = 'rol_sales_' + Date.now()
      expertId = 'rol_expert_' + Date.now()

      await p.$executeRaw`INSERT INTO "Role" ("id", "name", "description", "isDefault") VALUES (${ownerId}, 'OWNER', 'Full system access', false) ON CONFLICT DO NOTHING`
      await p.$executeRaw`INSERT INTO "Role" ("id", "name", "description", "isDefault") VALUES (${salesId}, 'SALES_TEAM', 'Sales team member', true) ON CONFLICT DO NOTHING`
      await p.$executeRaw`INSERT INTO "Role" ("id", "name", "description", "isDefault") VALUES (${expertId}, 'BUSINESS_EXPERT', 'Business expert', false) ON CONFLICT DO NOTHING`
      console.log('✓ Inserted roles')
    }

    // 6. Insert permissions
    const perms = [
      { id: 'perm_view', name: 'VIEW', desc: 'View resources', cat: 'General' },
      { id: 'perm_edit', name: 'EDIT', desc: 'Edit resources', cat: 'General' },
      { id: 'perm_create', name: 'CREATE', desc: 'Create resources', cat: 'General' },
      { id: 'perm_delete', name: 'DELETE', desc: 'Delete resources', cat: 'General' },
      { id: 'perm_manage_users', name: 'MANAGE_USERS', desc: 'Manage users', cat: 'Administration' },
      { id: 'perm_approve', name: 'APPROVE_PROPOSAL', desc: 'Approve proposals', cat: 'Proposals' },
    ]

    for (const perm of perms) {
      await p.$executeRaw`INSERT INTO "Permission" ("id", "name", "description", "category") VALUES (${perm.id}, ${perm.name}, ${perm.desc}, ${perm.cat}) ON CONFLICT DO NOTHING`
    }
    console.log('✓ Inserted permissions')

    // 7. Link roles to permissions (default)
    await p.$executeRaw`INSERT INTO "_RoleToPermission" ("A", "B") VALUES (${ownerId}, 'perm_view'), (${ownerId}, 'perm_edit'), (${ownerId}, 'perm_create'), (${ownerId}, 'perm_delete'), (${ownerId}, 'perm_manage_users'), (${ownerId}, 'perm_approve') ON CONFLICT DO NOTHING`
    await p.$executeRaw`INSERT INTO "_RoleToPermission" ("A", "B") VALUES (${salesId}, 'perm_view'), (${salesId}, 'perm_edit'), (${salesId}, 'perm_create') ON CONFLICT DO NOTHING`
    await p.$executeRaw`INSERT INTO "_RoleToPermission" ("A", "B") VALUES (${expertId}, 'perm_view'), (${expertId}, 'perm_approve') ON CONFLICT DO NOTHING`
    console.log('✓ Linked roles to permissions')

    // 8. Migrate existing users to new roleId (only if role column exists)
    try {
      await p.$executeRaw`UPDATE "User" SET "roleId" = ${ownerId} WHERE "role" = 'OWNER'`
      await p.$executeRaw`UPDATE "User" SET "roleId" = ${salesId} WHERE "role" = 'SALES_TEAM'`
      await p.$executeRaw`UPDATE "User" SET "roleId" = ${expertId} WHERE "role" = 'BUSINESS_EXPERT'`
      console.log('✓ Migrated users to new roles')
    } catch {
      console.log('✓ role column not found - skipping (already migrated?)')
    }

    // Save role IDs for reference
    console.log('\n✅ Migration complete!')
    console.log('Role IDs:')
    console.log('  OWNER:', ownerId)
    console.log('  SALES_TEAM:', salesId)
    console.log('  BUSINESS_EXPERT:', expertId)
    console.log('\nNow run: npx prisma generate')

  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await p.$disconnect()
  }
}

migrate()