import { PrismaClient } from '@prisma/client'

const passwords = ['', 'postgres', 'root', 'admin', '123456', 'password', 'postgres123', 'root123', 'Alok@123', 'alok123', 'xampp']

async function testConnection() {
  console.log('Testing PostgreSQL passwords...')
  for (const pwd of passwords) {
    const url = `postgresql://postgres:${pwd}@localhost:5432/postgres`
    const client = new PrismaClient({
      datasources: {
        db: { url }
      }
    })
    try {
      await client.$connect()
      console.log(`\n🎉 SUCCESS! Valid password found: "${pwd}"`)
      console.log(`DATABASE_URL="postgresql://postgres:${pwd}@localhost:5432/proposal_builder"`)
      await client.$disconnect()
      process.exit(0)
    } catch (err: any) {
      console.log(`Tried "${pwd}": ${err.message?.substring(0, 60)}...`)
      await client.$disconnect()
    }
  }
  console.log('\n❌ None of the default passwords worked.')
}

testConnection()
