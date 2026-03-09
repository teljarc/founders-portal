# Teljarc Founders Portal — CLAUDE.md

Drifts- och underhållsdokument för Claude Code.
Uppdateras vid större arkitekturförändringar eller nya features.

---

## Projekt

**Namn:** Teljarc Founders Portal
**Live:** https://teljarc.telehagen.se
**Repo:** https://github.com/teljarc/founders-portal
**Supabase:** projekt "founders-portal" under teljarc-organisationen
**Vercel:** under magtel82s-projects (auto-deploy från main)

---

## Tech stack

| Lager | Val |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Språk | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| Realtime | Supabase Realtime (postgres_changes) |
| Push | Web Push API + VAPID (web-push npm) |
| PWA | manifest.json + Service Worker (/public/sw.js) |
| Deploy | Vercel (auto från GitHub main) |

---

## Användare

| Namn | Email | Roll |
|---|---|---|
| Magnus | magnus.telehagen@gmail.com | founder |
| John | john@jaspen.se | founder |

Gäster skapas via `/vote/login` (self-registration med role: guest).

---

## Arkitektur

### Routing
- `/` — tom, redirectas av proxy till login
- `/login` — founder-inloggning
- `/dashboard/*` — skyddad av proxy.ts, kräver founder-roll
- `/vote/login` — gäst-inloggning (self-registration)
- `/vote/ideas` — gästportal, kräver inloggning
- `/vote/ideas/[id]` — gästdetalj med stjärnröstning

### Auth & roller
- Roller sätts i `raw_user_meta_data.role` (`founder` | `guest`)
- `proxy.ts` (f.d. middleware.ts) hanterar redirect-logik
- Founders default till `founder` om role saknas (se middleware)

### Notifikationer
- `lib/push/notify.ts` — server action
- `notifyOtherFounders()` hämtar alla founders via admin-API (`lib/supabase/admin.ts`)
- Skapar alltid in-app-notifikation oavsett push-subscription
- Push skickas separat endast om subscription finns

### Supabase-klienter
- `lib/supabase/client.ts` — browser-klient
- `lib/supabase/server.ts` — server-klient (cookies)
- `lib/supabase/admin.ts` — admin-klient (service role key, server-only)

---

## Databas (tabeller)

| Tabell | Beskrivning |
|---|---|
| `ideas` | Idéer skapade av founders |
| `votes` | Founder-röster (must_build/interesting/maybe/skip) |
| `comments` | Founder-kommentarer med threading (parent_id) |
| `notifications` | In-app notifikationer |
| `push_subscriptions` | VAPID push-subscriptions per användare |
| `projects` | Byggda/pågående projekt |
| `context_files` | CLAUDE.md, MEMORY.md, TODO.md, IDEAS.md (slug-baserat) |
| `published_ideas` | Idéer publicerade för gäströstning |
| `guest_votes` | Gästers stjärnröster (1–5) |
| `guest_comments` | Gästers kommentarer |

Alla tabeller har RLS aktiverat. Se `supabase-schema.sql` för policies.

---

## Miljövariabler (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        ← används av admin.ts och notify.ts
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_EMAIL
```

---

## Viktiga konventioner

- **Server Components** hämtar data, renderar `*Client.tsx`-komponenter
- **Client Components** hanterar realtime, state, interaktion
- `getUserColor(name)` definieras lokalt i flera komponenter — Magnus=#a8d8a8, John=#a8c8f0
- Formulär (AddIdeaForm, AddProjectForm) renderar inline med `w-full` när öppna
- Alla sidor är på svenska

---

## Design

- Mörkt tema, monospace-typografi (Courier New), serif-rubriker (Georgia)
- Grid-textur i bakgrunden (globals.css)
- Färgkodade användarbadges
- Gästportalen har ljust tema (slate-färger, rounded corners)
- Mobile-first: `sm:` breakpoint för de flesta responsiva justeringar

---

## Deployment-flöde

1. Gör ändringar lokalt
2. `npm run build` — verifiera att bygget är rent
3. `git commit` + `git push origin main`
4. Vercel deployas automatiskt (~1 min)

---

## Context Editor

Founders kan redigera CLAUDE.md, MEMORY.md, TODO.md och IDEAS.md
direkt i dashboarden under fliken **Context**. Innehållet lagras i
Supabase-tabellen `context_files`. Detta är den delade kanalen för
löpande projektdokumentation.
