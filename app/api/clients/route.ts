import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        contacts: true,
        proposals: {
          select: { id: true, title: true, status: true, opportunityValue: true }
        }
      }
    })

    try {
      const extraData = await prisma.$queryRaw<{ id: string; logoUrl: string | null; slogan: string | null }[]>`
        SELECT "id", "logoUrl", "slogan" FROM "Client"
      `
      const extraMap = new Map(extraData.map(e => [e.id, e]))
      const merged = clients.map(c => {
        const extra = extraMap.get(c.id)
        return {
          ...c,
          logoUrl: extra?.logoUrl || (c as any).logoUrl || null,
          slogan: extra?.slogan || (c as any).slogan || null
        }
      })
      return NextResponse.json(merged)
    } catch {
      return NextResponse.json(clients)
    }
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, contactDesignation, companyName, slogan, logoUrl, industry, email, phone, website, gstNumber, address, city, country, status } = body

    if (!name || !companyName) {
      return NextResponse.json({ error: 'Client Name and Company Name are required' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        companyName,
        industry: industry || 'Technology',
        email: email || null,
        phone: phone || null,
        website: website || null,
        gstNumber: gstNumber || null,
        address: address || null,
        city: city || null,
        country: country || 'India',
        status: status || 'ACTIVE'
      }
    })

    if (logoUrl || slogan) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "Client" SET "logoUrl" = $1, "slogan" = $2 WHERE "id" = $3`,
          logoUrl || null,
          slogan || null,
          client.id
        )
      } catch (sqlErr) {
        console.warn('Note updating logo/slogan via raw SQL:', sqlErr)
      }
    }

    if (contactDesignation || name) {
      try {
        await prisma.clientContact.create({
          data: {
            clientId: client.id,
            name: name || companyName,
            designation: contactDesignation || 'Lead Procurement Manager',
            email: email || null,
            phone: phone || null,
            isPrimary: true
          }
        })
      } catch (cErr) {
        console.warn('Contact creation note:', cErr)
      }
    }

    return NextResponse.json({
      ...client,
      logoUrl: logoUrl || null,
      slogan: slogan || null
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating client:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to create client',
      details: String(error)
    }, { status: 500 })
  }
}
