import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seeding comprehensive dummy data for Proposal Builder...')

  // 1. Create Permissions
  const permissionsData = [
    { name: 'VIEW', description: 'View resources', category: 'General' },
    { name: 'EDIT', description: 'Edit resources', category: 'General' },
    { name: 'CREATE', description: 'Create new resources', category: 'General' },
    { name: 'DELETE', description: 'Delete resources', category: 'General' },
    { name: 'MANAGE_USERS', description: 'Manage users and roles', category: 'Administration' },
    { name: 'APPROVE_PROPOSAL', description: 'Approve proposals', category: 'Proposals' },
    { name: 'EXPORT_PDF', description: 'Export proposals to PDF/DOCX', category: 'Proposals' },
    { name: 'SHARE_PROPOSAL', description: 'Share proposals with external users', category: 'Proposals' },
    { name: 'MANAGE_SETTINGS', description: 'Modify company configuration', category: 'Administration' },
  ]

  const permissionsMap: Record<string, string> = {}
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
    permissionsMap[perm.name] = p.id
  }

  // 2. Create Roles
  const rolesData = [
    {
      name: 'SUPER_ADMIN',
      description: 'Super Admin - Unrestricted platform control across all organizations',
      isDefault: false,
      permNames: ['VIEW', 'EDIT', 'CREATE', 'DELETE', 'MANAGE_USERS', 'APPROVE_PROPOSAL', 'EXPORT_PDF', 'SHARE_PROPOSAL', 'MANAGE_SETTINGS'],
    },
    {
      name: 'OWNER',
      description: 'Owner / Executive - Full company administration and approval rights',
      isDefault: false,
      permNames: ['VIEW', 'EDIT', 'CREATE', 'DELETE', 'MANAGE_USERS', 'APPROVE_PROPOSAL', 'EXPORT_PDF', 'SHARE_PROPOSAL', 'MANAGE_SETTINGS'],
    },
    {
      name: 'PROPOSAL_MANAGER',
      description: 'Proposal Manager - Template governance, assignment, and proposal oversight',
      isDefault: false,
      permNames: ['VIEW', 'EDIT', 'CREATE', 'EXPORT_PDF', 'SHARE_PROPOSAL', 'APPROVE_PROPOSAL'],
    },
    {
      name: 'SALES_EXECUTIVE',
      description: 'Sales Executive - Proposal creation and deal tracking',
      isDefault: true,
      permNames: ['VIEW', 'EDIT', 'CREATE', 'EXPORT_PDF', 'SHARE_PROPOSAL'],
    },
    {
      name: 'FINANCE',
      description: 'Finance Specialist - Pricing approval, tax configuration, and commercial terms',
      isDefault: false,
      permNames: ['VIEW', 'EDIT', 'APPROVE_PROPOSAL', 'EXPORT_PDF'],
    },
    {
      name: 'LEGAL',
      description: 'Legal Counsel - Terms, SLA, and compliance review',
      isDefault: false,
      permNames: ['VIEW', 'EDIT', 'APPROVE_PROPOSAL'],
    },
    {
      name: 'REVIEWER',
      description: 'Proposal Reviewer - Commenting, feedback, and pre-approval audit',
      isDefault: false,
      permNames: ['VIEW'],
    },
    {
      name: 'VIEWER',
      description: 'Read-only Viewer - Read-only access to published proposals',
      isDefault: false,
      permNames: ['VIEW'],
    },
  ]

  const rolesMap: Record<string, any> = {}
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: {
        name: r.name,
        description: r.description,
        isDefault: r.isDefault,
        permissions: {
          connect: r.permNames.map((pName) => ({ name: pName })),
        },
      },
    })
    rolesMap[r.name] = role
  }

  // 3. Create Users
  const defaultPassword = await hash('Welcome@123', 10)

  const usersData = [
    {
      email: 'admin@interactivebees.com',
      name: 'Admin',
      roleName: 'OWNER',
      companyName: 'Interactive Bees Pvt. Ltd.',
      phone: '+91 98765 43210',
    },
    {
      email: 'monica.gupta@interactivebees.com',
      name: 'Monica Gupta',
      roleName: 'SALES_TEAM',
      companyName: 'Interactive Bees Pvt. Ltd.',
      phone: '+91 98112 34567',
    },
    {
      email: 'rahul.verma@interactivebees.com',
      name: 'Rahul Verma',
      roleName: 'BUSINESS_EXPERT',
      companyName: 'Interactive Bees Pvt. Ltd.',
      phone: '+91 98223 45678',
    },
    {
      email: 'priya.sharma@interactivebees.com',
      name: 'Priya Sharma',
      roleName: 'CONTENT_CREATOR',
      companyName: 'Interactive Bees Pvt. Ltd.',
      phone: '+91 98334 56789',
    },
    {
      email: 'vikram.malhotra@interactivebees.com',
      name: 'Vikram Malhotra',
      roleName: 'REVIEWER',
      companyName: 'Interactive Bees Pvt. Ltd.',
      phone: '+91 98445 67890',
    },
    {
      email: 'ananya.roy@interactivebees.com',
      name: 'Ananya Roy',
      roleName: 'SALES_TEAM',
      companyName: 'Interactive Bees Pvt. Ltd.',
      phone: '+91 98556 78901',
    },
  ]

  const usersMap: Record<string, any> = {}
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, phone: u.phone },
      create: {
        email: u.email,
        password: defaultPassword,
        name: u.name,
        companyName: u.companyName,
        phone: u.phone,
        roleId: rolesMap[u.roleName]?.id,
        isActive: true,
      },
    })
    usersMap[u.email] = user
  }

  // 4. Create Company Settings
  await prisma.companySetting.upsert({
    where: { userId: usersMap['admin@interactivebees.com'].id },
    update: {},
    create: {
      userId: usersMap['admin@interactivebees.com'].id,
      companyName: 'Interactive Bees Pvt. Ltd.',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      address: 'Plot No. 42, Sector 44, Institutional Area, Gurugram, Haryana - 122003',
      phone: '+91 124 4567890',
      email: 'contact@interactivebees.com',
      website: 'https://www.interactivebees.com',
      defaultPaymentTerms: '50% advance upon project signoff, 30% upon milestone completion, 20% post deployment.',
      defaultValidityDays: 30,
      taxRate: 18.0,
    },
  })

  // 5. Create Templates
  const templatesData = [
    {
      name: 'Web Portal Development Template',
      category: 'Software Development',
      sections: {
        sections: [
          { id: '1', title: 'Executive Summary', content: 'Comprehensive overview of web portal objectives, target user base, and expected business ROI.' },
          { id: '2', title: 'Project Overview', content: 'Detailed scope including frontend UX design, backend API development, and third-party integrations.' },
          { id: '3', title: 'Scope of Work & Deliverables', content: 'Full breakdown of sprint deliverables, user acceptance testing, and production deployment.' },
          { id: '4', title: 'Technology Architecture', content: 'Next.js, Node.js, Prisma ORM, PostgreSQL/SQLite, Cloudflare CDN, and AWS S3 infrastructure.' },
          { id: '5', title: 'Project Timeline', content: 'Phase 1: Discovery (Weeks 1-2), Phase 2: Design (Weeks 3-4), Phase 3: Dev (Weeks 5-10), Phase 4: Launch (Week 12).' },
          { id: '6', title: 'Investment & Commercials', content: 'Itemized breakdown of design, development, quality assurance, and ongoing maintenance.' }
        ]
      },
      createdBy: usersMap['priya.sharma@interactivebees.com'].id,
    },
    {
      name: 'Enterprise ERP Implementation Template',
      category: 'Enterprise Solutions',
      sections: {
        sections: [
          { id: '1', title: 'Project Context & Challenges', content: 'Evaluation of legacy systems and operational bottlenecks across supply chain management.' },
          { id: '2', title: 'Proposed ERP Architecture', content: 'Modular SAP / Custom ERP deployment covering Inventory, Finance, HRMS, and CRM.' },
          { id: '3', title: 'Data Migration Plan', content: 'ETL pipelines to migrate historical data safely with 99.9% validation checks.' },
          { id: '4', title: 'Training & Change Management', content: 'User onboarding programs, video tutorials, and dedicated support desk setup.' }
        ]
      },
      createdBy: usersMap['admin@interactivebees.com'].id,
    },
    {
      name: 'Digital Marketing & Brand Strategy Template',
      category: 'Marketing',
      sections: {
        sections: [
          { id: '1', title: 'Brand Positioning Overview', content: 'Strategic analysis of market competition and target audience personas.' },
          { id: '2', title: 'Omnichannel Campaign Plan', content: 'SEO, Google Ads, Meta Ad campaigns, content strategy, and influencer marketing.' },
          { id: '3', title: 'Performance Metrics & Analytics', content: 'KPI tracking including CAC, LTV, Conversion Rate, and Monthly Active Users.' }
        ]
      },
      createdBy: usersMap['monica.gupta@interactivebees.com'].id,
    },
    {
      name: 'Cloud Migration & Infrastructure Template',
      category: 'Cloud & DevOps',
      sections: {
        sections: [
          { id: '1', title: 'Current State Assessment', content: 'Audit of on-premise server utilization, network security, and backup systems.' },
          { id: '2', title: 'Target Cloud Architecture', content: 'Multi-region AWS/GCP Kubernetes cluster setup with automated failover and CMEK encryption.' },
          { id: '3', title: 'Migration Strategy & Downtime Window', content: 'Blue-green deployment model ensuring zero zero-downtime database replication.' }
        ]
      },
      createdBy: usersMap['rahul.verma@interactivebees.com'].id,
    },
    {
      name: 'Mobile App Development (iOS & Android)',
      category: 'Mobile Apps',
      sections: {
        sections: [
          { id: '1', title: 'App Vision & Feature Matrix', content: 'Cross-platform React Native / Flutter app with push notifications, offline mode, and biometrics.' },
          { id: '2', title: 'UI/UX Design Framework', content: 'Interactive Figma prototypes, design system guidelines, and accessibility compliance.' },
          { id: '3', title: 'Backend API Specifications', content: 'RESTful and GraphQL APIs with OAuth 2.0 authentication and rate-limiting.' }
        ]
      },
      createdBy: usersMap['priya.sharma@interactivebees.com'].id,
    },
    {
      name: 'Cybersecurity Audit & Compliance SLA',
      category: 'Cybersecurity',
      sections: {
        sections: [
          { id: '1', title: 'Vulnerability Assessment Scope', content: 'VAPT testing, SOC 2 compliance check, penetration testing, and code audits.' },
          { id: '2', title: 'Remediation Roadmap', content: 'Prioritized security patches, IAM policy enforcement, and 24/7 SIEM monitoring.' }
        ]
      },
      createdBy: usersMap['admin@interactivebees.com'].id,
    }
  ]

  const templatesMap: Record<string, any> = {}
  for (const t of templatesData) {
    const tmpl = await prisma.template.create({
      data: t,
    })
    templatesMap[t.name] = tmpl
  }

  // 6. Create Proposals
  const proposalsData = [
    {
      title: 'ASDC Website Revamp Proposal',
      templateId: templatesMap['Web Portal Development Template']?.id,
      clientName: 'Automotive Skills Development Council (ASDC)',
      clientCompany: 'ASDC India',
      clientEmail: 'contact@asdc.org.in',
      clientAddress: '1st Floor, Seamless House, New Delhi',
      status: 'DRAFT',
      createdBy: usersMap['monica.gupta@interactivebees.com'].id,
      content: {
        executiveSummary: 'Complete modernization of ASDC digital platform to enhance automotive skill certification accessibility.',
        scope: 'Design, frontend Next.js development, payment gateway integration, and candidate portal.',
      },
      pricing: [
        { serviceDescription: 'UX/UI Wireframing & Prototyping', cost: 150000, frequency: 'One-time' },
        { serviceDescription: 'Next.js Frontend & API Integration', cost: 350000, frequency: 'One-time' },
        { serviceDescription: 'Annual Hosting & Maintenance', cost: 60000, frequency: 'Yearly' }
      ]
    },
    {
      title: 'Centuryply Warranty Portal Scope of Work',
      templateId: templatesMap['Web Portal Development Template']?.id,
      clientName: 'Century Plyboard India Ltd.',
      clientCompany: 'CenturyPly',
      clientEmail: 'digital@centuryply.com',
      clientAddress: 'Century House, Kolkata, West Bengal',
      status: 'IN_REVIEW',
      createdBy: usersMap['ananya.roy@interactivebees.com'].id,
      content: {
        executiveSummary: 'Automated QR code scanning warranty verification portal for CenturyPly buyers and contractors.',
        scope: 'QR code validation backend, WhatsApp integration, dealer locator, and warranty PDF generation.',
      },
      pricing: [
        { serviceDescription: 'Warranty Management Portal Engine', cost: 450000, frequency: 'One-time' },
        { serviceDescription: 'WhatsApp Business API Integration', cost: 120000, frequency: 'One-time' },
        { serviceDescription: 'AWS Infrastructure Setup & Managed SLA', cost: 90000, frequency: 'Yearly' }
      ]
    },
    {
      title: 'Canon Security Infrastructure Upgrade',
      templateId: templatesMap['Cybersecurity Audit & Compliance SLA']?.id,
      clientName: 'Canon India Pvt. Ltd.',
      clientCompany: 'Canon India',
      clientEmail: 'info@canon.co.in',
      clientAddress: 'Cyber City, Phase 3, Gurugram',
      status: 'APPROVED',
      createdBy: usersMap['monica.gupta@interactivebees.com'].id,
      approvedBy: usersMap['rahul.verma@interactivebees.com'].id,
      approvedAt: new Date('2026-09-12'),
      content: {
        executiveSummary: 'Enterprise-grade cybersecurity audit, penetration testing, and ISO 27001 hardening.',
        scope: 'Full vulnerability assessment, source code audit, cloud security policy setup.',
      },
      pricing: [
        { serviceDescription: 'Vulnerability Assessment & Penetration Testing (VAPT)', cost: 280000, frequency: 'One-time' },
        { serviceDescription: 'Cloud IAM & Network Hardening', cost: 180000, frequency: 'One-time' }
      ]
    },
    {
      title: 'NASSCOM Annual Event Web Ecosystem',
      templateId: templatesMap['Web Portal Development Template']?.id,
      clientName: 'NASSCOM India',
      clientCompany: 'NASSCOM',
      clientEmail: 'events@nasscom.in',
      clientAddress: 'Noida Special Economic Zone, UP',
      status: 'DRAFT',
      createdBy: usersMap['ananya.roy@interactivebees.com'].id,
      content: {
        executiveSummary: 'High-concurrency event registration, live streaming hub, and delegate matchmaking portal.',
        scope: 'Registration form, ticketing integration, speaker directory, and live agenda builder.',
      },
      pricing: [
        { serviceDescription: 'Event Portal & Delegate Ticketing System', cost: 320000, frequency: 'One-time' }
      ]
    },
    {
      title: 'Indorama Industry 4.0 Portal Revamp',
      templateId: templatesMap['Enterprise ERP Implementation Template']?.id,
      clientName: 'Indorama Synthetics Ltd.',
      clientCompany: 'Indorama Group',
      clientEmail: 'tech@indorama.com',
      clientAddress: 'Corporate Towers, Mumbai',
      status: 'IN_REVIEW',
      createdBy: usersMap['monica.gupta@interactivebees.com'].id,
      content: {
        executiveSummary: 'IoT dashboard and manufacturing yield monitoring system for plant operations.',
        scope: 'Real-time telemetry ingestion, Grafana custom charts, alert triggers.',
      },
      pricing: [
        { serviceDescription: 'IoT Data Pipeline & Real-Time Dashboard', cost: 650000, frequency: 'One-time' }
      ]
    },
    {
      title: 'Tata Motors Supply Chain Analytics Dashboard',
      templateId: templatesMap['Enterprise ERP Implementation Template']?.id,
      clientName: 'Tata Motors Limited',
      clientCompany: 'Tata Motors',
      clientEmail: 'scm@tatamotors.com',
      clientAddress: 'Bombay House, Homi Mody Street, Mumbai',
      status: 'SENT',
      createdBy: usersMap['admin@interactivebees.com'].id,
      content: {
        executiveSummary: 'Predictive analytics platform for spare parts demand forecasting and logistics optimization.',
        scope: 'BigQuery ML model pipeline, interactive React analytics interface, automated PDF reporting.',
      },
      pricing: [
        { serviceDescription: 'Predictive Analytics ML Engine Setup', cost: 850000, frequency: 'One-time' },
        { serviceDescription: 'Quarterly Model Retraining & Support', cost: 150000, frequency: 'Quarterly' }
      ]
    },
    {
      title: 'Apollo Telehealth App & Integration',
      templateId: templatesMap['Mobile App Development (iOS & Android)']?.id,
      clientName: 'Apollo Hospitals Enterprise',
      clientCompany: 'Apollo Healthcare',
      clientEmail: 'digital@apollohospitals.com',
      clientAddress: 'Greams Road, Chennai, Tamil Nadu',
      status: 'APPROVED',
      createdBy: usersMap['monica.gupta@interactivebees.com'].id,
      approvedBy: usersMap['rahul.verma@interactivebees.com'].id,
      approvedAt: new Date('2026-09-05'),
      content: {
        executiveSummary: 'Patient doctor consultation mobile app with video calls, e-prescriptions, and lab reports.',
        scope: 'iOS & Android Flutter app, WebRTC video calling, FHIR compliant database integration.',
      },
      pricing: [
        { serviceDescription: 'Cross-Platform Mobile App Development', cost: 720000, frequency: 'One-time' },
        { serviceDescription: 'HIPAA & Telehealth Regulatory Audit', cost: 110000, frequency: 'One-time' }
      ]
    },
    {
      title: 'Maruti Suzuki Cloud Architecture Migration',
      templateId: templatesMap['Cloud Migration & Infrastructure Template']?.id,
      clientName: 'Maruti Suzuki India Limited',
      clientCompany: 'Maruti Suzuki',
      clientEmail: 'cloud@maruti.co.in',
      clientAddress: 'Nelson Mandela Road, Vasant Kunj, New Delhi',
      status: 'PENDING_APPROVAL',
      createdBy: usersMap['ananya.roy@interactivebees.com'].id,
      content: {
        executiveSummary: 'Migration of 40+ microservices from legacy data center to Google Cloud Platform.',
        scope: 'GKE cluster setup, Cloud SQL migration, Terraform IaC deployment, CI/CD pipelines.',
      },
      pricing: [
        { serviceDescription: 'Cloud Migration & Terraform Setup', cost: 950000, frequency: 'One-time' }
      ]
    }
  ]

  for (const prop of proposalsData) {
    const { pricing, ...propFields } = prop
    const createdProposal = await prisma.proposal.create({
      data: {
        ...propFields,
        content: propFields.content as any,
        pricingItems: {
          create: pricing.map((item, idx) => ({
            ...item,
            orderIndex: idx,
          })),
        },
        comments: {
          create: [
            {
              userId: usersMap['rahul.verma@interactivebees.com'].id,
              content: 'Please ensure the SLA terms match our standard 99.9% uptime clause.',
            }
          ]
        },
        versions: {
          create: [
            {
              changedBy: propFields.createdBy,
              contentSnapshot: propFields.content as any,
              changeDescription: 'Initial draft proposal created',
            }
          ]
        }
      }
    })
  }

  // 7. Create Clients
  const clientsData = [
    {
      companyName: 'Automotive Skills Development Council',
      name: 'Arindam Lahiri',
      industry: 'Automotive',
      email: 'contact@asdc.org.in',
      phone: '+91 11 41868900',
      gstNumber: '07AAAAA0000A1Z5',
      address: '1st Floor, Seamless House, New Delhi',
      city: 'New Delhi',
      status: 'ACTIVE',
    },
    {
      companyName: 'Century Plyboard India Ltd.',
      name: 'Keshav Bhajanka',
      industry: 'Manufacturing',
      email: 'digital@centuryply.com',
      phone: '+91 33 39403950',
      gstNumber: '19AAACC0000B1Z2',
      address: 'Century House, Kolkata, West Bengal',
      city: 'Kolkata',
      status: 'ACTIVE',
    },
    {
      companyName: 'Canon India Pvt. Ltd.',
      name: 'Manabu Yamazaki',
      industry: 'Technology',
      email: 'info@canon.co.in',
      phone: '+91 124 4160000',
      gstNumber: '06AAAAA1111A1Z9',
      address: 'Cyber City, Phase 3, Gurugram',
      city: 'Gurugram',
      status: 'ACTIVE',
    },
    {
      companyName: 'NASSCOM India',
      name: 'Debjani Ghosh',
      industry: 'Technology',
      email: 'events@nasscom.in',
      phone: '+91 120 4990111',
      gstNumber: '09AAAAA2222A1Z3',
      address: 'Noida Special Economic Zone, UP',
      city: 'Noida',
      status: 'LEAD',
    }
  ]

  for (const c of clientsData) {
    await prisma.client.create({ data: c })
  }

  // 8. Create Content Library Items
  const contentItemsData = [
    {
      title: 'Company Executive Introduction & Credentials',
      category: 'Company Intro',
      content: 'Interactive Bees Pvt. Ltd. is a premier digital solutions agency with over 15 years of excellence in building web portals, enterprise software, and cloud applications. We serve Fortune 500 companies and government bodies across India.',
      tags: 'intro, overview, credentials, background',
      createdBy: usersMap['admin@interactivebees.com'].id,
    },
    {
      title: 'Standard 99.9% Uptime Service Level Agreement (SLA)',
      category: 'Standard Clauses',
      content: 'Interactive Bees guarantees 99.9% monthly platform uptime for cloud hosted environments, excluding scheduled maintenance windows announced 48 hours in advance.',
      tags: 'sla, uptime, maintenance, cloud, guarantee',
      createdBy: usersMap['rahul.verma@interactivebees.com'].id,
    },
    {
      title: 'ISO 27001 Security Compliance Clause',
      category: 'Standard Clauses',
      content: 'All source code, database architectures, and user telemetry adhere strictly to ISO 27001 security guidelines, zero-trust network access, and end-to-end data encryption at rest and in transit.',
      tags: 'security, iso27001, compliance, encryption',
      createdBy: usersMap['rahul.verma@interactivebees.com'].id,
    },
    {
      title: 'Frequently Asked Questions (FAQ) - Web Portal SLA',
      category: 'FAQs',
      content: 'Q: How are bug fixes handled post launch?\nA: All critical bugs are addressed within 4 hours during the 90-day post launch warranty period at no additional cost.',
      tags: 'faq, warranty, bugs, support',
      createdBy: usersMap['priya.sharma@interactivebees.com'].id,
    }
  ]

  for (const ci of contentItemsData) {
    await prisma.contentLibraryItem.create({ data: ci })
  }

  // 9. Create Asset Library Items
  const assetItemsData = [
    {
      title: 'Interactive Bees Primary Logo (Dark BG)',
      category: 'Logos',
      fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      fileSize: 45000,
      fileType: 'image/png',
      tags: 'logo, brand, primary',
      uploadedBy: usersMap['admin@interactivebees.com'].id,
    },
    {
      title: 'ISO 27001 Security Certification Badge',
      category: 'Certificates',
      fileUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
      fileSize: 85000,
      fileType: 'image/png',
      tags: 'iso, certificate, compliance, badge',
      uploadedBy: usersMap['admin@interactivebees.com'].id,
    },
    {
      title: 'Enterprise Software Solutions Brochure 2026',
      category: 'Brochures',
      fileUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      fileSize: 1200000,
      fileType: 'application/pdf',
      tags: 'brochure, pdf, marketing',
      uploadedBy: usersMap['monica.gupta@interactivebees.com'].id,
    }
  ]

  for (const ai of assetItemsData) {
    await prisma.assetLibraryItem.create({ data: ai })
  }

  // 10. Create Audit Log Entry
  await prisma.auditLog.create({
    data: {
      userId: usersMap['admin@interactivebees.com'].id,
      action: 'SYSTEM_SEED',
      entity: 'System',
      details: 'Comprehensive enterprise portal dummy data seeded successfully.',
      ipAddress: '127.0.0.1',
    }
  })

  console.log('✅ Dummy data populated successfully!')
  console.log(`- Created ${Object.keys(rolesMap).length} Roles`)
  console.log(`- Created ${Object.keys(usersMap).length} Users`)
  console.log(`- Created ${templatesData.length} Templates`)
  console.log(`- Created ${proposalsData.length} Proposals`)
  console.log(`- Created ${clientsData.length} Clients`)
  console.log(`- Created ${contentItemsData.length} Content Library Snippets`)
  console.log(`- Created ${assetItemsData.length} Asset Library Items`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding dummy data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

