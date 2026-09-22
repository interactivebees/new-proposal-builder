import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { name, companyName, industry, email, phone, website, gstNumber, address, city, country, status, logoUrl, slogan } = body

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        companyName,
        industry,
        email,
        phone,
        website,
        gstNumber,
        address,
        city,
        country,
        status
      }
    })

    if (logoUrl !== undefined || slogan !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "Client" SET "logoUrl" = COALESCE($1, "logoUrl"), "slogan" = COALESCE($2, "slogan") WHERE "id" = $3`,
          logoUrl !== undefined ? logoUrl : null,
          slogan !== undefined ? slogan : null,
          client.id
        )
      } catch (sqlErr) {
        console.warn('Raw SQL err:', sqlErr)
      }
    }

    return NextResponse.json({
      ...client,
      logoUrl: logoUrl !== undefined ? logoUrl : null,
      slogan: slogan !== undefined ? slogan : null
    })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.client.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
