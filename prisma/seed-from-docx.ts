import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database from Word document...')

  // Create users with different roles
  const ownerPassword = await hash('owner123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      password: ownerPassword,
      name: 'John Owner',
      role: 'OWNER',
      companyName: 'Acme Corp'
    }
  })

  const salesPassword = await hash('sales123', 10)
  const salesMember = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      email: 'sales@example.com',
      password: salesPassword,
      name: 'Jane Sales',
      role: 'SALES_TEAM',
      companyName: 'Acme Corp'
    }
  })

  const expertPassword = await hash('expert123', 10)
  const expert = await prisma.user.upsert({
    where: { email: 'expert@example.com' },
    update: {},
    create: {
      email: 'expert@example.com',
      password: expertPassword,
      name: 'Bob Expert',
      role: 'BUSINESS_EXPERT',
      companyName: 'Acme Corp'
    }
  })

  // Create template
  const template = await prisma.template.create({
    data: {
      name: 'Website Redesign & Digital Marketing Template',
      category: 'Web Development',
      sections: {
        sections: [
          { id: '1', title: 'Executive Summary', type: 'text' },
          { id: '2', title: 'Project Scope', type: 'text' },
          { id: '3', title: 'Timeline & Milestones', type: 'timeline' },
          { id: '4', title: 'Investment & Pricing', type: 'pricing' },
          { id: '5', title: 'Our Approach & Methodology', type: 'text' },
          { id: '6', title: 'Why Choose Us', type: 'text' },
          { id: '7', title: 'Terms & Conditions', type: 'text' },
          { id: '8', title: 'Next Steps', type: 'text' }
        ]
      },
      createdBy: owner.id
    }
  })

  // Create proposal with exact content from the Word document
  const proposal = await prisma.proposal.create({
    data: {
      title: 'Website Redesign & Digital Marketing Proposal',
      templateId: template.id,
      content: {
        sections: [
          {
            id: 'section-1',
            title: 'Executive Summary',
            order: 0,
            type: 'text',
            content: {
              html: `<h2>Executive Summary</h2>
<p>Thank you for considering our services for your website redesign project. This proposal outlines a comprehensive approach to transform your digital presence and enhance user engagement.</p>
<p><strong>Key Highlights:</strong></p>
<ul>
  <li>Modern, responsive design</li>
  <li>Improved user experience</li>
  <li>SEO optimization</li>
  <li>Mobile-first approach</li>
  <li>Enhanced performance and security</li>
</ul>`,
              json: {}
            }
          },
          {
            id: 'section-2',
            title: 'Project Scope',
            order: 1,
            type: 'text',
            content: {
              html: `<h2>Project Scope</h2>
<p>Our comprehensive website redesign includes:</p>
<h3>1. Discovery & Planning</h3>
<ul>
  <li>Stakeholder interviews</li>
  <li>Competitor analysis</li>
  <li>User research and personas</li>
  <li>Information architecture</li>
</ul>
<h3>2. Design Phase</h3>
<ul>
  <li>Wireframes and mockups</li>
  <li>Visual design system</li>
  <li>Interactive prototypes</li>
  <li>Design revisions (up to 3 rounds)</li>
</ul>
<h3>3. Development</h3>
<ul>
  <li>Frontend development (React/Next.js)</li>
  <li>Backend integration</li>
  <li>CMS implementation</li>
  <li>Responsive design implementation</li>
</ul>
<h3>4. Testing & Launch</h3>
<ul>
  <li>Cross-browser testing</li>
  <li>Performance optimization</li>
  <li>Security audit</li>
  <li>Deployment and launch support</li>
</ul>`,
              json: {}
            }
          },
          {
            id: 'section-3',
            title: 'Timeline & Milestones',
            order: 2,
            type: 'timeline',
            content: {
              html: `<h2>Project Timeline</h2>
<p><strong>Total Duration: 12 weeks</strong></p>
<h3>Phase 1: Discovery (Weeks 1-2)</h3>
<p>Requirements gathering, research, and planning</p>
<h3>Phase 2: Design (Weeks 3-5)</h3>
<p>Wireframes, visual design, and prototyping</p>
<h3>Phase 3: Development (Weeks 6-9)</h3>
<p>Frontend and backend development, CMS setup</p>
<h3>Phase 4: Testing & Launch (Weeks 10-12)</h3>
<p>Quality assurance, performance optimization, and deployment</p>
<p><em>Note: Timeline may be adjusted based on feedback cycles and approval processes.</em></p>`,
              json: {}
            }
          },
          {
            id: 'section-4',
            title: 'Investment & Pricing',
            order: 3,
            type: 'pricing',
            content: {
              html: `<h2>Investment Breakdown</h2>
<p>Our pricing is transparent and includes all deliverables mentioned in the scope.</p>
<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th>Service</th>
      <th>Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Discovery & Planning</td>
      <td>$2,000</td>
    </tr>
    <tr>
      <td>Design (UI/UX)</td>
      <td>$5,000</td>
    </tr>
    <tr>
      <td>Development</td>
      <td>$8,000</td>
    </tr>
    <tr>
      <td>Testing & Launch</td>
      <td>$2,000</td>
    </tr>
    <tr>
      <td><strong>Total Project Cost</strong></td>
      <td><strong>$17,000</strong></td>
    </tr>
  </tbody>
</table>
<p><em>Optional: Monthly maintenance and support available at $500/month</em></p>`,
              json: {}
            }
          },
          {
            id: 'section-5',
            title: 'Our Approach & Methodology',
            order: 4,
            type: 'text',
            content: {
              html: `<h2>Our Approach</h2>
<p>We follow an agile, collaborative approach to ensure your vision is realized:</p>
<h3>User-Centered Design</h3>
<p>Every decision is made with your end users in mind. We conduct thorough research to understand their needs, behaviors, and pain points.</p>
<h3>Iterative Development</h3>
<p>We believe in showing progress early and often. You'll see working prototypes and can provide feedback throughout the process.</p>
<h3>Quality Assurance</h3>
<p>Rigorous testing ensures your website works flawlessly across all devices and browsers.</p>
<h3>Knowledge Transfer</h3>
<p>We provide comprehensive documentation and training so your team can manage the website confidently.</p>`,
              json: {}
            }
          },
          {
            id: 'section-6',
            title: 'Why Choose Us',
            order: 5,
            type: 'text',
            content: {
              html: `<h2>Why Partner With Us</h2>
<ul>
  <li><strong>10+ Years of Experience:</strong> Successfully delivered 200+ web projects</li>
  <li><strong>Expert Team:</strong> Certified designers and developers</li>
  <li><strong>Proven Results:</strong> Average 150% increase in user engagement for our clients</li>
  <li><strong>Ongoing Support:</strong> We're here even after launch</li>
  <li><strong>Transparent Communication:</strong> Regular updates and open channels</li>
</ul>
<blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 20px 0; font-style: italic;">
  <p>"Working with this team transformed our online presence. The new website increased our conversions by 200%!"</p>
  <footer>- Sarah Chen, CEO of TechFlow</footer>
</blockquote>`,
              json: {}
            }
          },
          {
            id: 'section-7',
            title: 'Terms & Conditions',
            order: 6,
            type: 'text',
            content: {
              html: `<h2>Terms & Conditions</h2>
<h3>Payment Terms</h3>
<ul>
  <li>50% deposit upon project commencement</li>
  <li>25% upon design approval</li>
  <li>25% upon project completion</li>
</ul>
<h3>Project Timeline</h3>
<p>Timeline is subject to timely feedback and approvals from the client. Delays in feedback may extend the project duration.</p>
<h3>Revisions</h3>
<p>Included: Up to 3 rounds of revisions per phase. Additional revisions will be billed at $150/hour.</p>
<h3>Intellectual Property</h3>
<p>Upon final payment, all rights to the website design and code transfer to the client.</p>
<h3>Warranty</h3>
<p>30-day bug fix warranty post-launch for any issues related to our development.</p>`,
              json: {}
            }
          },
          {
            id: 'section-8',
            title: 'Next Steps',
            order: 7,
            type: 'text',
            content: {
              html: `<h2>Next Steps</h2>
<p>We're excited about the opportunity to work with you! Here's how we can get started:</p>
<ol>
  <li><strong>Review this proposal</strong> and share any questions or concerns</li>
  <li><strong>Schedule a kickoff call</strong> to discuss project details</li>
  <li><strong>Sign the agreement</strong> and provide the initial deposit</li>
  <li><strong>Begin discovery phase</strong> within 5 business days</li>
</ol>
<p><strong>Questions?</strong> Feel free to reach out:</p>
<ul>
  <li>Email: projects@acmecorp.com</li>
  <li>Phone: (555) 123-4567</li>
  <li>Schedule a call: calendly.com/acmecorp</li>
</ul>
<p>We look forward to partnering with you to create an exceptional digital experience!</p>`,
              json: {}
            }
          }
        ]
      },
      clientName: 'Alice Johnson',
      clientCompany: 'Tech Startup Inc',
      clientEmail: 'alice@techstartup.com',
      clientAddress: '123 Innovation Drive, San Francisco, CA 94105',
      status: 'DRAFT',
      createdBy: salesMember.id
    }
  })

  // Add pricing items matching the document
  await prisma.pricingItem.createMany({
    data: [
      {
        proposalId: proposal.id,
        serviceDescription: 'Website Design',
        cost: 5000,
        frequency: 'one-time',
        orderIndex: 1
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Development',
        cost: 8000,
        frequency: 'one-time',
        orderIndex: 2
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Monthly Maintenance',
        cost: 500,
        frequency: 'monthly',
        orderIndex: 3
      }
    ]
  })

  console.log('✅ Database seeded successfully from Word document!')
  console.log('\n📄 Created Proposal:')
  console.log(`   Title: ${proposal.title}`)
  console.log(`   Client: ${proposal.clientName} (${proposal.clientCompany})`)
  console.log(`   Sections: 8`)
  console.log(`   Pricing Items: 3`)
  console.log(`   Total Value: $17,000 + $500/month`)
  console.log('\n👥 Test Users:')
  console.log('   Owner: owner@example.com / owner123')
  console.log('   Sales: sales@example.com / sales123')
  console.log('   Expert: expert@example.com / expert123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
