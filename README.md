# WetHelder - Nederlandse Juridische Platform

WetHelder is een Nederlandse juridische zoektool die uitsluitend werkt met officiële bronnen van de Nederlandse overheid.

## 🏛️ KRITISCHE BASIS DOCUMENTATIE

⚠️ **BELANGRIJK**: De absolute kern van dit platform staat gedocumenteerd in:

- **`JURIDISCHE_BASIS_PROMPT.md`** - De foundation prompt die NOOIT mag worden gewijzigd
- **`JURIDISCHE_RICHTLIJNEN.md`** - Implementatie richtlijnen en BETA disclaimers

Deze documenten vormen de juridische basis van het hele platform en moeten altijd bewaard blijven.

## 📚 Officiële Bronnen Integratie

Het platform implementeert nu volledige integratie met officiële Nederlandse juridische bronnen:

### ✅ **Geïmplementeerde Bronnen:**
- **Wettenbank** (wetten.overheid.nl) - Basiswettenbestand en zoekfunctie
- **Rechtspraak** (uitspraken.rechtspraak.nl) - ECLI feed en jurisprudentie
- **KOOP Zoekdienst** (officielebekendmakingen.nl) - Staatsblad en Kamerstukken
- **Tuchtrecht** (tuchtrecht.overheid.nl) - Tuchtrechtelijke uitspraken
- **Tweede Kamer** (api.tweedekamer.nl) - GraphQL API voor parlementaire stukken

### 🔄 **Automatische Data Ingestie:**
- **Dagelijkse sync** om 03:00 CET via Vercel Cron
- **Vector embeddings** voor semantische zoekfunctionaliteit
- **Rate limiting** en **caching** voor API bescherming
- **Logging** van alle ingestie processen

### 🔍 **RAG (Retrieval-Augmented Generation):**
- **PostgreSQL** database met full-text search
- **OpenAI embeddings** (text-embedding-3-small)
- **Semantic search** door juridische documenten
- **Bronverwijzingen** met exacte artikelnummers en ECLI-codes

## 🚀 Features

- **Juridische Q&A** - Vragen beantwoorden op basis van Nederlandse wetgeving
- **Wet & Uitleg** - Uitleg van specifieke wetsartikelen en regelgeving
- **BETA Disclaimers** - Duidelijke waarschuwingen dat informatie fouten kan bevatten
- **Bronverwijzingen** - Alle antwoorden met specifieke artikelnummers en ECLI-codes
- **Officiële Bronnen** - Automatische integratie met alle Nederlandse juridische databases
- **Vector Search** - Semantische zoekfunctionaliteit door juridische documenten

## ⚠️ BETA Status

Dit platform is in BETA. Alle antwoorden bevatten verplichte disclaimers over mogelijke fouten en verwijzingen naar officiële bronnen voor verificatie.

## 🔧 Technische Stack

- Next.js 14 met App Router
- TypeScript
- Prisma ORM met PostgreSQL
- NextAuth.js voor authenticatie
- OpenAI API met strenge juridische prompts
- Vector embeddings voor RAG
- Tailwind CSS voor styling

## 📋 Development

```bash
npm install
npm run dev
```

## 🗄️ Database Setup

### 1. PostgreSQL Database
```bash
# Genereer Prisma client
npm run db:generate

# Push schema naar database (inclusief nieuwe juridische modellen)
npm run db:push
```

### 2. Data Ingestie Testen
```bash
# Test alle bronnen
npm run ingest:test

# Test specifieke bronnen
npm run ingest:wettenbank
npm run ingest:koop
npm run ingest:rechtspraak

# Test zoekfunctionaliteit
npm run search:test -- --search="artikel 300 sr"

# Volledige sync (admin only)
npm run ingest:all
```

## 🔄 Data Ingestie API

### Admin Endpoints:
```bash
# Status check
GET /api/ingest

# Start ingestie
POST /api/ingest
{
  "source": "wettenbank|koop|rechtspraak|tweedekamer|all",
  "type": "incremental|full_sync"
}

# Test search
PUT /api/ingest
{
  "query": "artikel 300 sr"
}
```

## 🚨 Belangrijk voor Developers

Bij elke wijziging aan prompts of juridische functionaliteit:
1. Controleer `JURIDISCHE_BASIS_PROMPT.md` 
2. Zorg dat alle wijzigingen consistent zijn met de basis
3. Test dat BETA disclaimers aanwezig blijven
4. Verifieer dat alleen officiële bronnen worden gebruikt
5. **Test data ingestie** na database wijzigingen

