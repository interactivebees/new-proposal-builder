import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'


export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposals = await prisma.proposal.findMany({
      include: {
        creator: { select: { name: true, email: true } },
        client: { select: { companyName: true, industry: true } }
      }
    })

    const totalCount = proposals.length

    
    const statusCounts: Record<string, number> = {
      DRAFT: 0,
      IN_REVIEW: 0,
      PENDING_APPROVAL: 0,
      APPROVED: 0,
      SENT: 0,
      REJECTED: 0
    }

    let totalPipelineValue = 0
    let approvedValue = 0
    let pendingValue = 0
    let draftValue = 0

    const clientPipelineMap: Record<string, { name: string; count: number; value: number; closedDeals: number }> = {}
    const ownerPipelineMap: Record<string, { name: string; count: number; closedDeals: number; value: number }> = {}
    const industryMap: Record<string, { name: string; value: number }> = {}

   
    const monthlyMap: Record<string, { count: number; closed: number }> = {}

    proposals.forEach(p => {
      const status = p.status || 'DRAFT'
      statusCounts[status] = (statusCounts[status] || 0) + 1

      const val = Number(p.opportunityValue) || 0
      totalPipelineValue += val

      if (status === 'APPROVED' || status === 'SENT') {
        approvedValue += val
      } else if (status === 'PENDING_APPROVAL' || status === 'IN_REVIEW') {
        pendingValue += val
      } else if (status === 'DRAFT') {
        draftValue += val
      }

      // Aggregate Client Pipeline
      const clientName = p.clientName || p.clientCompany || p.client?.companyName || 'Unknown Client'
      if (!clientPipelineMap[clientName]) {
        clientPipelineMap[clientName] = { name: clientName, count: 0, value: 0, closedDeals: 0 }
      }
      clientPipelineMap[clientName].count += 1
      clientPipelineMap[clientName].value += val
      if (status === 'APPROVED' || status === 'SENT') {
        clientPipelineMap[clientName].closedDeals += 1
      }

      // Aggregate Owner Pipeline
      const ownerName = p.creator?.name || 'Unassigned'
      if (!ownerPipelineMap[ownerName]) {
        ownerPipelineMap[ownerName] = { name: ownerName, count: 0, closedDeals: 0, value: 0 }
      }
      ownerPipelineMap[ownerName].count += 1
      ownerPipelineMap[ownerName].value += val
      if (status === 'APPROVED' || status === 'SENT') {
        ownerPipelineMap[ownerName].closedDeals += 1
      }

      // Aggregate Industry Map
      const ind = p.client?.industry || 'Unknown'
      if (!industryMap[ind]) {
        industryMap[ind] = { name: ind, value: 0 }
      }
      industryMap[ind].value += val

      // Aggregate monthly trends by proposal creation month
      const monthKey = new Date(p.createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { count: 0, closed: 0 }
      }
      monthlyMap[monthKey].count += 1
      if (status === 'APPROVED' || status === 'SENT') {
        monthlyMap[monthKey].closed += 1
      }
    })

    const closedDeals = (statusCounts['APPROVED'] || 0) + (statusCounts['SENT'] || 0)
    const winRate = totalCount > 0
      ? Math.round((closedDeals / totalCount) * 100)
      : 0

    // Top clients sorted by pipeline value — no fake names
    const topClients = Object.values(clientPipelineMap)
      .map(c => ({
        name: c.name,
        count: c.count,
        value: c.value,
        winRate: c.count > 0 ? Math.round((c.closedDeals / c.count) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Owner performance sorted by pipeline value
    const ownerPerformance = Object.values(ownerPipelineMap)
      .map(o => ({
        name: o.name,
        count: o.count,
        closedDeals: o.closedDeals,
        value: o.value,
        winRate: o.count > 0 ? Math.round((o.closedDeals / o.count) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)

    // Industry breakdown derived from real data
    const totalIndVal = Object.values(industryMap).reduce((acc, curr) => acc + curr.value, 0)
    const industryBreakdown = Object.values(industryMap)
      .map(i => ({
        name: i.name,
        percentage: totalIndVal > 0 ? Math.round((i.value / totalIndVal) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)

    // Monthly trends from real proposal timestamps
    const monthlyTrends = Object.entries(monthlyMap)
      .map(([month, data]) => ({
        month,
        count: data.count,
        winRate: data.count > 0 ? Math.round((data.closed / data.count) * 100) : 0
      }))

    // Key insights derived from real data — no hardcoded subtitles
    const topClient = topClients[0]
    const topIndustry = industryBreakdown[0]
    const keyInsights = [
      {
        id: '1',
        title: `Win rate: ${winRate}%`,
        subtitle: `${closedDeals} of ${totalCount} proposals approved or sent`,
        type: winRate >= 50 ? 'positive' : 'info',
        icon: 'trending-up'
      },
      {
        id: '2',
        title: 'Total pipeline value',
        subtitle: `₹${totalPipelineValue.toLocaleString()} across ${totalCount} proposals`,
        type: 'positive',
        icon: 'wallet'
      },
      {
        id: '3',
        title: `${statusCounts['PENDING_APPROVAL'] || 0} pending approval`,
        subtitle: `${statusCounts['IN_REVIEW'] || 0} proposals currently in review`,
        type: 'info',
        icon: 'clock'
      },
      ...(topIndustry ? [{
        id: '4',
        title: 'Top industry',
        subtitle: `${topIndustry.name} (${topIndustry.percentage}% of pipeline)`,
        type: 'info',
        icon: 'target'
      }] : []),
      ...(topClient ? [{
        id: '5',
        title: 'Top client',
        subtitle: `${topClient.name} (${topClient.count} proposal${topClient.count !== 1 ? 's' : ''})`,
        type: 'star',
        icon: 'star'
      }] : [])
    ]

    return NextResponse.json({
      totalCount,
      winRate,
      totalPipelineValue,
      approvedValue,
      pendingValue,
      draftValue,
      closedDeals,
      avgApprovalDays: 0, // Requires ApprovalRequest timestamp tracking — not yet implemented
      statusCounts,
      topClients,
      ownerPerformance,
      industryBreakdown,
      monthlyTrends,
      keyInsights
    })
  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 })
  }
}
