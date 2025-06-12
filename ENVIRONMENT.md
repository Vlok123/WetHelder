# WetHelder Environment Configuratie

## Contact Form Setup

Voor de contact form functionaliteit zijn er twee opties:

### Optie 1: Console Logging (Standaard)
De contact form logt momenteel alle berichten naar de console. Dit is handig voor development en testing.

**Geen extra configuratie nodig** - berichten verschijnen in:
- Terminal waar `npm run dev` draait
- Server logs

### Optie 2: E-mail Integratie (Productie)
Voor productie gebruik, configureer deze environment variabelen in `.env.local`:

```bash
# E-mail configuratie
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Voor Gmail bijvoorbeeld:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@calmpoint.nl
SMTP_PASS=pqka pgcd lldj lagt
SMTP_FROM="Contact Formulier <info@calmpoint.nl>"
```

## Andere Vereiste Environment Variabelen

Zorg ervoor dat deze variabelen zijn ingesteld in `.env.local`:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/wethelder

# AI API Keys
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_AI_KEY=your-google-ai-key-here

# Search API
SERPER_API_KEY=your-serper-api-key-here
```

## Contact Form Testing

1. **Development**: Ga naar `/contact` en verstuur een test bericht
2. **Check Console**: Bekijk de terminal voor het gelogde bericht
3. **Productie**: Configureer SMTP instellingen voor echte e-mail verzending

## Server Errors Oplossen

Als je server errors ziet voor de contact form:
1. Controleer of alle vereiste environment variabelen zijn ingesteld
2. Voor e-mail: test je SMTP instellingen
3. Voor development: gebruik console logging (geen extra setup)

## Database Setup

Voor volledige functionaliteit:
1. Zorg dat PostgreSQL draait op localhost:5432
2. Maak een database genaamd `wethelder`
3. Configureer de DATABASE_URL correct

## NextAuth Setup

Voor gebruikersauthenticatie:
1. Genereer een NEXTAUTH_SECRET: `openssl rand -base64 32`
2. Configureer NEXTAUTH_URL voor je environment 

## SMTP Setup Instructions

Voor het contact formulier zijn SMTP instellingen vereist om emails naar info@calmpoint.nl te versturen.

### Voor Gmail (info@calmpoint.nl):

1. **App-wachtwoord al geconfigureerd**: Het app-wachtwoord `pqka pgcd lldj lagt` is al beschikbaar
2. **SMTP instellingen**: 
   - Host: smtp.gmail.com
   - Port: 587 (STARTTLS)
   - Security: STARTTLS enabled
3. **Email configuratie**:
   - Van: info@calmpoint.nl
   - Naar: info@calmpoint.nl (contact formulier berichten)
   - Reply-to: Het email adres van de afzender

### Contact Form Flow:
1. Gebruiker vult contact formulier in
2. Email wordt verzonden naar info@calmpoint.nl
3. Reply-To is ingesteld op afzender's email
4. Professionele HTML email template wordt gebruikt
5. Fallback naar console logging als email faalt

## Testing de SMTP Configuratie

Om te testen of emails correct worden verzonden:

1. Voeg de SMTP variabelen toe aan je `.env.local`
2. Start de development server: `npm run dev`
3. Ga naar `/contact`
4. Vul het formulier in en verstuur
5. Check de terminal voor log berichten
6. Check info@calmpoint.nl inbox

## Productie Deployment

Voor productie omgevingen:
- Gebruik dezelfde SMTP instellingen
- Voeg alle environment variabelen toe aan je hosting platform
- Test email functionaliteit na deployment
- Monitor email delivery logs

## Security Notes

1. Gebruik nooit echte passwords in development
2. Genereer een sterke `NEXTAUTH_SECRET` met: `openssl rand -base64 32`
3. Voor Gmail: gebruik App Passwords in plaats van account password
4. Voor productie: gebruik environment variables via je hosting provider

## Optional Variables

```bash
# Analytics
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Error Tracking
SENTRY_DSN=your-sentry-dsn-here
``` 