import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET company settings
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.companySetting.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings) {
      return NextResponse.json(null)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST/UPDATE company settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      logoUrl,
      address,
      phone,
      email,
      website,
      defaultPaymentTerms,
      defaultValidityDays,
      taxRate
    } = body

    // Check if settings exist
    const existingSettings = await prisma.companySetting.findUnique({
      where: { userId: session.user.id }
    })

    let settings

    if (existingSettings) {
      // Update existing settings
      settings = await prisma.companySetting.update({
        where: { userId: session.user.id },
        data: {
          companyName,
          logoUrl,
          address,
          phone,
          email,
          website,
          defaultPaymentTerms,
          defaultValidityDays,
          taxRate
        }
      })
    } else {
      // Create new settings
      settings = await prisma.companySetting.create({
        data: {
          userId: session.user.id,
          companyName,
          logoUrl,
          address,
          phone,
          email,
          website,
          defaultPaymentTerms,
          defaultValidityDays,
          taxRate
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
