# 🔧 WetHelder Environment Setup Guide

## ✅ Build Status: SUCCESVOL!

De WetHelder applicatie build is succesvol! Hier is wat je moet weten over de environment configuratie:

## 📋 Vereiste Environment Variabelen

Maak een `.env` bestand in de root directory met de volgende variabelen:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Custom Search API Configuration
GOOGLE_API_KEY=your-google-api-key-here
GOOGLE_CSE_ID=c673920c6d21240ee

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

### 2. Google Custom Search API
- Ga naar [Google Cloud Console](https://console.cloud.google.com/)
- Maak een nieuw project aan of selecteer bestaand project
- Schakel de "Custom Search API" in
- Maak een API key aan in "Credentials"
- Ga naar [Google Custom Search Engine](https://cse.google.com/cse/)
- Maak een nieuwe search engine aan met focus op juridische sites:
  - wetten.overheid.nl
  - rechtspraak.nl
  - tuchtrecht.overheid.nl
  - boetebase.om.nl
- Kopieer de Search Engine ID (CSE ID)
- Voeg toe aan `.env`:
  ```bash
  GOOGLE_API_KEY=your-google-api-key-here
  GOOGLE_CSE_ID=c673920c6d21240ee
  ```

### 3. NextAuth Secret
Genereer een veilige secret:
```bash
openssl rand -base64 32
```
Voeg toe aan `.env`: `NEXTAUTH_SECRET=generated-secret`

### 4. Database (PostgreSQL)
Voor lokale development:
```