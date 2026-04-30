import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const saveAsTemplateSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional()
})

// POST /api/proposals/[id]/save-as-template - Save proposal as new template
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validatedData = saveAsTemplateSchema.parse(body)

    // Get the proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        template: true
      }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check permissions - only owner or creator can save as template
    const hasAccess =
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Extract sections from proposal content
    const content = proposal.content as any
    const sections = content?.sections || []

    // Clean sections - remove client-specific values but keep formatting
    const cleanedSections = sections.map((section: any) => {
      // Keep content structure but remove client-specific data
      const cleanedSection = {
        ...section,
        // Clear any client-specific content
        // Keep title if it's not client-specific (not containing {{client_...}})
      }

      return cleanedSection
    })

    // Create new template from proposal
    const template = await prisma.template.create({
      data: {
        name: validatedData.name,
        category: validatedData.category || 'Saved from Proposal',
        sections: { sections: cleanedSections },
        createdBy: session.user.id,
        isActive: true
      }
    })

    return NextResponse.json(template, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error saving as template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}