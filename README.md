# Ahan Hospitals

A premium multispeciality hospital website built with Next.js (App Router), TypeScript and Tailwind CSS.

> **Ahan Hospitals is fictional.** This is a portfolio demonstration. Doctors, phone numbers, addresses and email addresses are examples. The site is not HIPAA-compliant, legally certified or production-ready for real patient information. See [SECURITY.md](./SECURITY.md).

## What is included

| Area | Details |
| --- | --- |
| Pages | Home, About, Specialities (directory and 8 detail pages), Doctors (directory and 12 profiles), Appointment request, Contact and visit, branded 404 and error pages |
| Doctor search | Search by name, condition or speciality, with a speciality filter, live result count and empty state |
| Appointments | Client and server validation, a Next.js POST endpoint, Supabase persistence, email alerts through Resend, and a clearly labelled demo mode when neither is configured |
| WhatsApp | Context-aware `wa.me` links for general, speciality and doctor enquiries. The prefilled text names only the speciality or doctor, never the patient |
| Configuration | Contact details, opening hours and directions in `src/config/site.ts` |
| Security | Nonce-based enforced CSP, security headers, server-side validation, no personal data in URLs |
| SEO | Per-page metadata, canonical URLs, sitemap, robots, and JSON-LD for Hospital, Physician, MedicalWebPage and BreadcrumbList |
| Accessibility | Targets WCAG 2.2 AA: skip link, landmarks, labelled fields, error summary, visible focus, reduced-motion support |

Not included in this release, by design: patient portal, admin dashboard, user accounts or authentication.

## Getting started

Requirements: Node.js 20.9 or later (tested on Node 22), npm.

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                   # http://localhost:3000
```

Without any environment variables the site runs fully, and the appointment form runs in **demo mode**: requests are validated but not stored, and the page says so.

## Environment variables

| Variable | Where it is used | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, structured data | Recommended in production |
| `SUPABASE_URL` | Server only, appointment storage | For persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only, appointment storage. Never exposed to the browser | For persistence |
| `RESEND_API_KEY` | Server only. Resend API key used to email each request | For email alerts |
| `APPOINTMENT_NOTIFY_TO` | Server only. Inbox that receives the alerts | For email alerts |
| `APPOINTMENT_NOTIFY_FROM` | Server only. Sender address. Defaults to Resend's test sender `onboarding@resend.dev` | No |
| `ENABLE_HSTS` | Sends `Strict-Transport-Security`. Read at **build time**. Set to `true` only for an HTTPS-only deployment | No |

`.env.local` is ignored by git. `.env.example` contains no secrets.

## Database setup (Supabase)

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/migrations/0001_appointment_requests.sql`](./supabase/migrations/0001_appointment_requests.sql). It creates the `appointment_requests` table with column constraints, enables Row Level Security, adds **no policies**, and revokes table access from the `anon` and `authenticated` roles. Only the server, using the service-role key, can insert rows.
3. In **Project settings, API**, copy the project URL and the `service_role` key into `.env.local` as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Restart the server. The demo-mode notice disappears and successful requests return a reference such as `AH-7K3QXP`.

Staff can read requests in the Supabase table editor. A stored row means *request received*, not a confirmed booking. The `status` column (`received`, `contacted`, `confirmed`, `cancelled`) is there for manual follow-up.

## Email alerts (Resend)

Every valid appointment request is emailed to your inbox with all its details: reference, name, phone (tap to call), email, speciality, doctor, preferred date and time, reason for visit, and when it was received. Replying goes straight to the patient when they gave an email address.

