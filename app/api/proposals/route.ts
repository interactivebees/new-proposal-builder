import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const proposalSchema = z.object({
  title: z.string().min(1),
  templateId: z.string().optional(),
  content: z.any(),
  clientName: z.string().optional(),
  clientCompany: z.string().optional(),
  clientEmail: z.string().optional().or(z.literal('')),
  clientAddress: z.string().optional(),
  clientLogoUrl: z.string().optional()
})

// GET /api/proposals - List all proposals
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}

    // Sales team can only see their own proposals
    if (session.user.role === 'SALES_TEAM') {
      where.createdBy = session.user.id
    }

    if (status) {
      where.status = status
    }

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        template: {
          select: { id: true, name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(proposals)
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/proposals - Create new proposal
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SALES_TEAM and OWNER can create proposals
    if (session.user.role === 'BUSINESS_EXPERT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = proposalSchema.parse(body)

    const proposal = await prisma.proposal.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        status: 'DRAFT'
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
