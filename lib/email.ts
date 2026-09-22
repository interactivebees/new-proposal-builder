import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    })

    console.log(`📧 Email sent to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error }
  }
}

export function generateResetEmailHtml(resetToken: string, userName: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('NEXTAUTH_URL not set'); })() : 'http://localhost:3000')}/auth/reset-password?token=${resetToken}`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          Or copy and paste this link in your browser:<br>
          <span style="color: #667eea; word-break: break-all;">${resetUrl}</span>
        </p>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; font-size: 14px;">
          <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; margin: 0;">
          This is an automated email from ${process.env.NEXT_PUBLIC_APP_NAME || 'Proposal Builder'}. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `
}

export function generateResetEmailText(resetToken: string, userName: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('NEXTAUTH_URL not set'); })() : 'http://localhost:3000')}/auth/reset-password?token=${resetToken}`
  
  return `Hello ${userName},

We received a request to reset your password.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

- ${process.env.NEXT_PUBLIC_APP_NAME || 'Proposal Builder'} Team`
}