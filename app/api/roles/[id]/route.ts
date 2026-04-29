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
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
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
    const { name, description, permissionIds, isDefault } = body

    const existingRole = await prisma.role.findUnique({ where: { id } })
    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (name && name !== existingRole.name) {
      const nameTaken = await prisma.role.findUnique({ where: { name } })
      if (nameTaken) {
        return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isDefault !== undefined) updateData.isDefault = isDefault
    if (permissionIds) {
      updateData.permissions = {
        set: permissionIds.map((pid: string) => ({ id: pid })),
      }
    }

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: { permissions: true },
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const role = await prisma.role.findUnique({ where: { id } })
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    const usersWithRole = await prisma.user.count({ where: { roleId: id } })
    if (usersWithRole > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users' },
        { status: 400 }
      )
    }

    await prisma.role.delete({ where: { id } })
    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}