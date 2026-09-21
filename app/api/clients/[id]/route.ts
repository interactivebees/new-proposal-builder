import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, contactDesignation, companyName, slogan, logoUrl, industry, email, phone, website, gstNumber, address, city, country, status } = body

    // 1. Try to find client by ID
    let targetClient = await prisma.client.findUnique({ where: { id } })

    // 2. If not found by ID (e.g. sample client ID '1', '6', or temporary client-side ID), try by companyName
    if (!targetClient && companyName) {
      targetClient = await prisma.client.findFirst({
        where: {
          companyName: {
            equals: companyName,
            mode: 'insensitive'
          }
        }
      })
    }

    let client
    if (targetClient) {
      client = await prisma.client.update({
        where: { id: targetClient.id },
        data: {
          name: name || targetClient.name,
          companyName: companyName || targetClient.companyName,
          industry,
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

      if (logoUrl !== undefined || slogan !== undefined) {
        try {
          await prisma.$executeRawUnsafe(
            `UPDATE "Client" SET "logoUrl" = $1, "slogan" = $2 WHERE "id" = $3`,
            logoUrl || null,
            slogan || null,
            targetClient.id
          )
        } catch (sqlErr) {
          console.warn('Note updating logo/slogan via raw SQL:', sqlErr)
        }
      }

      // Update or create primary contact
      if (contactDesignation || name) {
        try {
          const existingContact = await prisma.clientContact.findFirst({
            where: { clientId: targetClient.id }
          })
          if (existingContact) {
            await prisma.clientContact.update({
              where: { id: existingContact.id },
              data: {
                name: name || existingContact.name,
                designation: contactDesignation !== undefined ? contactDesignation : existingContact.designation,
                email: email !== undefined ? email : existingContact.email,
                phone: phone !== undefined ? phone : existingContact.phone,
              }
            })
          } else {
            await prisma.clientContact.create({
              data: {
                clientId: targetClient.id,
                name: name || companyName,
                designation: contactDesignation || 'Lead Procurement Manager',
                email: email || null,
                phone: phone || null,
                isPrimary: true
              }
            })
          }
        } catch (cErr) {
          console.warn('Contact update note:', cErr)
        }
      }
    } else {
      // If client didn't exist at all, create it so edits are never lost
      client = await prisma.client.create({
        data: {
          name: name || companyName,
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
    }

    return NextResponse.json({
      ...client,
      logoUrl: logoUrl !== undefined ? logoUrl : (client as any).logoUrl,
      slogan: slogan !== undefined ? slogan : (client as any).slogan
    })
  } catch (error: any) {
    console.error('Error updating client:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to update client',
      details: String(error)
    }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.client.findUnique({ where: { id } })
    if (existing) {
      await prisma.client.delete({
        where: { id: existing.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
