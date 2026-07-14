import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function main() {
  const tables = await p.$queryRaw<{ table_name: string }[]>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%Permission%' OR table_name LIKE '%Role%' OR table_name LIKE '_%')`
  
  console.log('Current tables:')
  for (const t of tables) {
    console.log(' -', t.table_name)
  }
}

main().finally(() => p.$disconnect())