---

**Juridische Basis**: Zie `JURIDISCHE_BASIS_PROMPT.md` voor de volledige foundation van dit platform.

## Functionaliteiten

- ✅ Juridische vraaginterface voor Nederlandse wetgeving
- ✅ Streaming antwoorden met bronverwijzingen
- ✅ Email authenticatie met magic links
- ✅ Admin dashboard voor query logs
- ✅ Dark mode ondersteuning
- ✅ Mobile-first responsive design
- ✅ **Officiële bronnen integratie met RAG**
- ✅ **Vector search door juridische documenten**
- ✅ **Automatische data ingestie en updates**

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL met Prisma ORM
- **Vector Search**: OpenAI Embeddings + PostgreSQL
- **Auth**: NextAuth.js
- **API**: OpenAI GPT-4o met juridische prompts
- **Data Sources**: Wettenbank, Rechtspraak, KOOP, Tweede Kamer
- **Deployment**: Vercel met Cron Jobs

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

# OpenAI API (voor embeddings en chat)
OPENAI_API_KEY="sk-your-openai-api-key"
```

### 4. Database Setup

```bash
# Genereer Prisma client
npm run db:generate

# Push schema naar database
npm run db:push

# Test data ingestie
npm run ingest:test
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
- `OPENAI_API_KEY`

### 5. Database Schema Deploy

Na de eerste deploy:

```bash
vercel env pull .env.local
npm run db:push
```

### 6. Data Ingestie Setup

Na deployment wordt automatisch elke nacht om 03:00 CET een data sync uitgevoerd via Vercel Cron Jobs.

## Admin Access

Om admin toegang te krijgen:

1. Registreer met je email via de login
2. Ga naar je database (bijv. via Prisma Studio)
3. Zet `role` op `ADMIN` voor je user record

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
│       ├── ask/           # OpenAI API integration
│       └── ingest/        # Data ingestie API
├── components/            # React componenten
├── lib/                   # Utility functies
│   ├── officialSources.ts # Officiële bronnen integratie
│   └── prisma.ts         # Database client
├── prisma/               # Database schema
│   └── schema.prisma     # Inclusief juridische modellen
└── scripts/              # Data ingestie scripts
    └── ingest-test.js    # Test script voor bronnen
```

## API Endpoints

- `POST /api/ask` - Submit question, get streaming AI response with official sources
- `GET|POST|PUT /api/ingest` - Data ingestie management (admin only)
- `GET|POST /api/auth/*` - NextAuth endpoints

## Features

### AI Chat met Officiële Bronnen
- Streaming responses via Server-Sent Events
- Nederlandse wetgeving expertise met RAG
- Automatische bronverwijzingen naar officiële documenten
- Query logging naar database
- Vector search door juridische documenten

### Data Ingestie Systeem
- Automatische sync met Wettenbank, Rechtspraak, KOOP
- Vector embeddings voor semantische zoekfunctionaliteit
- Rate limiting en caching voor API bescherming
- Comprehensive logging van alle processen

### Authentication
- Magic link email authentication
- Session management
- Admin role support

### Admin Dashboard
- Query statistics
- Recent questions overview
- User activity monitoring
- Data ingestie status en controle

## Environment Variables

| Variable | Beschrijving | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Base URL voor NextAuth | ✅ |
| `NEXTAUTH_SECRET` | JWT signing secret | ✅ |
| `EMAIL_SERVER_*` | SMTP configuratie voor magic links | ✅ |
| `OPENAI_API_KEY` | OpenAI API key voor embeddings en chat | ✅ |

## Officiële Bronnen Architectuur

```mermaid
flowchart TD
  subgraph Ingestie
    A1[Wettenbank<br/>Basiswettenbestand] --> P(Database)
    A2[KOOP Zoekdienst<br/>Staatsblad / Kamerstukken] --> P
    A3[Rechtspraak<br/>ECLI-feed] --> P
    A4[Tweede Kamer<br/>GraphQL] --> P
  end
  P[(PostgreSQL + Embeddings)] --> V[Vector Search]
  V -->|searchOfficialSources()| S((API /ask))
  S --> O(OpenAI GPT-4o)
  C[Client / Chat-UI] --> S
```

## License

MIT 