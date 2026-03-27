# 💬 ChatPulse — AI-chatbot for din bedrift

ChatPulse er en norsk SaaS-plattform som gir bedrifter en AI-drevet chatbot med live chat-støtte.

## Funksjoner

🤖 **AI-chatbot** — Tren med din kunnskapsbase, svar kunder 24/7  
💬 **Live chat** — Sømløs overgang fra AI til menneske  
📊 **Innsikt** — Se hva kundene spør om, peak-tider, ubesvarte spørsmål  
📈 **Analytics** — Samtaler, meldinger, responstid, leads  
🎯 **Leads** — Kanban-tavle for oppfølging  
🎨 **White label** — Tilpass farger, logo, velkomstmelding  
🌐 **Widget** — Embed med én kodelinje  
👥 **Team** — Inviter kollegaer med roller  
💳 **Stripe** — Abonnement med 3 planer  

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, DB, Storage, Realtime)
- **AI:** Google Gemini 2.5 Flash
- **Betalinger:** Stripe
- **Hosting:** Vercel
- **Widget:** Vanilla JS iframe (0 deps)

## Prosjektstruktur

```
src/
  app/
    (public)/      — Landing, features, pricing, privacy, terms
    (auth)/        — Login, signup, forgot/reset password
    dashboard/     — Dashboard med 11 sider
    api/           — 14 API-ruter
    widget/        — Widget iframe-side
  components/
    dashboard/     — Inbox (5 filer), leads, chatbot, settings, etc.
    widget/        — ChatWidget (6 filer), header, input, messages
    landing/       — Home, features, header, footer
    auth/          — Login, signup, Google OAuth
    onboarding/    — 4-stegs onboarding wizard
  lib/
    supabase/      — Server, client, service, broadcast
    i18n/          — Norsk + engelsk (657 nøkler)
    plans.ts       — Plandefinisjoner
    stripe.ts      — Stripe-integrasjon
    logger.ts      — Feillogging
```

## Oppsett

```bash
npm install
cp .env.example .env.local
# Fyll inn env-variabler
npm run dev
```

### Env-variabler
Se `.env.example` for komplett liste.

## Kodekvalitet

- 0 TypeScript `any`
- 0 `console.log`
- 33+ aria-attributter (accessibility)
- 3 JSON-LD structured data
- CSP, HSTS, SPF/DMARC/CAA sikkerhetshoder
- 657 i18n-nøkler (norsk + engelsk)
- Widget: responsive, unread badge, auto-link URLs

## API-ruter

| Endepunkt | Metode | Auth | Beskrivelse |
|-----------|--------|------|-------------|
| `/api/chat` | POST | Nei | AI-chat med widget |
| `/api/live-chat` | POST | Delvis | Live chat-meldinger |
| `/api/live-chat/claim` | POST | Ja | Agent tar samtale |
| `/api/live-chat/close` | POST | Ja | Lukk samtale |
| `/api/presence` | PUT/GET | Delvis | Agent online-status |
| `/api/widget-config` | GET | Nei | Widget-konfigurasjon |
| `/api/widget-session` | GET | Nei | Session-restore |
| `/api/widget-queue` | GET | Nei | Kø-posisjon |
| `/api/leads` | POST | Nei | Opprett lead |
| `/api/push-token` | POST/DEL | Ja | Push-token |
| `/api/stripe/checkout` | POST | Ja | Stripe checkout |
| `/api/stripe/webhook` | POST | Stripe | Webhook |
| `/api/cron/auto-close` | GET | Cron | Auto-lukk samtaler |
| `/api/knowledge/upload` | POST | Ja | Fil-upload |

## Lisens

Proprietær — © 2026 ChatPulse
