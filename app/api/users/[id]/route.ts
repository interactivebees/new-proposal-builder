import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcrypt'

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
        email: true,
        name: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              select: { id: true, name: true, description: true, category: true },
            },
          },
        },
        customPermissions: {
          select: { id: true, name: true, description: true, category: true },
        },
        companyName: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, roleId, customPermissionIds, companyName, phone } = body

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
      }
    }

    if (roleId) {
      const role = await prisma.role.findUnique({ where: { id: roleId } })
      if (!role) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (email) updateData.email = email
    if (name) updateData.name = name
    if (roleId) updateData.role = { connect: { id: roleId } }
    if (companyName !== undefined) updateData.companyName = companyName
    if (phone !== undefined) updateData.phone = phone
    if (password) {
      updateData.password = await hash(password, 10)
      updateData.tokenVersion = { increment: 1 }
    }
    if (customPermissionIds) {
      updateData.customPermissions = {
        set: customPermissionIds.map((pid: string) => ({ id: pid })),
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
        customPermissions: true,
        companyName: true,
        phone: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
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
    if (id === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    const body = await request.json()
    const { action, currentPassword, newPassword, isActive } = body

    // Get current user
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Handle different actions
    if (action === 'toggleStatus') {
      // Only OWNER can toggle status
      if (!session || session.user?.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      
      // Can't deactivate yourself
      if (id === session.user.id) {
        return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 })
      }

      const newStatus = isActive !== undefined ? isActive : !user.isActive
      await prisma.user.update({
        where: { id },
        data: { isActive: newStatus, tokenVersion: { increment: 1 } },
      })

      return NextResponse.json({ 
        message: newStatus ? 'User activated' : 'User deactivated',
        isActive: newStatus 
      })
    }

    if (action === 'changePassword') {
      // User can change their own password, or OWNER can reset any user's password
      const isOwnUser = session?.user?.id === id
      const isOwner = session?.user?.role === 'OWNER'

      if (!isOwnUser && !isOwner) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // If user is changing their own password, verify current password
      if (isOwnUser && !isOwner) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
        }
        
        const isValid = await compare(currentPassword, user.password)
        if (!isValid) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        )
      }

      const hashedPassword = await hash(newPassword, 10)
      
      await prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
          tokenVersion: { increment: 1 },
        },
      })

      return NextResponse.json({ message: 'Password changed successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('User PATCH error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}