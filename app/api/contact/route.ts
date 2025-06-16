import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// E-mail configuratie - Direct configuration for info@calmpoint.nl
const createTransporter = () => {
  // Hardcoded SMTP configuration for immediate fix
  const SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'info@calmpoint.nl',
      pass: 'pqka pgcd lldj lagt'
    }
  }
  
  try {
    const transporter = nodemailer.createTransport(SMTP_CONFIG)
    console.log('✅ SMTP Transporter created successfully for info@calmpoint.nl')
    return transporter
  } catch (error) {
    console.error('❌ SMTP Transporter creation failed:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, type } = await request.json()

    // Validatie
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Alle verplichte velden moeten worden ingevuld.' },
        { status: 400 }
      )
    }

    // E-mail validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Voer een geldig e-mailadres in.' },
        { status: 400 }
      )
    }

    // Transporter aanmaken
    const transporter = createTransporter()

    // E-mail content
    const typeLabels: { [key: string]: string } = {
      vraag: 'Vraag',
      suggestie: 'Suggestie',
      feedback: 'Feedback',
      bug: 'Bug melding',
      anders: 'Anders'
    }

    // Log het bericht voor nu (later vervangen door echte e-mail)
    const contactMessage = {
      timestamp: new Date().toISOString(),
      name,
      email,
      type: typeLabels[type] || type,
      subject,
      message,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }

    console.log('📧 Nieuw contactbericht ontvangen:', contactMessage)

    // Als SMTP is geconfigureerd, verstuur e-mail
    if (transporter) {
      const mailOptions = {
        from: 'info@calmpoint.nl',
        to: 'info@calmpoint.nl',
        replyTo: email, // Reply-to is set to the sender's email
        subject: `WetHelder Contact: ${typeLabels[type] || 'Bericht'} - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              Nieuw contactbericht van WetHelder
            </h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Contactgegevens</h3>
              <p><strong>Naam:</strong> ${name}</p>
              <p><strong>E-mail:</strong> ${email}</p>
              <p><strong>Type bericht:</strong> ${typeLabels[type] || type}</p>
              <p><strong>Onderwerp:</strong> ${subject}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151;">Bericht</h3>
              <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p>Dit bericht is verzonden via het contactformulier op WetHelder.nl</p>
              <p>Verzonden op: ${new Date().toLocaleString('nl-NL')}</p>
            </div>
          </div>
        `,
        text: `
Nieuw contactbericht van WetHelder

Contactgegevens:
Naam: ${name}
E-mail: ${email}
Type bericht: ${typeLabels[type] || type}
Onderwerp: ${subject}

Bericht:
${message}

---
Dit bericht is verzonden via het contactformulier op WetHelder.nl
Verzonden op: ${new Date().toLocaleString('nl-NL')}
        `
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log('✅ E-mail succesvol verzonden naar: info@calmpoint.nl')
        console.log('📧 Email details:', {
          from: 'info@calmpoint.nl',
          to: 'info@calmpoint.nl',
          replyTo: email,
          subject: `WetHelder Contact: ${typeLabels[type] || 'Bericht'} - ${subject}`
        })
      } catch (emailError) {
        console.error('❌ Fout bij verzenden e-mail:', emailError)
        // For debugging, log the full error
        if (emailError instanceof Error) {
          console.error('❌ Email error details:', {
            message: emailError.message,
            stack: emailError.stack
          })
        }
        return NextResponse.json(
          { error: 'Er is een fout opgetreden bij het verzenden van de e-mail. Het bericht is wel gelogd.' },
          { status: 500 }
        )
      }
    } else {
      console.log('⚠️ SMTP transporter creation failed - bericht alleen gelogd')
      return NextResponse.json(
        { error: 'E-mail service is momenteel niet beschikbaar. Probeer het later opnieuw of neem direct contact op.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Bericht succesvol verzonden!' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending contact email:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van het bericht.' },
      { status: 500 }
    )
  }
} 