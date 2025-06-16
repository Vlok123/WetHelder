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

# OAuth Providers (Google OAuth CONFIGURED)
GOOGLE_CLIENT_ID=1048447585708-a299qofj0iij9dq8k2e5sc3bvgt3eau3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=1048447585708-a299qofj0iij9dq8k2e5sc3bvgt3eau3.apps.googleusercontent.com

# Facebook OAuth (TEMPORARILY DISABLED)
# FACEBOOK_CLIENT_ID=your-facebook-app-id
# FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

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

### 4. OAuth Providers Setup

#### Google OAuth
1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Selecteer je project of maak een nieuw project aan
3. Ga naar "APIs & Services" → "Credentials"
4. Klik "Create credentials" → "OAuth 2.0 Client IDs"
5. Selecteer "Web application"
6. Voeg toe bij "Authorized redirect URIs":
   - Voor development: `http://localhost:3000/api/auth/callback/google`
   - Voor productie: `https://yourdomain.com/api/auth/callback/google`
7. Kopieer de Client ID en Client Secret
8. Voeg toe aan `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   ```

#### Facebook OAuth (TIJDELIJK UITGESCHAKELD)
Facebook OAuth is momenteel uitgeschakeld. Alleen Google OAuth is actief.

<!-- Facebook setup instructies (uitgeschakeld):
1. Ga naar [Facebook Developers](https://developers.facebook.com/)
2. Maak een nieuwe app aan of selecteer bestaande app
3. Ga naar "Settings" → "Basic"
4. Kopieer App ID en App Secret
5. Ga naar "Facebook Login" → "Settings"
6. Voeg toe bij "Valid OAuth Redirect URIs":
   - Voor development: `http://localhost:3000/api/auth/callback/facebook`
   - Voor productie: `https://yourdomain.com/api/auth/callback/facebook`
7. Voeg toe aan `.env`:
   ```bash
   FACEBOOK_CLIENT_ID=your-facebook-app-id
   FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
   ```
-->

### 5. Database (PostgreSQL)
Voor lokale development:
```