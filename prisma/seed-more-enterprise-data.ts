import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Populating rich enterprise proposals, templates, clients, and assets...')

  // Find owner user
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@interactivebees.com' }
  }) || await prisma.user.findFirst()

  if (!adminUser) {
    console.error('No admin user found. Please run seed-dummy-data first.')
    return
  }

  // 1. Enterprise Clients (CRM)
  const enterpriseClients = [
    {
      name: 'Rajesh Verma',
      companyName: 'Tata Motors Limited',
      email: 'procurement@tatamotors.com',
      phone: '+91 22 6656 8000',
      address: 'Bombay House, 24 Homi Mody Street, Fort',
      city: 'Mumbai',
      country: 'India',
      gstNumber: '27AAACT2727Q1ZW',
      status: 'ACTIVE',
      contacts: {
        create: [
          { name: 'Rajesh Verma', designation: 'VP Digital Transformation', email: 'r.verma@tatamotors.com', phone: '+91 98200 11223', isPrimary: true },
          { name: 'Priya Sharma', designation: 'Lead IT Procurement', email: 'p.sharma@tatamotors.com', phone: '+91 98200 44556', isPrimary: false }
        ]
      }
    },
    {
      name: 'Anil Malhotra',
      companyName: 'Maruti Suzuki India Ltd.',
      email: 'it-vendor@maruti.co.in',
      phone: '+91 11 4678 1000',
      address: '1 Nelson Mandela Road, Vasant Kunj',
      city: 'New Delhi',
      country: 'India',
      gstNumber: '07AAAAC1234D1Z2',
      status: 'ACTIVE',
      contacts: {
        create: [
          { name: 'Anil Malhotra', designation: 'Chief Technology Officer', email: 'anil.m@maruti.co.in', phone: '+91 98111 22334', isPrimary: true }
        ]
      }
    },
    {
      name: 'Dr. Vikram Reddy',
      companyName: 'Apollo Hospitals Group',
      email: 'digital@apollohospitals.com',
      phone: '+91 44 2829 0200',
      address: 'Ali Towers, 55 Greams Road',
      city: 'Chennai',
      country: 'India',
      gstNumber: '33AAAAA5678B1Z9',
      status: 'ACTIVE',
      contacts: {
        create: [
          { name: 'Dr. Vikram Reddy', designation: 'Head of Digital Health', email: 'v.reddy@apollohospitals.com', phone: '+91 98400 55667', isPrimary: true }
        ]
      }
    },
    {
      name: 'Sunil Kumar',
      companyName: 'NASSCOM',
      email: 'events@nasscom.in',
      phone: '+91 120 4990111',
      address: 'Plot No. 7 to 10, Sector 126',
      city: 'Noida',
      country: 'India',
      gstNumber: '09AAAAA9876C1Z4',
      status: 'ACTIVE',
      contacts: {
        create: [
          { name: 'Sunil Kumar', designation: 'Director Events & Media', email: 'sunil@nasscom.in', phone: '+91 98100 99887', isPrimary: true }
        ]
      }
    },
    {
      name: 'Meenakshi Iyer',
      companyName: 'Canon India Pvt. Ltd.',
      email: 'enterprise@canon.co.in',
      phone: '+91 124 4160000',
      address: 'Building 9B, DLF Cyber City, Phase III',
      city: 'Gurugram',
      country: 'India',
      gstNumber: '06AAAAC4321E1Z8',
      status: 'ACTIVE',
      contacts: {
        create: [
          { name: 'Meenakshi Iyer', designation: 'Head of Information Security', email: 'meenakshi.i@canon.co.in', phone: '+91 98180 33445', isPrimary: true }
        ]
      }
    }
  ]

  for (const cData of enterpriseClients) {
    await prisma.client.create({
      data: cData
    })
  }

  console.log('✅ Enterprise Clients & Contacts seeded.')

  // 2. Rich Content Library Items
  const contentSnippets = [
    {
      title: 'Interactive Bees Overview & Heritage',
      category: 'Company Intro',
      content: `<p>Interactive Bees Pvt. Ltd. is a premier digital engineering and strategic brand agency headquartered in New Delhi. With over 15 years of industry leadership, we have delivered 500+ high-impact digital solutions for Global Fortune 500 enterprises and government trade bodies.</p>`,
      tags: 'company, intro, heritage, overview'
    },
    {
      title: 'Next.js 14 Microservices Stack Clause',
      category: 'Standard Scope',
      content: `<p>Our platform architecture leverages Next.js 14 App Router, TypeScript, PostgreSQL with Prisma ORM, Redis caching, and automated Docker container deployment on AWS/GCP Kubernetes clusters to ensure 99.99% operational SLA.</p>`,
      tags: 'architecture, nextjs, postgresql, cloud, sla'
    },
    {
      title: 'ISO 27001 Security & VAPT Audit Clause',
      category: 'Compliance',
      content: `<p>All delivered software systems undergo rigorous third-party Vulnerability Assessment and Penetration Testing (VAPT), compliance mapping to ISO 27001 and OWASP Top 10 security standards, and full CMEK data encryption at rest and in transit.</p>`,
      tags: 'security, vapt, iso27001, compliance'
    },
    {
      title: 'Post-Launch Warranty & Dedicated 24/7 SLA',
      category: 'SLA & Warranty',
      content: `<p>We provide a 90-day comprehensive post-launch warranty covering all critical bug fixes and performance tuning, supplemented by 24/7 P1 incident response (< 2 Hours SLA) and daily automated database backups.</p>`,
      tags: 'warranty, support, sla, maintenance'
    }
  ]

  for (const snippet of contentSnippets) {
    await prisma.contentLibraryItem.create({
      data: {
        ...snippet,
        createdBy: adminUser.id
      }
    })
  }

  console.log('✅ Rich Content Library Snippets seeded.')

  // 3. Asset Library Items
  const assetItems = [
    {
      title: 'Interactive Bees Official Brand Mark',
      category: 'Logos',
      fileUrl: '/logo.png',
      fileSize: 45200,
      fileType: 'image/png',
      tags: 'logo, brand, ibees'
    },
    {
      title: 'AWS Certified Cloud Solutions Architecture',
      category: 'Certificates',
      fileUrl: '/assets/aws-architecture.png',
      fileSize: 128000,
      fileType: 'image/png',
      tags: 'aws, cloud, certification'
    },
    {
      title: 'Interactive Bees Corporate Credentials Presentation',
      category: 'Brochures',
      fileUrl: '/assets/ibees-deck.pdf',
      fileSize: 3450000,
      fileType: 'application/pdf',
      tags: 'presentation, deck, company-profile'
    }
  ]

  for (const asset of assetItems) {
    await prisma.assetLibraryItem.create({
      data: {
        ...asset,
        uploadedBy: adminUser.id
      }
    })
  }

  console.log('✅ Asset Library Items seeded.')

  // 4. Update Company Settings
  await prisma.companySetting.upsert({
    where: { userId: adminUser.id },
    update: {
      companyName: 'Interactive Bees Pvt. Ltd.',
      logoUrl: '/logo.png',
      address: 'Phase-III, Okhla Industrial Area, New Delhi 110020',
      phone: '+91 11 4160 5500',
      email: 'admin@interactivebees.com',
      website: 'https://www.interactivebees.com',
      defaultPaymentTerms: '30% Advance on Kickoff, 40% Beta Delivery, 30% Final Sign-off',
      defaultValidityDays: 30,
      taxRate: 18.0
    },
    create: {
      userId: adminUser.id,
      companyName: 'Interactive Bees Pvt. Ltd.',
      logoUrl: '/logo.png',
      address: 'Phase-III, Okhla Industrial Area, New Delhi 110020',
      phone: '+91 11 4160 5500',
      email: 'admin@interactivebees.com',
      website: 'https://www.interactivebees.com',
      defaultPaymentTerms: '30% Advance on Kickoff, 40% Beta Delivery, 30% Final Sign-off',
      defaultValidityDays: 30,
      taxRate: 18.0
    }
  })

  console.log('✅ Company Settings updated.')
  console.log('🎉 Enterprise Data Filling Completed Successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
