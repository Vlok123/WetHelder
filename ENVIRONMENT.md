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
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
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