import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}