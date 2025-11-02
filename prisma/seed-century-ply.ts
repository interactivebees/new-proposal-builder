import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Century Ply Warranty Portal Proposal...')

  // Create users
  const ownerPassword = await hash('owner123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      password: ownerPassword,
      name: 'John Owner',
      role: 'OWNER',
      companyName: 'Interactive Bees Pvt. Ltd.'
    }
  })

  const salesPassword = await hash('sales123', 10)
  const salesMember = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      email: 'sales@example.com',
      password: salesPassword,
      name: 'Monica Gupta',
      role: 'SALES_TEAM',
      companyName: 'Interactive Bees Pvt. Ltd.'
    }
  })

  // Create template
  const template = await prisma.template.create({
    data: {
      name: 'Web Portal Development Template',
      category: 'Software Development',
      sections: {
        sections: [
          { id: '1', title: 'Executive Summary', type: 'text' },
          { id: '2', title: 'Project Overview', type: 'text' },
          { id: '3', title: 'Scope of Work', type: 'text' },
          { id: '4', title: 'Customer Journey', type: 'text' },
          { id: '5', title: 'Project Management', type: 'text' },
          { id: '6', title: 'Investment & Pricing', type: 'pricing' }
        ]
      },
      createdBy: owner.id
    }
  })

  // Create Century Ply proposal
  const proposal = await prisma.proposal.create({
    data: {
      title: 'Proposal for Century Ply — Warranty Portal Scope of Work',
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
<p>Century Plyboards (India) Ltd. (CPIL) aims to position its New Age Products (PVC, WPC, and Zykron fiber cement boards) as future-ready, sustainable alternatives to traditional wood-based materials. This proposal outlines a strategic social media plan to drive awareness, engagement, and consideration among both B2B and B2C audiences through consistent, compelling, and insight-led digital communication.</p>`,
              json: {}
            }
          },
          {
            id: 'section-2',
            title: 'Project Overview',
            order: 1,
            type: 'text',
            content: {
              html: `<h2>Project Overview</h2>
<ul>
  <li>Build a modern, mobile-first <strong>Warranty Registration Portal</strong> and a supporting backend dashboard for Century Ply.</li>
  <li>The system will allow customers to register invoice-based warranties (OTP-verified), upload invoice images/PDFs, and track request status.</li>
  <li>Internal users (validators, managers, and admins) will validate invoices, approve/reject requests, and issue version-controlled warranty certificates.</li>
</ul>

<h3>Goals</h3>
<ul>
  <li>Reduce errors and delays from phone/email-based warranty registrations.</li>
  <li>Prevent fake/incorrect warranty issuance through manual invoice validation.</li>
  <li>Provide role-based access for customers, dealers, validators, and admins.</li>
</ul>`,
              json: {}
            }
          },
          {
            id: 'section-3',
            title: 'Scope of Work (Deliverables)',
            order: 2,
            type: 'text',
            content: {
              html: `<h2>Scope of Work (Deliverables)</h2>

<h3>1. Landing Page</h3>
<p><strong>Objective:</strong> To introduce users to the Century Promise Warranty System and guide them seamlessly toward warranty registration or product verification.</p>

<h4>Key Features:</h4>
<ul>
  <li><strong>Hero Banner Section</strong>
    <ul>
      <li>Tagline: "Your Ply, Your Proof, Your Peace of Mind – Forever."</li>
      <li>Prominent brand imagery and Century Promise logo for trust and recall.</li>
    </ul>
  </li>
  <li><strong>Primary Call-to-Action (CTA) Buttons</strong>
    <ul>
      <li>Register Warranty</li>
      <li>Check Product Genuineness</li>
    </ul>
  </li>
  <li><strong>Quick Access Links</strong>
    <ul>
      <li>Warranty Policy</li>
      <li>FAQs</li>
      <li>Contact Support</li>
    </ul>
  </li>
  <li><strong>Responsive Design</strong> - Optimized for both desktop and mobile interfaces</li>
  <li><strong>Dealer & Contact Accessibility</strong>
    <ul>
      <li>Integrated dealer locator</li>
      <li>Quick contact or inquiry form</li>
    </ul>
  </li>
  <li><strong>Trust Indicators</strong>
    <ul>
      <li>Century Promise logo and authenticity seals</li>
      <li>Verified brand assets and badges for credibility</li>
    </ul>
  </li>
</ul>

<h3>2. Web Portal — Warranty Registration</h3>
<p><strong>Objective:</strong> To enable customers to register their product warranties easily using invoice details and personal information.</p>

<h4>Core Functionalities:</h4>
<ul>
  <li><strong>User Access</strong> - Customer login/registration via OTP (email/SMS) authentication</li>
  <li><strong>Warranty Registration Form</strong>
    <ul>
      <li>Invoice upload support (Image / PDF)</li>
      <li>Auto-fill dealer details (from dealer database or manual entry by customer)</li>
      <li>Product and purchase details capture</li>
    </ul>
  </li>
  <li><strong>System Actions</strong>
    <ul>
      <li>Auto-generation of Warranty Registration Number (WRN)</li>
      <li>Real-time confirmation message: "Your warranty registration has been submitted successfully. You'll receive your certificate after verification."</li>
    </ul>
  </li>
  <li><strong>Customer Access to Records</strong>
    <ul>
      <li>View previously registered warranties</li>
      <li>Search warranties by invoice number, phone, or email</li>
    </ul>
  </li>
</ul>

<h3>3. User Dashboard (Customer Portal)</h3>
<p><strong>Objective:</strong> To provide registered customers with a self-service area for managing warranties, profiles, and documents.</p>

<h4>Features:</h4>
<ul>
  <li><strong>Secure Login</strong> - Access via Mobile OTP or Email verification</li>
  <li><strong>Dashboard Sections</strong>
    <ul>
      <li><strong>My Warranties:</strong> List of registered products with real-time status (Pending, Approved, Rejected)</li>
      <li><strong>Profile Settings:</strong> Update personal details, address, and contact information</li>
      <li><strong>Digital Certificates:</strong> View or download warranty certificates (PDF format)</li>
    </ul>
  </li>
  <li><strong>Automated Notifications:</strong> Email confirmation upon successful certificate generation</li>
</ul>

<h3>4. Backend Dashboard (Internal Use)</h3>
<p><strong>Objective:</strong> To provide the internal Century team with tools for validation, management, reporting, and policy control.</p>

<h4>Modules & Features:</h4>
<ul>
  <li><strong>Dashboard Overview</strong>
    <ul>
      <li>Total warranties registered</li>
      <li>Pending validations</li>
      <li>Approved / Rejected warranties</li>
    </ul>
  </li>
  <li><strong>Warranty Validation Module</strong>
    <ul>
      <li>View detailed registration and invoice data</li>
      <li>Manual invoice verification process</li>
      <li>Approve or reject warranty requests with comments</li>
      <li>Automated email/SMS notifications to customers</li>
      <li>Generate and issue digital warranty certificates</li>
    </ul>
  </li>
  <li><strong>Version Control & Policy Management</strong>
    <ul>
      <li>Upload and manage warranty policy documents</li>
      <li>Assign and track version numbers</li>
      <li>Auto-link latest policy version to all new registrations</li>
    </ul>
  </li>
  <li><strong>User & Dealer Management</strong>
    <ul>
      <li>Manage customer and dealer records</li>
      <li>Edit / update dealer code mappings</li>
      <li>Role-based access control and audit logs</li>
    </ul>
  </li>
  <li><strong>Reports & Data Export</strong>
    <ul>
      <li>Generate monthly warranty reports (CSV / Excel format)</li>
      <li>Filter by date, dealer, product group, or city</li>
    </ul>
  </li>
  <li><strong>Certificate Generation Engine</strong> - Auto-generate PDF warranty certificates with:
    <ul>
      <li>Unique Warranty ID</li>
      <li>Version number</li>
      <li>Issue and expiry dates (as per policy rules)</li>
      <li>Product and invoice details</li>
    </ul>
  </li>
</ul>`,
              json: {}
            }
          },
          {
            id: 'section-4',
            title: 'Customer Journey',
            order: 3,
            type: 'text',
            content: {
              html: `<h2>Customer Journey</h2>
<p><strong>Step-by-Step Flow:</strong></p>

<ol>
  <li><strong>Purchase Stage</strong>
    <ul>
      <li>Customer buys plywood from an authorized dealer and receives a valid invoice.</li>
    </ul>
  </li>
  <li><strong>Registration Stage</strong>
    <ul>
      <li>Customer visits the Century Promise Warranty Portal and selects "Register Warranty."</li>
      <li>Invoice details are entered and uploaded for verification.</li>
    </ul>
  </li>
  <li><strong>Validation Stage</strong>
    <ul>
      <li>Data is transmitted to the backend validation team.</li>
      <li>Manual verification of invoice and dealer details is conducted.</li>
    </ul>
  </li>
  <li><strong>Certificate Generation</strong>
    <ul>
      <li>Upon approval, a unique Warranty Identification Number (WIN) is generated.</li>
      <li>A digital warranty certificate is issued and emailed to the customer.</li>
    </ul>
  </li>
  <li><strong>Post-Registration Access</strong>
    <ul>
      <li>Customers can log in anytime to view, download, or verify their registered warranties.</li>
    </ul>
  </li>
</ol>`,
              json: {}
            }
          },
          {
            id: 'section-5',
            title: 'Project Management',
            order: 4,
            type: 'text',
            content: {
              html: `<h2>Project Management</h2>
<p>Our development process has a systematic approach in managing a project.</p>

<h3>Execution Model</h3>
<p>The Interactive Bees dedicated team will start the project after signing the contract. A delivery schedule will be provided keeping in mind the project priority. We follow basic project management techniques that include 3 key activities:</p>

<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
  <tr>
    <td><strong>Project Initiation</strong></td>
    <td>The project plan will be put on a timeline, with the milestones and deliverables clearly identified.</td>
  </tr>
  <tr>
    <td><strong>Project Planning</strong></td>
    <td>The project plan will be created as per the tasks. The critical path for the project will be identified, and appropriate resources will be allocated.</td>
  </tr>
  <tr>
    <td><strong>Project Execution</strong></td>
    <td>Regular status updates and milestone reviews will be conducted to ensure the project stays on track.</td>
  </tr>
</table>

<h3>Development Methodology</h3>
<ul>
  <li><strong>Agile Approach:</strong> Iterative development with regular client feedback</li>
  <li><strong>Quality Assurance:</strong> Comprehensive testing at each stage</li>
  <li><strong>Documentation:</strong> Complete technical and user documentation</li>
  <li><strong>Training:</strong> End-user and admin training sessions</li>
</ul>`,
              json: {}
            }
          },
          {
            id: 'section-6',
            title: 'Investment & Pricing',
            order: 5,
            type: 'pricing',
            content: {
              html: `<h2>Investment Breakdown</h2>
<p>Comprehensive pricing for the Century Ply Warranty Portal development project.</p>

<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th>Deliverable</th>
      <th>Description</th>
      <th>Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Landing Page</strong></td>
      <td>Responsive landing page with CTAs, trust indicators, and dealer locator</td>
      <td>₹75,000</td>
    </tr>
    <tr>
      <td><strong>Customer Portal</strong></td>
      <td>Warranty registration, OTP authentication, document upload, dashboard</td>
      <td>₹2,50,000</td>
    </tr>
    <tr>
      <td><strong>Backend Dashboard</strong></td>
      <td>Validation module, user management, reporting, certificate generation</td>
      <td>₹3,50,000</td>
    </tr>
    <tr>
      <td><strong>Integration & Testing</strong></td>
      <td>API integration, security testing, UAT, bug fixes</td>
      <td>₹1,25,000</td>
    </tr>
    <tr>
      <td><strong>Training & Documentation</strong></td>
      <td>User manuals, admin training, technical documentation</td>
      <td>₹50,000</td>
    </tr>
    <tr>
      <td><strong>Project Management</strong></td>
      <td>Planning, coordination, status reporting</td>
      <td>₹50,000</td>
    </tr>
    <tr>
      <td colspan="2"><strong>Total Project Cost</strong></td>
      <td><strong>₹9,00,000</strong></td>
    </tr>
  </tbody>
</table>

<h3>Additional Services (Optional)</h3>
<ul>
  <li><strong>Annual Maintenance:</strong> ₹1,00,000/year (includes hosting, updates, support)</li>
  <li><strong>SMS Gateway Integration:</strong> ₹25,000 (one-time) + usage charges</li>
  <li><strong>Mobile App Development:</strong> ₹4,50,000 (iOS + Android)</li>
</ul>

<h3>Payment Terms</h3>
<ul>
  <li>30% advance upon project commencement</li>
  <li>40% upon completion of development and UAT</li>
  <li>30% upon final delivery and go-live</li>
</ul>`,
              json: {}
            }
          }
        ]
      },
      clientName: 'Ms. Shabana Rahman',
      clientCompany: 'Century Ply (New Age Products)',
      clientEmail: 'shabana.rahman@centuryply.com',
      clientAddress: 'CENTURY HOUSE P15/1, Taratala Road, Kolkata West Bengal, Pincode - 700088',
      status: 'DRAFT',
      createdBy: salesMember.id
    }
  })

  // Add pricing items
  await prisma.pricingItem.createMany({
    data: [
      {
        proposalId: proposal.id,
        serviceDescription: 'Landing Page Development',
        cost: 75000,
        frequency: 'one-time',
        orderIndex: 1
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Customer Portal (Warranty Registration)',
        cost: 250000,
        frequency: 'one-time',
        orderIndex: 2
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Backend Dashboard & Validation System',
        cost: 350000,
        frequency: 'one-time',
        orderIndex: 3
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Integration & Testing',
        cost: 125000,
        frequency: 'one-time',
        orderIndex: 4
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Training & Documentation',
        cost: 50000,
        frequency: 'one-time',
        orderIndex: 5
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Project Management',
        cost: 50000,
        frequency: 'one-time',
        orderIndex: 6
      },
      {
        proposalId: proposal.id,
        serviceDescription: 'Annual Maintenance & Support',
        cost: 100000,
        frequency: 'yearly',
        orderIndex: 7
      }
    ]
  })

  console.log('✅ Century Ply Warranty Portal Proposal seeded successfully!')
  console.log('\n📄 Created Proposal:')
  console.log(`   Title: ${proposal.title}`)
  console.log(`   Client: ${proposal.clientName} (${proposal.clientCompany})`)
  console.log(`   Sections: 6`)
  console.log(`   Pricing Items: 7`)
  console.log(`   Total Value: ₹9,00,000 + ₹1,00,000/year maintenance`)
  console.log('\n👥 Test Users:')
  console.log('   Owner: owner@example.com / owner123')
  console.log('   Sales: sales@example.com / sales123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
