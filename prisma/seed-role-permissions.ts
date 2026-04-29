import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RoleRecord {
  id: string
  name: string
}

interface PermissionRecord {
  id: string
  name: string
}

interface UserRecord {
  id: string
  email: string
  name: string
  roleId: string | null
  role: string | null
}

async function ensureRolesExist(): Promise<Map<string, string>> {
  console.log('\n📋 Phase 1: Ensuring roles exist...')

  const roles = [
    { name: 'OWNER', description: 'Full system access', isDefault: false },
    { name: 'SALES_TEAM', description: 'Sales team member - can create and manage own proposals', isDefault: true },
    { name: 'BUSINESS_EXPERT', description: 'Business expert - can view all and approve proposals', isDefault: false },
  ]

  const roleIdMap = new Map<string, string>()

  for (const role of roles) {
    try {
      const existing = await prisma.role.findUnique({
        where: { name: role.name },
        select: { id: true }
      })

      if (existing) {
        roleIdMap.set(role.name, existing.id)
        console.log(`  ✓ Role '${role.name}' already exists (id: ${existing.id})`)
      } else {
        const created = await prisma.role.create({
          data: {
            name: role.name,
            description: role.description,
            isDefault: role.isDefault,
          },
          select: { id: true }
        })
        roleIdMap.set(role.name, created.id)
        console.log(`  ✓ Created role '${role.name}' (id: ${created.id})`)
      }
    } catch (error: any) {
      console.log(`  ⚠ Error with role '${role.name}': ${error.message}`)
    }
  }

  return roleIdMap
}

async function ensurePermissionsExist(): Promise<Map<string, string>> {
  console.log('\n📋 Phase 2: Ensuring permissions exist...')

  const permissions = [
    { name: 'VIEW', description: 'View resources', category: 'General' },
    { name: 'EDIT', description: 'Edit resources', category: 'General' },
    { name: 'CREATE', description: 'Create new resources', category: 'General' },
    { name: 'DELETE', description: 'Delete resources', category: 'General' },
    { name: 'MANAGE_USERS', description: 'Manage users and roles', category: 'Administration' },
    { name: 'APPROVE_PROPOSAL', description: 'Approve proposals', category: 'Proposals' },
  ]

  const permIdMap = new Map<string, string>()

  for (const perm of permissions) {
    try {
      const existing = await prisma.permission.findUnique({
        where: { name: perm.name },
        select: { id: true }
      })

      if (existing) {
        permIdMap.set(perm.name, existing.id)
        console.log(`  ✓ Permission '${perm.name}' already exists`)
      } else {
        const created = await prisma.permission.create({
          data: {
            name: perm.name,
            description: perm.description,
            category: perm.category,
          },
          select: { id: true }
        })
        permIdMap.set(perm.name, created.id)
        console.log(`  ✓ Created permission '${perm.name}'`)
      }
    } catch (error: any) {
      console.log(`  ⚠ Error with permission '${perm.name}': ${error.message}`)
    }
  }

  return permIdMap
}

async function linkRolesToPermissions(roleIdMap: Map<string, string>, permIdMap: Map<string, string>): Promise<void> {
  console.log('\n📋 Phase 3: Linking roles to permissions...')

  const rolePermissions: Record<string, string[]> = {
    'OWNER': ['VIEW', 'EDIT', 'CREATE', 'DELETE', 'MANAGE_USERS', 'APPROVE_PROPOSAL'],
    'SALES_TEAM': ['VIEW', 'EDIT', 'CREATE'],
    'BUSINESS_EXPERT': ['VIEW', 'APPROVE_PROPOSAL'],
  }

  for (const [roleName, permNames] of Object.entries(rolePermissions)) {
    try {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
        include: { permissions: true }
      })

      if (!role) {
        console.log(`  ⚠ Role '${roleName}' not found, skipping`)
        continue
      }

      console.log(`  Linking ${roleName} -> [${permNames.join(', ')}]`)

      const permIds = permNames.map(name => permIdMap.get(name)).filter(Boolean) as string[]

      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            connect: permIds.map(id => ({ id }))
          }
        }
      })

      console.log(`    ✓ Linked ${roleName} to ${permNames.length} permissions`)

    } catch (error: any) {
      console.log(`  ⚠ Error linking ${roleName}: ${error.message}`)
    }
  }
}

async function linkUsersToRoles(roleIdMap: Map<string, string>): Promise<void> {
  console.log('\n📋 Phase 4: Linking users to roles...')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
      }
    }) as UserRecord[]

    console.log(`  Found ${users.length} users`)

    for (const user of users) {
      if (user.roleId) {
        console.log(`  ✓ User '${user.email}' already has roleId, skipping`)
        continue
      }

      let newRoleId: string | null = null
      let assignedRole = ''

      const emailLower = user.email.toLowerCase()
      const nameLower = user.name?.toLowerCase() || ''

      if (emailLower.includes('owner') || nameLower.includes('owner') || emailLower.includes('admin')) {
        newRoleId = roleIdMap.get('OWNER') || null
        assignedRole = 'OWNER'
      } else if (emailLower.includes('expert') || nameLower.includes('expert')) {
        newRoleId = roleIdMap.get('BUSINESS_EXPERT') || null
        assignedRole = 'BUSINESS_EXPERT'
      } else if (emailLower.includes('sales') || nameLower.includes('sales') || emailLower.includes('member')) {
        newRoleId = roleIdMap.get('SALES_TEAM') || null
        assignedRole = 'SALES_TEAM'
      } else {
        newRoleId = roleIdMap.get('SALES_TEAM') || null
        assignedRole = 'SALES_TEAM (default)'
      }

      if (newRoleId) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { roleId: newRoleId }
          })
          console.log(`  ✓ Linked '${user.email}' -> ${assignedRole}`)
        } catch (error: any) {
          console.log(`  ⚠ Error linking user '${user.email}': ${error.message}`)
        }
      }
    }
  } catch (error: any) {
    console.log(`  ⚠ Error fetching users: ${error.message}`)
  }
}

async function verifyMigration(): Promise<void> {
  console.log('\n📋 Phase 5: Verifying migration...')

  try {
    const roleCount = await prisma.role.count()
    console.log(`  ✓ Roles: ${roleCount}`)

    const permCount = await prisma.permission.count()
    console.log(`  ✓ Permissions: ${permCount}`)

    const rolePermLinks = await prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM "_RolePermissions"`
    console.log(`  ✓ Role→Permission links: ${Number(rolePermLinks[0]?.count || 0)}`)

    const usersWithRoles = await prisma.user.count({
      where: { roleId: { not: null } }
    })
    console.log(`  ✓ Users with roles: ${usersWithRoles}`)

    const totalUsers = await prisma.user.count()
    console.log(`  ✓ Total users: ${totalUsers}`)

  } catch (error: any) {
    console.log(`  ⚠ Verification error: ${error.message}`)
  }
}

async function main() {
  console.log('🚀 Starting role/permission migration...')
  console.log('=' .repeat(50))

  try {
    const roleIdMap = await ensureRolesExist()
    const permIdMap = await ensurePermissionsExist()
    await linkRolesToPermissions(roleIdMap, permIdMap)
    await linkUsersToRoles(roleIdMap)
    await verifyMigration()

    console.log('\n' + '='.repeat(50))
    console.log('✅ Migration complete!')
    console.log('\nNext steps:')
    console.log('  1. Restart your dev server')
    console.log('  2. Visit /dashboard/users to verify')
    console.log('  3. Deploy to production when ready')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()