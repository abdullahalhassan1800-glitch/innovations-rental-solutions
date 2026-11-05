# Innovations Rental Solutions

A production-shaped real-estate discovery platform for **resort housing, commercial spaces, service apartments and residential properties** across Delhi NCR and select Indian destinations.

Innovations Rental Solutions combines a database-driven public website, a cinematic dark-marketing front end, lead capture, customer accounts, an administrator workspace and a multilingual, database-grounded AI assistant in one Next.js application.

> **Demonstration notice**
>
> Every project, developer, price, image, approval and RERA reference in the seeded data is **sample content for illustration only**. Nothing in this repository is a live listing, an offer, a verified approval or a claim about a real developer. The public site displays this disclaimer site-wide, and projects are stored with `isDemo = true`. Replace the seed data with verified inventory before any real launch.

---

## Contents

- [Feature overview](#feature-overview)
- [Technology](#technology)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Demo accounts](#demo-accounts)
- [Routes](#routes)
- [Admin workspace](#admin-workspace)
- [AI assistant and voice](#ai-assistant-and-voice)
- [Search, filters and SEO](#search-filters-and-seo)
- [Security model](#security-model)
- [Testing](#testing)
- [Build and production start](#build-and-production-start)
- [Deployment notes](#deployment-notes)
- [Demo limitations and remaining tasks](#demo-limitations-and-remaining-tasks)
- [License](#license)

---

## Feature overview

### Public website

- Cinematic dark visual system: near-black surfaces, a warm gold accent, Poppins typography, large uppercase display headings, glass stat bars, diagonal marquee ribbons and restrained motion.
- Full-screen hero with an optional video layer (`public/videos/hero.mp4`) and a poster fallback, plus a two-step private-enquiry modal.
- Home page with a spotlight collection, four asset-class collections, an illustrative investment snapshot, featured projects, new launches, locations, process, testimonials, FAQs, a search band and a callback form.
- Full project listing with server-side filtering by:
  - location
  - budget / starting price
  - property type
  - configuration (BHK)
  - project status
  - possession timeline
  - amenities
  - developer
  - free-text search
- Sorting, pagination, active-filter chips, clear-all recovery and URL-driven state (shareable links, back/forward support).
- Location landing pages for Noida, Greater Noida, Noida Extension and Delhi NCR that reuse the full listing experience with a locked location.
- Dedicated residential, commercial, resort housing and service apartment collections with locked scopes.
- Project detail page with:
  - hero, status and demo labels
  - image gallery with keyboard navigation and lightbox
  - overview, pricing and configuration table
  - amenities, floor plans and brochure download
  - map embed, address and nearby landmarks
  - developer context
  - similar projects
  - per-project FAQs
  - callback and site-visit forms
  - WhatsApp and phone CTAs
  - structured data for search engines
- Project comparison for up to three projects.
- Custom 404, error and global error pages.
- Site-wide demo disclaimer, privacy policy, terms and FAQ pages.

### Customers

- Registration, login, logout and seven-day HTTP-only JWT sessions.
- Password hashing with bcrypt.
- Private dashboard with:
  - overview
  - saved projects / favourites
  - inquiry history
  - site-visit history
  - profile update
  - password change
- Save/unsave projects from cards and detail pages.
- Lead and site-visit forms with server-side Zod validation, phone normalisation, consent checks, honeypots, duplicate prevention and loading/success/error states.
- Customer data is only exposed inside authenticated account/admin pages.

### Administrators and agents

- Role-protected `/admin` workspace with server-enforced access.
- Analytics overview for projects, leads, visits and users.
- Project CRUD, publish/unpublish and archive.
- Project media, amenities, floor plans, brochure, map, landmarks and SEO fields.
- Developer, location, amenity, FAQ and testimonial management.
- User management with role and active-state controls and guarded password resets.
- Lead pipeline with status and assignment controls, private-data warning and an audit-note trail.
- Site-visit pipeline with status updates and cancellation confirmation.
- Upload validation, image management and S3-compatible or local storage adapters.
- Toasts, confirmations, empty states and pagination throughout.

### AI assistant

- Floating assistant available on public pages.
- Understands **English, Hindi (Devanagari) and Hinglish**.
- Searches the live project database for matches.
- Compares two or three projects in a fact table.
- Returns project cards with links, prices and CTAs.
- Supports follow-up questions and starter suggestions.
- Never invents projects, prices or approvals: project facts always come from the database.
- Optional OpenAI-compatible provider only for intent parsing; the assistant works without any API key.
- Browser voice input with Speech Recognition and spoken replies with Speech Synthesis.
- Graceful text-only fallback when speech APIs are unavailable or microphone permission is denied.
- Dialogue is opened from the floating **Ask Innovations AI** control with an accessible two-panel modal.

---

## Technology

| Layer | Choice |
| --- | --- |
| Framework | Next.js `15.5.28` App Router |
| UI | React 19, TypeScript, Tailwind CSS 3.4, lucide-react |
| Database | Prisma `6.19.3` + SQLite (portable to PostgreSQL) |
| Validation | Zod |
| Auth | Custom JWT sessions (`jose`) in HTTP-only cookies, bcryptjs passwords |
| AI | Deterministic rules engine + optional OpenAI-compatible intent provider |
| Storage | Local filesystem adapter or AWS S3-compatible adapter |
| Tests | `node --test` unit tests, Playwright E2E, API smoke script |
| PDF | Generated demo brochure PDFs |

There is no separate backend service. Server Components, Route Handlers and Prisma form the backend inside the Next.js application.

---

## Architecture

```text
Browser
  │
  ├── Public pages (React Server Components)
  │      └── Prisma queries ──► SQLite / PostgreSQL
  │
  ├── Client forms and dialogs
  │      └── /api/* Route Handlers
  │             ├── Zod validation
  │             ├── rate limiting
  │             ├── auth + role checks
  │             └── Prisma
  │
  ├── Dashboard (authenticated customer)
  │      └── server-side requireUser()
  │
  └── Admin (ADMIN role only)
         ├── middleware.ts JWT gate
         ├── layout-level requireAdmin()
         └── management APIs
```

Key decisions:

- **Server-first rendering.** Listings and detail pages are rendered on the server from the database; filters live in the URL.
- **Defence in depth for admin.** `middleware.ts` rejects unauthenticated or non-admin traffic, and every admin page/API repeats the role check on the server.
- **Provider abstraction for AI.** The rules engine is the default. If an AI key is configured, the provider is used only to extract search intent; project facts are re-read from the database afterwards.
- **Storage adapter.** Local uploads are written outside `public/` and served through `/media/[...path]`, so uploads work after `next build` without a rebuild. S3 can be enabled with environment variables.
- **Portable schema.** Status fields are strings rather than database enums so the same schema can move between SQLite and PostgreSQL.

---

## Project structure

```text
app/
  (public)/                 Public pages and layouts
    page.tsx                Home
    projects/               Listing + project detail
    residential/            Residential collection
    commercial/             Commercial collection
    resort-housing/         Resort housing collection
    service-apartments/     Service apartment collection
    location/[slug]/        Location landing pages
    about, contact, faq, compare, privacy-policy, terms
    login, register
  dashboard/                Customer account area
  admin/                    Admin workspace
  api/                      Route handlers (auth, leads, visits, saved, AI, admin)
  media/[...path]/          Local upload serving route
  sitemap.ts, robots.ts     SEO endpoints
  error.tsx, not-found.tsx
components/
  ui/                       Design-system primitives
  layout/                   Header, footer and enquiry modal
  home/                     Hero media and marquee ribbons
  projects/                 Cards, filters, gallery, comparison
  forms/                    Lead, site-visit, auth and profile forms
  dashboard/                Dashboard navigation and logout
  admin/                    Admin managers and project editor
  ai/                       Assistant chat, cards, voice controls
lib/
  db.ts                     Prisma singleton
  auth.ts                   JWT sessions, password helpers, requireUser/requireAdmin
  validation.ts             Zod schemas
  queries.ts                Public project/search queries
  search-params.ts          URL filter parsing
  admin-projects.ts         Project create/update mapping and RERA/brochure rules
  account.ts                Customer dashboard queries
  api.ts                    JSON, origin checks, client IP, error mapping
  rate-limit.ts             In-memory fixed-window limiter
  pdf.ts                    Demo brochure generation
  storage/                  Local and S3 storage adapters
  ai/                       Intent parsing, optional provider, grounded assistant
prisma/
  schema.prisma             Data model
  seed.mjs                  Demo data (21 projects, 4 locations, 6 developers)
  dev.db                    Local SQLite database (ignored by git)
public/images/              Demo property and location imagery
storage/uploads/            Local uploaded media (ignored by git)
tests/
  unit/                     Node unit tests
  e2e/                      Playwright specs and API smoke script
middleware.ts               Dashboard/admin JWT gate
```

---

## Data model

Main Prisma models:

- `User` — customer, agent or administrator; hashed password; active flag.
- `Developer` — fictional developer profiles.
- `Location` — Noida, Greater Noida, Noida Extension, Delhi NCR.
- `Amenity` — shared amenity dictionary.
- `Project` — listing facts, pricing, configurations, status, possession, map, landmarks, SEO, publish/archive state and `isDemo`.
- `ProjectImage` — ordered gallery images with alt text.
- `FloorPlan` — plan name, BHK, area, image URL.
- `Brochure` — stored or generated brochure.
- `SavedProject` — customer favourites.
- `Inquiry` — lead with contact details, source, type, status, assignment and notes.
- `LeadNote` — admin audit trail for a lead.
- `SiteVisit` — requested visit date, slot, status and optional customer/project links.
- `Faq` — global or per-project FAQs.
- `Testimonial` — published customer quotes.
- `ProjectAmenity` — join table.

RERA behaviour is enforced in application code: `reraNumber` is only persisted when `reraVerified` is true, and the public detail page only shows an RERA reference when both are present. The seed data deliberately contains no real RERA numbers.

---

## Getting started

### Prerequisites

- Node.js 20+ (tested with Node 26)
- npm
- No external database is required for local development; SQLite is the default.

### Install and seed

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

`npm run setup` runs:

```bash
prisma generate
prisma db push
npm run db:seed
```

Open <http://localhost:3000>.

If your environment blocks npm lifecycle scripts, run the Prisma steps explicitly:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Useful database commands:

```bash
npm run db:generate   # regenerate Prisma Client
npm run db:push       # sync schema
npm run db:seed       # insert demo data
npm run db:reset      # force-reset and reseed (destructive)
npm run db:studio     # Prisma Studio
```

### Windows note for this machine

The local Application Control policy blocks the native Next.js SWC `.node` binary. Tailwind CSS uses its pure-JavaScript scanner and is unaffected. Builds on this machine must force Next's WebAssembly fallback:

```powershell
$env:NAPI_RS_FORCE_WASI="true"
npm run build
```

`next dev` and `next start` work normally afterwards. On a standard machine with the native binary available, the normal `npm run build` works without the variable.

---

## Environment variables

Copy `.env.example` to `.env` and adjust values. Never commit `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string. Default `file:./dev.db`. |
| `AUTH_SECRET` | Yes | Random secret of at least 32 characters used to sign JWT sessions. |
| `AUTH_COOKIE_NAME` | No | Session cookie name; defaults to `innovations_session`. |
| `AUTH_SESSION_DAYS` | No | Session lifetime in days; defaults to 7. |
| `AUTH_LOGIN_IP_LIMIT` | No | Sign-in attempts per IP per 10 minutes; defaults to 10. Raise only for load tests/shared IPs. |
| `AUTH_LOGIN_EMAIL_LIMIT` | No | Sign-in attempts per account per 10 minutes; defaults to 8. Test runs raise this. |
| `LEAD_RATE_LIMIT` | No | Inquiry submissions per IP per 10 minutes; defaults to 6. |
| `SITE_VISIT_RATE_LIMIT` | No | Site-visit requests per IP per 15 minutes; defaults to 5. |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Canonical site URL used by metadata, sitemap and Open Graph. |
| `SEED_ADMIN_NAME` | Seed only | Admin display name. |
| `SEED_ADMIN_EMAIL` | Seed only | Admin email. |
| `SEED_ADMIN_PASSWORD` | Seed only | Admin password. |
| `AI_API_KEY` | No | Enables optional intent-parsing provider. Assistant works without it. |
| `AI_BASE_URL` | No | OpenAI-compatible base URL. |
| `AI_MODEL` | No | Model name for intent parsing. |
| `AI_PROVIDER` | No | `auto`, `openai-compatible` or `rules`. |
| `STORAGE_DRIVER` | No | `local` (default) or `s3`. |
| `UPLOAD_DIR` | No | Optional absolute path for local uploads. |
| `S3_ENDPOINT` | S3 only | S3-compatible endpoint. |
| `S3_REGION` | S3 only | Bucket region. |
| `S3_BUCKET` | S3 only | Bucket name. |
| `S3_ACCESS_KEY_ID` | S3 only | Access key. |
| `S3_SECRET_ACCESS_KEY` | S3 only | Secret key. |
| `S3_PUBLIC_URL` | S3 only | Public base URL for uploaded objects. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | WhatsApp number in international format without `+`. |
| `NEXT_PUBLIC_SALES_PHONE` | No | Display sales phone number. |
| `NEXT_PUBLIC_SALES_EMAIL` | No | Display sales email. |

Generate a production secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Demo accounts

Seeded accounts (local demo only):

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@innovations.demo` | `Admin@12345` |
| Agent | `agent@innovations.demo` | `Agent@12345` |
| Customer | `demo@innovations.demo` | `Demo@12345` |

Change or remove these before exposing the app publicly. They are intentionally documented because this is a demonstration build.

---

## Routes

### Public

- `/`
- `/projects`
- `/projects/[slug]`
- `/residential`
- `/commercial`
- `/resort-housing`
- `/service-apartments`
- `/location/noida`
- `/location/greater-noida`
- `/location/noida-extension`
- `/compare`
- `/about`
- `/contact`
- `/faq`
- `/privacy-policy`
- `/terms`
- `/login`
- `/register`

### Customer

- `/dashboard`
- `/dashboard/saved`
- `/dashboard/inquiries`
- `/dashboard/visits`
- `/dashboard/profile`

### Admin

- `/admin`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]`
- `/admin/leads`
- `/admin/leads/[id]`
- `/admin/site-visits`
- `/admin/developers`
- `/admin/locations`
- `/admin/amenities`
- `/admin/faqs`
- `/admin/testimonials`
- `/admin/users`

### Machine-readable

- `/sitemap.xml`
- `/robots.txt`
- `/media/[...path]` — local uploaded media
- `/api/*` — JSON APIs for auth, leads, visits, saved projects, AI and admin operations

---

## Admin workspace

1. Sign in at `/login` with the admin account.
2. Use `/admin` for the workspace overview.
3. Create or edit projects at `/admin/projects`; the editor covers content, pricing, configurations, amenities, media, floor plans, map, landmarks, brochure and SEO.
4. Uploads are validated by file type and magic bytes (JPG, PNG, WebP, AVIF; max 5 MB).
5. Leads and site visits have private contact data and status pipelines. Lead detail pages support assignment and audit notes.
6. User management prevents demoting/deactivating the last active administrator and supports guarded password resets.
7. Archiving a project removes it from public listings while keeping its historical records.

No real email, SMS or WhatsApp notifications are sent. Forms persist leads and visits in the database; notification integrations are listed as a remaining task.

---

## AI assistant and voice

### Grounding

- User text is parsed into structured intent (location, budget, BHK, type, status, possession, amenities, sort order, comparison, greeting).
- The parser supports English, Hindi and Hinglish keywords, including Devanagari locations and amenity words.
- Spoken budgets are normalised before parsing: English words (`seventy five lakh`), Hinglish words (`pachattar lakh`), Devanagari numbers (`पचहत्तर लाख`) and fractions (`dedh crore`, `dhai crore`, `sava crore`, `पौने`).
- Asking for the cheapest or newest options applies a real database sort instead of reordering fake text.
- Results are queried from Prisma. The assistant only renders projects that exist in the database.
- Comparison tables use stored fields only.
- If nothing matches, the assistant says so and offers the closest alternatives instead of inventing a project.
- Optional provider usage is limited to intent extraction and is sanitised before use (including the sort field). `AI_API_KEY` is server-only and never sent to the browser.

### Voice

- Voice input uses the browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
- A voice-language selector offers **Auto**, **English (`en-IN`)** and **हिंदी (`hi-IN`)**. Auto follows the current draft, the last message and the browser language, and switches to Hindi when Devanagari is detected.
- Interim speech results update the composer while speaking, so long questions appear as they are recognised.
- When recognition finishes, the final transcript is submitted automatically. Using the microphone also turns on spoken replies (unless the user has muted them), so a tap on the mic starts a spoken conversation rather than only filling the textbox.
- Replies are spoken with `speechSynthesis`; the assistant sends a shorter speech script with the top project names and spoken prices, splits long replies into short utterances, waits for installed voices to load and picks the closest matching voice.
- Speech synthesis is primed inside the mic/speaker tap because Chrome may ignore audio that starts after an asynchronous request.
- Speech is cancelled cleanly when a new message is sent, the assistant closes, or the user presses stop. A watchdog clears a stuck "Stop speaking" state if a platform voice driver never reports completion.
- Supported best in **Chrome and Edge**. Firefox has no speech recognition, and some privacy-hardened Chromium browsers (for example Brave) disable the browser speech service.
- Microphone access requires **HTTPS or localhost**. Opening the app over a plain-HTTP LAN address (such as `http://192.168.x.x:3100`) will show an **HTTPS needed** hint instead of silently failing.
- If recognition is unavailable, the control is disabled, the assistant shows **Text only** and explains why.
- If microphone permission is blocked, no speech is detected, no microphone exists or the network drops, the assistant shows a specific recoverable message and keeps the typed input available. Permission can be reset from the microphone/lock icon in the browser address bar.
- Browser speech recognition uses the browser's own online speech service, so it needs an internet connection even though this app runs locally.
- Voice runs entirely in the browser; no audio is uploaded to the Innovations Rental Solutions server.

#### Voice troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| **Text only** | Browser has no `SpeechRecognition` | Use Chrome or Edge; typing still works |
| **HTTPS needed** | Page is not a secure context | Use `https://` or `http://localhost` / `http://127.0.0.1` |
| **Microphone access is blocked** | Site permission is denied | Address-bar mic/lock icon → Allow → tap the mic again |
| **I didn't catch that** | No speech reached the recogniser | Speak closer to the mic, check the input device, tap the mic again |
| **Speech recognition needs an internet connection** | Browser speech service is unreachable | Check the connection, try Chrome/Edge, or type the question |
| Written answer but no audio | No installed voice for the language, or audio output unavailable | Install an English/Hindi system voice, check the system volume; the written answer is always complete |

### Configuration

The assistant works with no AI configuration. To enable provider-based intent parsing:

```env
AI_PROVIDER="openai-compatible"
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o-mini"
AI_API_KEY="your-server-side-key"
```

Compatible with OpenAI-style endpoints including Groq, Together, OpenRouter and local Ollama gateways.

---

## Search, filters and SEO

- Filter state is fully represented in the URL, so links can be shared and browser history works.
- Listings support pagination and price/recency sorting.
- Dynamic metadata, canonical URLs and Open Graph tags are provided per page.
- Project pages include `RealEstateListing` structured data, breadcrumbs and FAQ structured data where applicable.
- `sitemap.xml` includes published projects and location pages.
- `robots.txt` disallows `/admin`, `/dashboard`, `/api` and auth pages.
- Private pages are `noindex`.
- Semantic headings, a skip link, labelled form controls and alt text are part of the base layout.
- Images use `next/image` with responsive sizes.

When deploying, set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin so canonical URLs and the sitemap are correct.

---

## Security model

- Passwords are hashed with bcrypt; plaintext passwords are never stored.
- Sessions are signed JWTs in HTTP-only, same-site cookies.
- `middleware.ts` protects `/dashboard` and `/admin`; page layouts and APIs repeat server-side checks.
- Admin APIs require the `ADMIN` role. Customer APIs require an authenticated user.
- All mutating endpoints use Zod validation.
- Same-origin checks protect state-changing requests.
- Login, registration, lead and visit endpoints are rate limited.
- Lead forms include consent and honeypot checks, plus duplicate prevention.
- Uploads validate extension, MIME type, magic bytes and size.
- Customer contact data is never included in public queries.
- Secrets are read only on the server.
- Admin project saves enforce the RERA rule and only persist verified references.
- Security headers are configured in `next.config.js`.

For a multi-instance production deployment, move the in-memory rate limiter to Redis and add a shared session/rate-limit store.

---

## Testing

### Unit tests

```bash
npm test
```

Uses `node --test` with `jiti` to load TypeScript modules. Covers validation schemas, AI intent parsing (including spoken Hindi/Hinglish budgets and sort intents), search-param parsing, phone normalisation and rate limiting. Current suite: **30 tests**.

### Type check and lint

```bash
npm run typecheck
npm run lint
```

### API smoke test

Start a production server, then run the smoke script against it:

```bash
# terminal 1
$env:NAPI_RS_FORCE_WASI="true"   # only needed on this machine
npm run start -- -p 3100

# terminal 2
$env:SMOKE_BASE_URL="http://127.0.0.1:3100"
node tests/e2e/api-smoke.mjs
```

The script signs in as demo users, exercises public pages and APIs, creates and removes a temporary project, user, upload and lead, checks admin permissions, saved projects, site visits, AI responses and brochure generation. Current smoke run: **49 checks**.

### Browser E2E tests

Playwright is configured with desktop and mobile projects:

```bash
npx playwright test
```

Defaults:

- base URL: `http://127.0.0.1:3100` (override with `PLAYWRIGHT_BASE_URL`)
- system Chrome via `channel: "chrome"` (because downloaded Chromium is blocked by this machine's Application Control policy)
- one worker, separate desktop and Pixel 7 projects
- server reuse enabled; start the app first or let the config start it

Specs cover public routes, listing filters, category landing pages, detail pages, lead and visit forms, auth, dashboard, admin workspaces, AI chat, Hindi replies, simulated speech recognition and auto-submit, voice-language selection, spoken replies, voice fallbacks, mobile navigation, horizontal overflow and accessibility basics. Current suite: **38 tests** across desktop and mobile Chrome.

To use a specific running server:

```bash
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3100"
npx playwright test
```

E2E tests create temporary users, leads and visits and clean them up. They do not modify seeded projects.

### Full check

```bash
npm run check   # typecheck + lint + unit tests
```

---

## Build and production start

Standard production build:

```bash
npm run build
npm run start
```

Set environment variables from `.env.example` first. In production:

- use a strong `AUTH_SECRET`
- set `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin
- run `prisma migrate deploy` or `prisma db push` during release
- keep `storage/uploads` on a persistent volume, or switch to S3
- run behind a TLS-terminating reverse proxy

### Moving from SQLite to PostgreSQL

1. Change the Prisma datasource provider:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Set `DATABASE_URL` to the PostgreSQL connection string.
3. Run `npx prisma generate` and `npx prisma db push` (or create a migration with `prisma migrate dev`).
4. Reseed demo data if needed with `npm run db:seed`.

Status fields are stored as strings and validated in application code, so no enum migration is required.

---

## Deployment notes

### Recommended shape

- A Node.js host or container running `next start`.
- PostgreSQL managed database.
- S3-compatible object storage for uploads.
- HTTPS at the edge / reverse proxy.
- Persistent logs and backups for the database and media bucket.

### Serverless caution

SQLite and local uploads are not suitable for ephemeral/serverless filesystems. If deploying to Vercel or a similar platform:

- move to PostgreSQL
- set `STORAGE_DRIVER="s3"` and configure the S3 variables
- move rate limiting to a shared store such as Redis

### Operational checklist

- [ ] Replace all demo content with verified inventory.
- [ ] Remove or rotate demo credentials.
- [ ] Set a unique `AUTH_SECRET`.
- [ ] Set the real `NEXT_PUBLIC_SITE_URL`.
- [ ] Enable HTTPS and secure cookies.
- [ ] Configure database backups.
- [ ] Configure persistent media storage.
- [ ] Add monitoring and error reporting.
- [ ] Configure email/SMS/WhatsApp lead notifications if required.
- [ ] Review privacy and consent language with counsel before launch.

---

## Demo limitations and remaining tasks

This build is complete as a demonstration, but the following are intentionally **not** production-ready out of the box:

1. **All content is demo data.** Projects, developers, prices, images, approvals and RERA references are fictional or illustrative. RERA numbers are not seeded or verified.
2. **No real notification delivery.** Callback, inquiry and site-visit submissions are stored in the database; no email/SMS/WhatsApp message is sent.
3. **SQLite is local-development storage.** Move to PostgreSQL before multi-user production use.
4. **Rate limiting is in-memory.** Use Redis or another shared store for multi-instance deployments.
5. **Local uploads need persistent storage.** Use S3 or a persistent volume in production.
6. **No payment or booking engine.** The site captures visit requests, not payments.
7. **Agent workflows are basic.** Leads can be assigned and annotated, but there is no separate agent console, calendar sync or commission workflow.
8. **Demo images are illustrative.** Replace them with licensed photography for the real inventory.
9. **Legal review is required.** Privacy policy, terms and consent text are demonstration copy.
10. **Browser voice support varies.** Chrome/Edge work best; other browsers fall back to typing.

---

## License

MIT. See [LICENSE](LICENSE).

The demonstration content, including fictional developer names, project names, descriptions and sample prices, is provided for illustration only and must not be presented as verified real-estate information.
