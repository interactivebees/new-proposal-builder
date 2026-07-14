import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: {
          include: {
            permissions: {
              select: { id: true, name: true, description: true, category: true },
            },
          },
        },
        customPermissions: {
          select: { id: true, name: true, description: true, category: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const effectivePermissions = [
      ...(user.role?.permissions || []),
      ...user.customPermissions,
    ]

    return NextResponse.json({
      rolePermissions: user.role?.permissions || [],
      customPermissions: user.customPermissions,
      effectivePermissions,
    })
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { customPermissionIds } = body

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id },
      data: {
        customPermissions: {
          set: customPermissionIds?.map((pid: string) => ({ id: pid })) || [],
        },
      },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        role: {
          include: {
            permissions: true,
          },
        },
        customPermissions: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user permissions:', error)
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 })
  }
}