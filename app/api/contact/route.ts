import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, organization, subject, message, type } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Alle verplichte velden moeten worden ingevuld' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Map type to Dutch labels
    const typeLabels = {
      suggestion: 'Suggestie voor verbetering',
      bug: 'Bug/technisch probleem',
      feature: 'Nieuwe functie aanvraag',
      content: 'Inhoudelijke feedback',
      general: 'Algemene vraag',
      partnership: 'Samenwerking'
    }

    // Email content
    const emailContent = `
Nieuw bericht via WetHelder Contact Formulier

Type: ${typeLabels[type as keyof typeof typeLabels] || type}
Naam: ${name}
E-mail: ${email}
${organization ? `Organisatie: ${organization}` : ''}

Onderwerp: ${subject}

Bericht:
${message}

---
Dit bericht is automatisch verzonden via het WetHelder contact formulier.
Tijd: ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}
`.trim()

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'info@calmpoint.nl',
      subject: `WetHelder: ${subject}`,
      text: emailContent,
      replyTo: email,
    })

    // Optional: Send confirmation email to user
    if (process.env.SEND_CONFIRMATION === 'true') {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Bevestiging: Uw bericht aan WetHelder',
        text: `
Beste ${name},

Bedankt voor uw bericht aan WetHelder. We hebben uw ${typeLabels[type as keyof typeof typeLabels]?.toLowerCase() || 'bericht'} over "${subject}" ontvangen.

We zullen zo spoedig mogelijk reageren op uw e-mailadres: ${email}

Met vriendelijke groet,
Het WetHelder team

---
Dit is een automatische bevestiging. Antwoord niet op deze e-mail.
        `.trim(),
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het versturen van uw bericht' },
      { status: 500 }
    )
  }
} 