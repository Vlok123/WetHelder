import { NextRequest, NextResponse } from 'next/server'

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

    // Prepare email content
    const emailSubject = `WetHelder - ${subject}`
    const emailBody = `
Nieuw contact bericht via WetHelder:

Naam: ${name}
E-mail: ${email}
Onderwerp: ${subject}

Bericht:
${message}

---
Verzonden via WetHelder Contact Form
Tijd: ${new Date().toLocaleString('nl-NL')}
    `.trim()

    // For now, we'll log the email instead of actually sending it
    // In production, you would integrate with an email service like SendGrid, Mailgun, etc.
    console.log('Contact form submission:')
    console.log('To: info@calmpoint.nl')
    console.log('Subject:', emailSubject)
    console.log('Body:', emailBody)

    // TODO: Add actual email sending logic here
    // Example with a hypothetical email service:
    // await emailService.send({
    //   to: 'info@calmpoint.nl',
    //   subject: emailSubject,
    //   text: emailBody,
    //   replyTo: email
    // })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Bericht succesvol verzonden. We nemen binnen 24 uur contact met u op.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van uw bericht' },
      { status: 500 }
    )
  }
} 