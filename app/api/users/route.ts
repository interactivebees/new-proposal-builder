import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'

async function getUserWithPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  return user
}

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, roleId, customPermissionIds, companyName, phone } = body

    if (!email || !password || !name || !roleId) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      )
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: { connect: { id: roleId } },
        customPermissions: customPermissionIds?.length
          ? { connect: customPermissionIds.map((id: string) => ({ id })) }
          : undefined,
        companyName,
        phone,
      },
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

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}