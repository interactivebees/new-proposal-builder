import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

console.log('Testing DATABASE_URL:', process.env.DATABASE_URL)

const prisma = new PrismaClient()

async function test() {
  try {
    await prisma.$connect()
    console.log('✅ CONNECTED SUCCESSFULLY TO NEON POSTGRESQL!')
    const usersCount = await prisma.user.count()
    console.log('Users count:', usersCount)
  } catch (err) {
    console.error('❌ Connection error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
