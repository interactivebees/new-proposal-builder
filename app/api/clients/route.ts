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

    return NextResponse.json(clients)
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
    const { name, companyName, industry, email, phone, website, gstNumber, address, city, country, status } = body

    if (!name || !companyName) {
      return NextResponse.json({ error: 'Client Name and Company Name are required' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        companyName,
        industry: industry || 'Technology',
        email,
        phone,
        website,
        gstNumber,
        address,
        city,
        country: country || 'India',
        status: status || 'ACTIVE'
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
