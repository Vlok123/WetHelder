# WetHelder - Nederlandse Juridische Platform

WetHelder is een Nederlandse juridische zoektool die uitsluitend werkt met officiële bronnen van de Nederlandse overheid.

## 🏛️ KRITISCHE BASIS DOCUMENTATIE

⚠️ **BELANGRIJK**: De absolute kern van dit platform staat gedocumenteerd in:

- **`JURIDISCHE_BASIS_PROMPT.md`** - De foundation prompt die NOOIT mag worden gewijzigd
- **`JURIDISCHE_RICHTLIJNEN.md`** - Implementatie richtlijnen en BETA disclaimers

Deze documenten vormen de juridische basis van het hele platform en moeten altijd bewaard blijven.

## 📚 Officiële Bronnen

Het platform werkt uitsluitend met deze officiële Nederlandse bronnen:
- Wettenbank (wetten.overheid.nl)
- Rechtspraak (uitspraken.rechtspraak.nl) 
- EUR-Lex (eur-lex.europa.eu)
- Officiële Bekendmakingen (officielebekendmakingen.nl)
- Lokale Regelgeving (lokaleregelgeving.overheid.nl)
- Parlementaire documenten (TK open data)
- Data Overheid (data.overheid.nl)
- Tuchtrecht (tuchtrecht.overheid.nl)

## 🚀 Features

- **Juridische Q&A** - Vragen beantwoorden op basis van Nederlandse wetgeving
- **Wet & Uitleg** - Uitleg van specifieke wetsartikelen en regelgeving
- **BETA Disclaimers** - Duidelijke waarschuwingen dat informatie fouten kan bevatten
- **Bronverwijzingen** - Alle antwoorden met specifieke artikelnummers en ECLI-codes

## ⚠️ BETA Status

Dit platform is in BETA. Alle antwoorden bevatten verplichte disclaimers over mogelijke fouten en verwijzingen naar officiële bronnen voor verificatie.

## 🔧 Technische Stack

- Next.js 14 met App Router
- TypeScript
- Prisma ORM
- NextAuth.js voor authenticatie
- DeepSeek API met strenge juridische prompts
- Tailwind CSS voor styling

## 📋 Development

```bash
npm install
npm run dev
```

## 🚨 Belangrijk voor Developers

Bij elke wijziging aan prompts of juridische functionaliteit:
1. Controleer `JURIDISCHE_BASIS_PROMPT.md` 
2. Zorg dat alle wijzigingen consistent zijn met de basis
3. Test dat BETA disclaimers aanwezig blijven
4. Verifieer dat alleen officiële bronnen worden gebruikt

---

**Juridische Basis**: Zie `JURIDISCHE_BASIS_PROMPT.md` voor de volledige foundation van dit platform.

## Functionaliteiten

- ✅ Juridische vraaginterface voor Nederlandse wetgeving
- ✅ Streaming antwoorden met bronverwijzingen
- ✅ Email authenticatie met magic links
- ✅ Admin dashboard voor query logs
- ✅ Dark mode ondersteuning
- ✅ Mobile-first responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Neon PostgreSQL
- **Auth**: NextAuth.js
- **API**: DeepSeek API
- **Deployment**: Vercel

## Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd wethelder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Maak een `.env` bestand aan met:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wethelder"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Email Configuration (voor magic links)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@wethelder.nl"

# DeepSeek API
DEEPSEEK_API_KEY="sk-your-deepseek-api-key"
```

### 4. Database Setup

```bash
# Genereer Prisma client
npm run db:generate

# Push schema naar database
npm run db:push
```

### 5. Development Server

```bash
npm run dev
```

Bezoek [http://localhost:3000](http://localhost:3000)

## Deployment naar Vercel

### 1. Vercel CLI Setup

```bash
npm i -g vercel
vercel login
```

### 2. Database Setup (Neon)

1. Ga naar [neon.tech](https://neon.tech)
2. Maak een nieuw project aan
3. Kopieer de connection string
4. Voeg toe aan Vercel environment variables

### 3. Deploy

```bash
vercel --prod
```

### 4. Environment Variables in Vercel

Voeg de volgende environment variables toe in je Vercel dashboard:

- `DATABASE_URL`
- `NEXTAUTH_URL` (je productie URL)
- `NEXTAUTH_SECRET`
- `EMAIL_SERVER_*`
- `DEEPSEEK_API_KEY`

### 5. Database Schema Deploy

Na de eerste deploy:

```bash
vercel env pull .env.local
npm run db:push
```

## Admin Access

Om admin toegang te krijgen:

1. Registreer met je email via de login
2. Ga naar je database (bijv. via Prisma Studio)
3. Zet `isAdmin` op `true` voor je user record

```bash
npm run db:studio
```

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── ask/               # Juridische vraag interface  
│   ├── dashboard/         # Admin dashboard
│   └── api/
│       └── ask/           # DeepSeek API integration
├── components/            # React componenten
├── lib/                   # Utility functies
└── prisma/               # Database schema
```

## API Endpoints

- `POST /api/ask` - Submit question, get streaming AI response
- `GET|POST /api/auth/*` - NextAuth endpoints

## Features

### AI Chat
- Streaming responses via Server-Sent Events
- Nederlandse wetgeving expertise  
- Automatische bronverwijzingen
- Query logging naar database

### Authentication
- Magic link email authentication
- Session management
- Admin role support

### Admin Dashboard
- Query statistics
- Recent questions overview
- User activity monitoring

## Environment Variables

| Variable | Beschrijving | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Base URL voor NextAuth | ✅ |
| `NEXTAUTH_SECRET` | JWT signing secret | ✅ |
| `EMAIL_SERVER_*` | SMTP configuratie voor magic links | ✅ |
| `DEEPSEEK_API_KEY` | DeepSeek API key | ✅ |

## License

MIT 