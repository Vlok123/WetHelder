# 🔧 WetHelder Environment Setup Guide

## ✅ Build Status: SUCCESVOL!

De WetHelder applicatie build is succesvol! Hier is wat je moet weten over de environment configuratie:

## 📋 Vereiste Environment Variabelen

Maak een `.env` bestand in de root directory met de volgende variabelen:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/wethelder

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Email Configuration (voor password reset)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@wethelder.nl

# Optional: Admin Configuration
ADMIN_EMAIL=admin@wethelder.nl
```

## 🚀 Snelle Setup

### 1. OpenAI API Key
- Ga naar [OpenAI Platform](https://platform.openai.com/api-keys)
- Maak een nieuwe API key aan
- Voeg toe aan `.env`: `OPENAI_API_KEY=sk-...`

### 2. NextAuth Secret
Genereer een veilige secret:
```bash
openssl rand -base64 32
```
Voeg toe aan `.env`: `NEXTAUTH_SECRET=generated-secret`

### 3. Database (PostgreSQL)
Voor lokale development:
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb wethelder

# Add to .env
DATABASE_URL=postgresql://username:password@localhost:5432/wethelder
```

### 4. Email (Optioneel)
Voor Gmail SMTP:
- Ga naar Google Account settings
- Schakel 2-factor authenticatie in
- Genereer een App Password
- Gebruik dit als `EMAIL_SERVER_PASSWORD`

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## ⚠️ Bekende Issues & Oplossingen

### 1. Database Connection Errors
Als je database errors ziet:
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql
```

### 2. NextAuth JWT Errors
Als je JWT decryption errors ziet:
- Genereer een nieuwe `NEXTAUTH_SECRET`
- Clear browser cookies
- Restart development server

### 3. Build Warnings
De volgende warnings zijn normaal en kunnen genegeerd worden:
- `autoprefixer: Replace color-adjust to print-color-adjust`
- `Dynamic server usage` voor admin routes

## 📊 Huidige Status

✅ **Build**: Succesvol  
✅ **ESLint**: Geen errors  
✅ **TypeScript**: Geen errors  
✅ **API Routes**: Werkend  
⚠️ **Database**: Configuratie vereist  
⚠️ **Email**: Optionele configuratie  

## 🎯 Volgende Stappen

1. **Configureer je `.env` bestand** met de bovenstaande variabelen
2. **Start PostgreSQL** en maak de database aan
3. **Run `npm run dev`** om de development server te starten
4. **Test de applicatie** op http://localhost:3000

## 🆘 Hulp Nodig?

Als je problemen hebt:
1. Check of alle environment variabelen correct zijn ingesteld
2. Controleer of PostgreSQL draait
3. Kijk naar de console logs voor specifieke errors
4. Restart de development server na .env wijzigingen

De applicatie is nu klaar voor gebruik! 🚀 