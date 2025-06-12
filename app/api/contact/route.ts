import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      )
    }

    // Create transporter for sending emails
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Prepare email content
    const emailSubject = `Contact formulier: ${subject}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Nieuw bericht via contact formulier
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Naam:</td>
              <td style="padding: 8px 0; color: #1f2937;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">E-mail:</td>
              <td style="padding: 8px 0; color: #1f2937;">
                <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Onderwerp:</td>
              <td style="padding: 8px 0; color: #1f2937;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Datum:</td>
              <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleString('nl-NL')}</td>
            </tr>
          </table>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #374151; margin-bottom: 10px;">Bericht:</h3>
          <div style="background-color: white; padding: 20px; border-left: 4px solid #2563eb; border-radius: 0 4px 4px 0; white-space: pre-wrap;">${message}</div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>Dit bericht is verzonden via het contact formulier op de juridische informatie website.</p>
          <p>U kunt direct reageren door te antwoorden op deze e-mail.</p>
        </div>
      </div>
    `

    const emailText = `
Nieuw bericht via contact formulier

Naam: ${name}
E-mail: ${email}
Onderwerp: ${subject}
Datum: ${new Date().toLocaleString('nl-NL')}

Bericht:
${message}

---
Verzonden via contact formulier
    `.trim()

    try {
      // Send email
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Contact Formulier" <${process.env.SMTP_USER}>`,
        to: 'info@calmpoint.nl',
        replyTo: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      })

      console.log('Contact form email sent successfully to info@calmpoint.nl')

      return NextResponse.json(
        { 
          success: true, 
          message: 'Bericht succesvol verzonden. We nemen binnen 24 uur contact met u op.' 
        },
        { status: 200 }
      )

    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      
      // Still log the form submission for manual follow-up
      console.log('Contact form submission (email failed):')
      console.log('To: info@calmpoint.nl')
      console.log('From:', email)
      console.log('Subject:', emailSubject)
      console.log('Name:', name)
      console.log('Message:', message)

      // Return success to user even if email fails, but log the issue
      return NextResponse.json(
        { 
          success: true, 
          message: 'Bericht ontvangen. We nemen zo spoedig mogelijk contact met u op.' 
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
} 