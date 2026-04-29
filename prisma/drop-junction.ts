import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function main() {
  console.log('Dropping custom junction tables...')
  
  try {
    await p.$executeRaw`DROP TABLE IF EXISTS "_RoleToPermission" CASCADE`
    console.log('✓ Dropped _RoleToPermission')
  } catch (e: any) {
    console.log('Error dropping _RoleToPermission:', e.message)
  }
  
  try {
    await p.$executeRaw`DROP TABLE IF EXISTS "_UserToPermission" CASCADE`
    console.log('✓ Dropped _UserToPermission')
  } catch (e: any) {
    console.log('Error dropping _UserToPermission:', e.message)
  }
  
  // Verify
  const tables = await p.$queryRaw<{ table_name: string }[]>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%Permission%'`
  
  console.log('\nRemaining Permission tables:')
  for (const t of tables) {
    console.log(' -', t.table_name)
  }
}

main().finally(() => p.$disconnect())