1. Create an API key at <https://resend.com/api-keys>.
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_...
   APPOINTMENT_NOTIFY_TO=you@example.com
   ```
3. Restart the server.

Until you verify a domain in Resend, mail comes from `onboarding@resend.dev` and Resend only delivers to the address you signed up with. After verifying a domain, set `APPOINTMENT_NOTIFY_FROM` (for example `Ahan Hospitals <appointments@yourdomain.com>`) to send to any inbox.

Email and Supabase are independent. With both set, a request is saved and emailed; the patient sees success if either works. With only email set, the email is the record. If email is the only channel and sending fails, the patient is told to try again or call.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core web vitals and TypeScript rules) |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit and component tests |
| `npm run test:e2e` | Playwright end-to-end tests against the production build |
| `npm run check` | Lint, typecheck and unit tests together |

### End-to-end tests

```bash
npm run build
npx playwright install chromium        # once, or use an installed browser:
E2E_BROWSER_CHANNEL=msedge npm run test:e2e   # or chrome
```

Playwright starts `npm start` on port 3100 with Supabase and Resend variables cleared, so e2e runs exercise **demo mode** and never write to a database or send email.

## Tests

| Suite | File | Covers |
| --- | --- | --- |
| Validation (unit) | `tests/unit/appointment-validation.test.ts` | Required fields, length limits, phone formats (Indian and international), past, future and malformed dates, time-zone handling, doctor and speciality relationships, unexpected fields, honeypot, Unicode names, HTML kept as text |
| API (unit) | `tests/unit/appointment-api.test.ts` | 201 stored, 200 demo, 503 database failure, 422 invalid, 400 bad JSON, 415 wrong type, 413 oversized, 403 cross-origin, generic 500 without leaking details or logging personal data |
| WhatsApp and CSP (unit) | `tests/unit/whatsapp-and-csp.test.ts` | Message context and encoding, CSP directives |
| Appointment form (component) | `tests/components/appointment-form.test.tsx` | Visible, linked errors; correct and resubmit; duplicate-submit prevention; success only after the handler resolves; failure shows an error; demo mode wording; server field errors; keyboard-only completion |
| Doctor directory (component) | `tests/components/doctor-directory.test.tsx` | Speciality filter, accent-insensitive search, empty state and recovery, URL speciality handling, portrait fallback |
| Journey (e2e) | `e2e/journey.spec.ts` | Home, Doctors, profile, appointment, validation, demo outcome; asserts no personal data in any URL; speciality WhatsApp link; mobile menu |
| Security and errors (e2e) | `e2e/security-and-errors.spec.ts` | Headers in real responses, fresh nonces, no CSP violations or console errors, branded 404s with HTTP 404, failed-submission state, every internal link resolves |
| Accessibility (e2e) | `e2e/accessibility.spec.ts` | axe-core WCAG 2.0 to 2.2 A/AA rules on every page, plus the form error state |

Dates in unit and component tests use a fixed clock. No test needs a real WhatsApp account, Supabase project, Resend key or other credential.

## Project structure

```
src/
  app/                    routes, layouts, error.tsx, not-found.tsx, global-error.tsx, API route
  components/
    ui/                   foundational: Button, ButtonLink, Input, Textarea, Select, Checkbox, Field, Alert, Spinner
    composite/            DoctorCard, SpecialityRow, DoctorPortrait, header, footer, states, error boundary, WhatsApp link
    sections/             page sections with behaviour: DoctorDirectory, AppointmentForm
  config/site.ts          contact details, hours, directions, navigation
  content/                doctors, specialities and hospital copy (typed local data)
  lib/
    content/              content provider, the only read path for content
    validation/           appointment fields (light) and validator (zod, libphonenumber)
    appointments/         API handler, Supabase store, browser client
    security/csp.ts       CSP builder
    seo/json-ld.tsx       structured data
  proxy.ts                per-request CSP nonce
supabase/migrations/      SQL for the appointments table
tests/                    Vitest suites
e2e/                      Playwright suites
```

Design tokens (colour, type, radius, shadow) live in `src/app/globals.css` under `@theme`. Fonts are Fraunces (display) and Figtree (text), self-hosted by `next/font`. The visual signature is a sunrise motif taken from the logo (Ahan means dawn): dark teal headers with a warm horizon glow, concentric arcs, and photos framed with a soft elliptical arch (the `frame-arch` utility in `globals.css`). Its pieces live in `src/components/composite/motif.tsx`.

## Content and photography

Edit doctors and specialities in `src/content/`. Photography is from [Unsplash](https://unsplash.com) under the Unsplash License and is served through the Next.js image optimiser, so browsers only load images from this site. The people pictured are stock models, not real staff of any hospital; replace them with real, consented staff photos before any real use. The homepage hero plays short segments from three [Pexels](https://www.pexels.com/license/) videos (free for commercial use), stored in `public/videos/` with a poster image each. Phones, data-saver users and visitors who prefer reduced motion see the first poster instead. At the owner's request there is no pause button; this does not meet WCAG 2.2.2 (Pause, Stop, Hide) for visitors who have not set a reduced-motion preference.

## Verified results (13 October 2026, Windows 11, Node 22, Microsoft Edge)

| Check | Result |
| --- | --- |
| `npm run build` | Passes |
| `npm run lint`, `npm run typecheck` | Pass, no warnings |
| `npm test` | 95 of 95 passed |
| `npm run test:e2e` (desktop and mobile projects) | 49 passed, 1 skipped (mobile-menu test runs only in the mobile project) |
| Lighthouse desktop, 7 main pages | Performance 99 to 100, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse mobile (19 October 2026) | Performance: home 90, doctors 93, appointments 92 (after replacing CSS blur glows with gradients). Accessibility 100 |

## Known limitations

- **Mobile Lighthouse performance is just at the 90 target on the home page (90, varying a few points between runs).** The remaining cost is framework JavaScript (React and the Next.js router) running before first paint under Lighthouse's 4x CPU throttle, plus dynamic rendering, which the per-request CSP nonce requires. Desktop scores 99 to 100. Possible next steps: a hash-based CSP with static rendering, or deploying behind a CDN and re-measuring there instead of on localhost.
- **Supabase persistence is not verified end to end** in this environment because no project credentials were available. The insert path is covered by unit tests with a fake store, and demo mode is verified in the browser.
- **HSTS** is configured but only verifiable on an HTTPS deployment with `ENABLE_HSTS=true` set at build time.
- **Screen-reader testing** has not been done by a person. Automated axe checks and keyboard tests pass; a manual pass with NVDA or VoiceOver is still recommended.
- **Rate limiting is in server memory.** Each visitor (by IP) can send 5 valid requests an hour. Counts reset on restart and are not shared between server instances, so a multi-instance deployment needs a shared store such as Upstash Redis. There is no CAPTCHA.
- **No remote error monitoring.** Errors are logged to the server console without personal data.
- The phone and WhatsApp number in `src/config/site.ts` is real (+91 81483 08344). The address and email are fictional examples.
