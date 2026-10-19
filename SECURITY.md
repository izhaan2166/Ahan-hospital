# Security notes

Ahan Hospitals is a fictional portfolio project. It applies reasonable controls for a site that collects appointment requests, but it has **not** been assessed for HIPAA, India's DPDP Act, DISHA or any other legal standard, and must not be used for real patient information without that assessment, proper infrastructure, policies and operational controls.

## Controls in place

### Content Security Policy (enforced)

Set per request in `src/proxy.ts` using `src/lib/security/csp.ts`:

```
default-src 'self';
script-src 'self' 'nonce-<random per request>' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
frame-src 'none';
frame-ancestors 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
manifest-src 'self';
worker-src 'self';
upgrade-insecure-requests   (HTTPS requests only)
```

- Scripts run only with the request nonce. Next.js applies it to its own bootstrap scripts, and the JSON-LD blocks carry it too. No `unsafe-eval` in production; development adds it only because React's dev build needs it.
- `style-src 'unsafe-inline'` is a deliberate trade-off: Next.js and `next/image` write inline `style` attributes, which nonces cannot cover. Inline styles cannot execute script.
- No third-party origins are allowed. Fonts are self-hosted, and photos are proxied through the Next.js image optimiser so the browser only loads them from this site.
- Verified in real responses by `e2e/security-and-errors.spec.ts`, which also fails on any CSP violation in the browser.

### Other headers

From `next.config.ts`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, `X-Frame-Options: DENY` (legacy fallback), `Cross-Origin-Opener-Policy: same-origin`, and `X-Powered-By` removed. `Strict-Transport-Security` is sent only when `ENABLE_HSTS=true` at build time.

### Appointment endpoint (`POST /api/appointments`)

- Only POST is accepted; other methods get 405.
- `Content-Type` must be JSON (415), and the body is capped at 10 KB (413).
- Requests with a cross-site `Origin` header are rejected (403).
- Strict schema: unknown fields are rejected, and each field has type, length and format checks. Names allow letters from any script, apostrophes, hyphens and full stops. Phone numbers are parsed with libphonenumber (India by default, international with a country code) and stored in E.164 format. Dates must be real, today or later, and within 90 days in the hospital's time zone. The doctor must belong to the chosen speciality.
- A hidden honeypot field rejects simple bots, and each visitor (by IP) can send 5 valid requests an hour; the sixth gets 429 with `Retry-After`. Counts are kept in server memory.
- Errors return field messages or a generic message. Stack traces, database errors and configuration are never returned.
- Logs record only an error type or database error code, never names, phone numbers, emails or messages.
- Email alerts escape every user-supplied value before it goes into the HTML body, and the patient's email is used only as `Reply-To`, never as the sender. A failed send logs only the HTTP status and Resend's error name.
- The Supabase insert goes through the client library, which sends parameterised values (no SQL is built from strings).

### Database

`appointment_requests` has Row Level Security enabled with no policies, and table privileges revoked from `anon` and `authenticated`. Only the server-side service-role key can insert. Column checks repeat the key constraints.

### Personal data in URLs

The form sends data in a POST body with `fetch`. Success and error states render in place, with no redirect. Only doctor and speciality slugs appear in URLs (`/appointments?doctor=arjun-mehta`). WhatsApp links contain only the speciality or doctor name. The e2e journey test checks that no test patient data appears in any requested URL.

### Output encoding

All user-supplied and server-returned text is rendered through React, which escapes it. The only `dangerouslySetInnerHTML` is for JSON-LD built from site content, with `<` escaped.

### Secrets

Supabase credentials are read only in `src/lib/appointments/store.ts`, and the Resend API key only in `src/lib/appointments/notify.ts`. Both files import `server-only`, so a build fails if either is ever pulled into client code. `.env*` files are ignored by git, except `.env.example`, which holds no secrets. Rotate the Resend key at resend.com if it is ever exposed.

### Personal data in email

Each alert contains the patient's name, phone, optional email and reason for visit, so the receiving inbox holds health-related personal data. The request passes through Resend over TLS and is stored in the receiving mailbox. Limit who can read that inbox, and for real patients use a workspace account covered by a data-processing agreement.

## Not implemented (required before any real use)

- Rate limiting shared across server instances, and bot protection (for example CAPTCHA or Turnstile) on the appointment endpoint
- Authentication, staff roles and an audit log for whoever reads requests
- Data-retention and deletion rules, privacy notice and consent records
- Encryption-at-rest review, backups and incident response for the database
- Remote error monitoring and alerting
- An independent security review or penetration test
- HSTS verified on the real HTTPS domain

## Dependency audit

`npm audit` (13 October 2026) reports 5 high-severity advisories, all in `braces`, pulled in by `eslint-config-next` through `fast-glob`. This is development-only lint tooling and is not shipped to the browser or the server runtime. Runtime dependencies have no reported advisories.

## Reporting

This is a demonstration project; please open an issue in the repository for any security concern.
