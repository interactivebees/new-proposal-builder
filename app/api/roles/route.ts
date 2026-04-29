import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, permissionIds, isDefault } = body

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    const existingRole = await prisma.role.findUnique({ where: { name } })
    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        isDefault: isDefault || false,
        permissions: permissionIds?.length
          ? { connect: permissionIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        permissions: true,
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}