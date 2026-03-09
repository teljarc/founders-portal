# Teljarc — Founders Portal

Privat internt verktyg för två grundare (Magnus och John) att samla idéer, katalogisera projekt, diskutera och rösta fram nästa satsning.

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- React 19
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Realtime)
- Lucide React + Sonner
- Web Push API

## Setup

1. **Klona repo**

2. **Skapa Supabase-projekt**
   - Kör `supabase-schema.sql` i SQL Editor

3. **Generera VAPID-nycklar**
   ```bash
   npx web-push generate-vapid-keys
   ```

4. **Konfigurera miljövariabler**
   ```bash
   cp .env.local.example .env.local
   # Fyll i alla värden
   ```

5. **Installera och starta**
   ```bash
   npm install
   npm run dev
   ```

6. **Skapa användare** manuellt i Supabase Auth dashboard
   - Sätt `name` och `role: 'founder'` i user metadata

7. **Deploy till Vercel**
   - Lägg till custom domain `teljarc.telehagen.se`
   - Peka DNS dit

## Struktur

- `/dashboard` — Founders-portal (idéer, projekt, pipeline, context, notifikationer)
- `/vote` — Gästportal (rösta och kommentera på publicerade idéer)
