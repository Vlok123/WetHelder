# WetHelder Staging & Testing Workflow

## 🚀 Staging Environment

### Automatische Preview Deployments (Vercel)
Elke branch krijgt automatisch een preview URL:
- **Staging branch**: `wethelder-git-staging-vlok123.vercel.app`
- **Feature branches**: `wethelder-git-feature-name-vlok123.vercel.app`

### Workflow voor nieuwe features:

1. **Maak feature branch**:
   ```bash
   git checkout -b feature/nieuwe-functie
   ```

2. **Ontwikkel lokaal**:
   ```bash
   npm run dev
   ```

3. **Test production build lokaal**:
   ```bash
   npm run test:prod
   ```

4. **Push naar GitHub**:
   ```bash
   git push -u origin feature/nieuwe-functie
   ```
   → Krijg automatisch preview URL van Vercel

5. **Test op preview URL** (werkt zoals productie)

6. **Merge naar staging** voor uitgebreide tests:
   ```bash
   git checkout staging
   git merge feature/nieuwe-functie
   git push
   ```

7. **Merge naar main** als alles werkt:
   ```bash
   git checkout main
   git merge staging
   git push
   ```

## 🔧 Lokale Production Testing

### Snelle production test:
```bash
npm run test:prod
```
Dit bouwt en start de geoptimaliseerde versie lokaal.

### Performance vergelijking:
- **Development**: `npm run dev` (langzamer, hot reload)
- **Production lokaal**: `npm run test:prod` (sneller, zoals online)
- **Staging online**: Preview URL (snelst, echte productie omgeving)

## 🌍 Environment URLs

- **Production**: `https://wethelder.nl`
- **Staging**: `https://wethelder-git-staging-vlok123.vercel.app`
- **Feature branches**: `https://wethelder-git-[branch-name]-vlok123.vercel.app`
- **Lokaal development**: `http://localhost:3000`
- **Lokaal production**: `http://localhost:3000` (na `npm run test:prod`)

## 📝 Best Practices

1. **Altijd eerst testen op staging** voordat je naar productie gaat
2. **Gebruik feature branches** voor nieuwe functionaliteit
3. **Test lokaal met production build** voor performance issues
4. **Gebruik preview URLs** voor feedback van anderen
5. **Houd staging branch up-to-date** met main

## 🔍 Debugging

### Als staging langzamer is dan productie:
- Check of je dezelfde database gebruikt
- Vergelijk environment variables
- Test met `npm run test:prod` lokaal

### Als lokaal langzamer is:
- Gebruik `npm run test:prod` in plaats van `npm run dev`
- Check of je development tools aan hebt staan
- Vergelijk met staging URL

## 🚨 Belangrijke Notes

- **Staging gebruikt dezelfde database** als productie (tenzij anders geconfigureerd)
- **API keys zijn hetzelfde** tussen staging en productie
- **Preview URLs zijn publiek toegankelijk** maar moeilijk te raden
- **Staging branch wordt automatisch gedeployed** bij elke push 