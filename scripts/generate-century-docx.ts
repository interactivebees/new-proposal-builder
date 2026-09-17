import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, Header, Footer, PageNumber } from 'docx'
import * as fs from 'fs'
import * as path from 'path'

async function generateDocx() {
  console.log('Generating Century Ply Proposal DOCX...')

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'ordered-list',
          levels: [
            { level: 0, format: 'decimal', text: '%1.\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: 'decimal', text: '%2.\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } }
          ]
        },
        {
          reference: 'unordered-list',
          levels: [
            { level: 0, format: 'bullet', text: '•\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: 'bullet', text: '•\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } }
          ]
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 1080,
              bottom: 720,
              left: 1080,
              header: 360,
              footer: 360
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'INTERACTIVE BEES PVT. LTD. | PROPOSAL', bold: true, color: 'D92D20', size: 18 })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 }
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
                children: [
                  new TextRun({ text: 'Century Ply — Warranty Registration Web Portal Scope', size: 18, color: '666666' }),
                  new TextRun({ text: '\tPage ', size: 18, color: '666666' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '666666' })
                ],
                spacing: { before: 100 }
              })
            ]
          })
        },
        children: [
          // Cover Title
          new Paragraph({
            children: [
              new TextRun({ text: 'PROPOSAL & SCOPE OF WORK', bold: true, size: 36, color: 'D92D20' })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Landing Page & Warranty Registration Web Portal', bold: true, size: 28, color: '1D2939' })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: 'D92D20' } },
            spacing: { after: 600 }
          }),

          // Meta Info Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
              insideHorizontal: { style: BorderStyle.NONE, size: 0 },
              insideVertical: { style: BorderStyle.NONE, size: 0 }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'SUBMITTED TO:', bold: true, color: 'D92D20', size: 20 })], spacing: { after: 100 } }),
                      new Paragraph({ children: [new TextRun({ text: 'Ms. Shabana Rahman', bold: true, size: 22 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Century Plyboards (India) Ltd. (New Age Products)', size: 20 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'CENTURY HOUSE P15/1, Taratala Road', size: 18, color: '475467' })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Kolkata, West Bengal - 700088', size: 18, color: '475467' })] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'SUBMITTED BY:', bold: true, color: 'D92D20', size: 20 })], spacing: { after: 100 } }),
                      new Paragraph({ children: [new TextRun({ text: 'Ms. Monica Gupta, Director', bold: true, size: 22 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Interactive Bees Pvt. Ltd.', bold: true, size: 20 })] }),
                      new Paragraph({ children: [new TextRun({ text: '28/7 Ground Floor, Shakti Nagar, Delhi - 110007', size: 18, color: '475467' })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Ph: +91-11-47098755 | Mobile: +91-9810012148', size: 18, color: '475467' })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Web: www.interactivebees.com', size: 18, color: '475467' })] })
                    ]
                  })
                ]
              })
            ]
          }),

          // Page break after cover details
          new Paragraph({ children: [], pageBreakBefore: true }),

          // Executive Summary
          new Paragraph({
            children: [new TextRun({ text: 'I. Executive Summary', bold: true, size: 28, color: '1D2939' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Century Plyboards (India) Ltd. (CPIL) aims to position its New Age Products (PVC, WPC, and Zykron fiber cement boards) as future-ready, sustainable alternatives to traditional wood-based materials. This proposal outlines a strategic plan to build a modern, mobile-first Warranty Registration Portal and Backend Management System to drive customer trust, streamline invoice validations, and eliminate counterfeit warranty issuance.',
                size: 22
              })
            ],
            spacing: { after: 200 }
          }),

          // Project Overview
          new Paragraph({
            children: [new TextRun({ text: 'II. Project Overview & Objectives', bold: true, size: 28, color: '1D2939' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Build a modern, mobile-first Warranty Registration Portal and supporting backend dashboard.', size: 22 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Allow customers to register invoice-based warranties via OTP verification and upload invoice files.', size: 22 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Enable internal teams (Validators & Admins) to verify invoices and issue version-controlled certificates.', size: 22 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Prevent fake warranty generation through manual/semi-automated invoice validation workflows.', size: 22 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 200 }
          }),

          // Scope of Work
          new Paragraph({
            children: [new TextRun({ text: 'III. Scope of Work (Deliverables)', bold: true, size: 28, color: '1D2939' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),

          // Deliverable 1
          new Paragraph({
            children: [new TextRun({ text: '1. Public Landing Page', bold: true, size: 24, color: 'D92D20' })],
            spacing: { before: 150, after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Hero Banner: Tagline "Your Ply, Your Proof, Your Peace of Mind – Forever."', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• CTAs: "Register Warranty" and "Check Product Genuineness".', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Dealer locator, contact forms, FAQs, and trust badges.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 150 }
          }),

          // Deliverable 2
          new Paragraph({
            children: [new TextRun({ text: '2. Warranty Registration Web Portal', bold: true, size: 24, color: 'D92D20' })],
            spacing: { before: 150, after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Customer OTP Login (SMS & Email verification).', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Multi-step warranty registration form with invoice file upload (PDF/JPG/PNG).', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Automatic generation of unique Warranty Registration Number (WRN).', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 150 }
          }),

          // Deliverable 3
          new Paragraph({
            children: [new TextRun({ text: '3. Customer Self-Service Dashboard', bold: true, size: 24, color: 'D92D20' })],
            spacing: { before: 150, after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• My Warranties list with live status (Pending, Approved, Rejected).', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Download official PDF digital warranty certificates.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 150 }
          }),

          // Deliverable 4
          new Paragraph({
            children: [new TextRun({ text: '4. Backend Dashboard & Internal Modules', bold: true, size: 24, color: 'D92D20' })],
            spacing: { before: 150, after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Invoice Validation Module: Review invoice, approve/reject requests with custom notes.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Policy & Version Control: Auto-link latest active policy version to approved certificates.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• Reports & Analytics: Export monthly CSV/Excel reports filtered by dealer, city, or date.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 200 }
          }),

          // Financial Table
          new Paragraph({
            children: [new TextRun({ text: 'IV. Investment & Payment Terms', bold: true, size: 28, color: '1D2939' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: '1D2939' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Service Component', bold: true, color: 'FFFFFF', size: 20 })] })]
                  }),
                  new TableCell({
                    shading: { fill: '1D2939' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Cost (INR)', bold: true, color: 'FFFFFF', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Landing Page & Web Portal of Warranty Registration', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '₹ 1.35 Lakhs + 18% GST', bold: true, size: 20 })] })]
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Payment Milestone Schedule:', bold: true, size: 22 })],
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• 50% Advance with official Work Order.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• 25% Upon Backend Completion.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '• 25% Balance upon Final Delivery & Handover.', size: 20 })],
            numbering: { reference: 'unordered-list', level: 0 },
            spacing: { after: 200 }
          })
        ]
      }
    ]
  })

  const buffer = await Packer.toBuffer(doc)
  const outputPath = path.join(process.cwd(), 'Century_Ply_Warranty_Portal_Proposal_Scope.docx')
  fs.writeFileSync(outputPath, buffer)
  console.log(`✅ DOCX document generated successfully at: ${outputPath}`)
}

generateDocx().catch((err) => {
  console.error('Error generating DOCX:', err)
  process.exit(1)
})
