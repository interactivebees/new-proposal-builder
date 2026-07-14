import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const viewPermission = await prisma.permission.upsert({
    where: { name: 'VIEW' },
    update: {},
    create: {
      name: 'VIEW',
      description: 'View resources',
      category: 'General'
    }
  })

  const editPermission = await prisma.permission.upsert({
    where: { name: 'EDIT' },
    update: {},
    create: {
      name: 'EDIT',
      description: 'Edit resources',
      category: 'General'
    }
  })

  const createPermission = await prisma.permission.upsert({
    where: { name: 'CREATE' },
    update: {},
    create: {
      name: 'CREATE',
      description: 'Create new resources',
      category: 'General'
    }
  })

  const deletePermission = await prisma.permission.upsert({
    where: { name: 'DELETE' },
    update: {},
    create: {
      name: 'DELETE',
      description: 'Delete resources',
      category: 'General'
    }
  })

  const manageUsersPermission = await prisma.permission.upsert({
    where: { name: 'MANAGE_USERS' },
    update: {},
    create: {
      name: 'MANAGE_USERS',
      description: 'Manage users and roles',
      category: 'Administration'
    }
  })

  const approveProposalPermission = await prisma.permission.upsert({
    where: { name: 'APPROVE_PROPOSAL' },
    update: {},
    create: {
      name: 'APPROVE_PROPOSAL',
      description: 'Approve proposals',
      category: 'Proposals'
    }
  })

  const ownerRole = await prisma.role.upsert({
    where: { name: 'OWNER' },
    update: {},
    create: {
      name: 'OWNER',
      description: 'Full system access',
      isDefault: false,
      permissions: {
        connect: [
          { name: 'VIEW' },
          { name: 'EDIT' },
          { name: 'CREATE' },
          { name: 'DELETE' },
          { name: 'MANAGE_USERS' },
          { name: 'APPROVE_PROPOSAL' }
        ]
      }
    }
  })

  const salesTeamRole = await prisma.role.upsert({
    where: { name: 'SALES_TEAM' },
    update: {},
    create: {
      name: 'SALES_TEAM',
      description: 'Sales team - can create and manage own proposals',
      isDefault: true,
      permissions: {
        connect: [
          { name: 'VIEW' },
          { name: 'EDIT' },
          { name: 'CREATE' }
        ]
      }
    }
  })

  const businessExpertRole = await prisma.role.upsert({
    where: { name: 'BUSINESS_EXPERT' },
    update: {},
    create: {
      name: 'BUSINESS_EXPERT',
      description: 'Business expert - can view all and approve proposals',
      isDefault: false,
      permissions: {
        connect: [
          { name: 'VIEW' },
          { name: 'APPROVE_PROPOSAL' }
        ]
      }
    }
  })

  const adminPassword = await hash('Welcome@123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@interactivebees.com' },
    update: {},
    create: {
      email: 'admin@interactivebees.com',
      password: adminPassword,
      name: 'Admin',
      role: { connect: { id: ownerRole.id } },
      companyName: 'Interactive Bees Pvt. Ltd.'
    }
  })

  console.log('Database seeded successfully!')
  console.log('\nDefault Admin:')
  console.log('Email: admin@interactivebees.com')
  console.log('Password: Welcome@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
