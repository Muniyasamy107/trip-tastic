# Trip-Tastic Owner Studio

## First-time setup (private VS Code/server terminal)

Requires Node 22.13+ and the full Node application, not static hosting alone.

```bash
npm ci
npm run admin:setup
npm run dev -- --port 5173
```

Open **http://localhost:5173/admin.html**.

- Default username: **superadmin**.
- The setup command prints a unique, randomly generated password **once** in your
  private terminal. Save it in a password manager. There is no shared/default
  password, hard-coded credential, public signup or public bootstrap endpoint.
- No live owner account is seeded by tests or committed to Git. Setup must run in
  each environment's private `DATA_DIR`. A local account does not automatically
  create the production account or vice versa.
- Re-running setup refuses to overwrite an existing account. To recover/rotate:

```bash
npm run admin:setup -- --reset
# Optional owner username:
npm run admin:setup -- --reset --username your-owner-name
```

A reset revokes every session. Anyone with filesystem/database/terminal access is
already an owner-level operator, so keep that environment private. Do not paste
passwords into the repository, website code, screenshots, tickets or public chat.

For production, run setup with the same private DATA_DIR used by the server, then
`npm run build` and `npm start`. `/admin.html` is supported in dev and production;
production also accepts `/admin` and `/admin/`. Open admin directly in its own
browser tab if a preview iframe blocks third-party cookies.

## The workspace

### Enquiry inbox

Only submitted trip enquiries with the site's required consent are collected.
The site does **not** discover the email address of an anonymous visitor, scrape
browser identity, add a visitor-email tracking service or collect optional signup
emails. Emails come from the existing trip-planning form only.

Search names, email addresses or references; filter new/contacted/closed; open a
record to read its date, party size, budget, notes and contact consent. Pagination
loads 25 records at a time. These routes require an authenticated owner session.
No public endpoint lists personal data.

**Open email draft** prepares a `mailto:` draft in your own configured email app.
**Open WhatsApp** prepares a chat at `wa.me` only when the customer separately
opted in and provided an international `+country-code` phone number. Existing
records are migrated with WhatsApp consent off; permission is never inferred.

You must press **Send in the other app**. This build does not automatically send
email/WhatsApp, verify delivery, store drafts or mark a person contacted on your
behalf. No SMTP/WhatsApp API credentials are requested or included. Keep replies
relevant to the enquiry, not unsolicited marketing. Mark follow-up status manually.

Delete removes the record from the active database after confirmation; the audit
keeps only its reference/action. Backup, WAL and device/mail-app retention are the
owner's responsibility—deleting a live row is not a guarantee of erasure from
historic backups or third-party apps. Set a retention/deletion policy before launch.

### Collection pricing

Edit each journey's minimum/maximum indicative per-person range in whole INR.
Ranges must be positive integers, maximum ≥ minimum, up to ₹1,00,00,000.

Changes are saved in SQLite, not by rewriting source files. Public collection
cards, route details, comparisons and itinerary downloads use published overrides.
Refresh/refocus a public tab after saving. Saved prices survive server restarts and
builds as long as the private database persists. Failing settings requests produce
a visible pricing warning, not a silent claim that fallback preview prices are live.

Rows use version checks to prevent silently overwriting an edit made in another
tab/session. Reload prices after a conflict. These remain authored planning
estimates—not live inventory, offers, confirmed supplier rates or payment charges.

### Social & contact

The owner-supplied public business contacts are prefilled:

- Call: **+91 73032 15348** (`tel:+917303215348`), also available in the header.
- Email: **triptasticholidays1430@gmail.com**.
- WhatsApp: **+91 73032 15348**.
- Instagram: **https://www.instagram.com/triptastic_holidays_/** (trailing
  underscore retained; QR/referral tracking removed).

Edit all four in **Social & contact**. Clearing a field disables that channel after
public settings load. A fresh or previously untouched installation gets these
supplied defaults. Existing owner-edited socials are preserved; migration adds
phone/email without clearing prices, enquiries or account data. Once an owner
changes/clears a field, restarts and builds do not reseed it. The original supplied
contacts are also the HTML fallback if JavaScript/the settings API is unavailable.

Call links open a device's dialer/calling app; laptops need a configured calling
application. Email links open an email app. Neither action places a call or sends
an email automatically. WhatsApp availability depends on the number's WhatsApp
account and the visitor's app/browser; publishing a link does not verify ownership
or delivery. No external contact action is triggered by tests.

International call/WhatsApp numbers, valid business emails and plain Instagram
profile URLs are accepted. Instagram redirects, other hosts, credentials, tracking
parameters and non-profile paths are rejected. These are deliberately public
business contacts, separate from customers' private enquiry data/WhatsApp consent.

### Responsive verification

`npm run test:contacts` runs browser checks against the running app (`TEST_URL`
overrides localhost:5173). It covers 320, 360, 390, 768, 820, 1024, 1280, 1440 and
1920-pixel widths, plus 844×390 landscape: document overflow, header collisions,
44px contact targets, mobile menu, planner width and contact URL propagation.
`npm run test:admin` independently tests persistence, migration, validation and
public contact updates from the owner studio. Tests emulate representative screen
sizes; they do not claim physical-device, OS dialer or email-delivery verification.

### Account security

Change your password with the current password, a new 12–128-character password
including letters/digits, and confirmation. This signs out **all** sessions.
Owner recovery is the private terminal reset command; no insecure email-reset or
public registration shortcut is provided.

## Security and deployment notes

- Scrypt with a unique random salt stores password hashes, never plaintext.
- Opaque session tokens are hashed in SQLite. The cookie is HttpOnly, SameSite=Strict,
  eight-hour absolute expiry, and Secure for HTTPS-origin/PUBLIC_ORIGIN logins.
- Admin mutations require same-site Origin, JSON and a session-bound CSRF token.
  Tokens stay in JS memory, not local storage. Login rejects missing/cross-site Origin.
- Login throttling persists in SQLite: five failed attempts per IP per 15 minutes.
- Price/settings concurrency checks, bounded JSON bodies, parameterized queries,
  escaped user text and action/reference-only audit records are included.
- The private database contains enquiries, auth hashes, sessions, pricing and social
  settings. `DATA_DIR` defaults to ignored `.data/`; never expose it in public/dist/Git.
- Serve via HTTPS. Set PUBLIC_ORIGIN correctly behind your reverse proxy. Only set
  TRUST_PROXY=1 when your hosting strips untrusted forwarded headers and supplies a
  trusted client IP. Do not enable it on an untrusted direct-facing proxy chain.
- Back up the whole SQLite database consistently, including WAL/checkpoint handling;
  protect backups and establish retention. Persist DATA_DIR across deployments.
- This is a single-owner admin, not multi-user roles, MFA/SSO or an email-delivery
  platform. Consider an additional access gateway/MFA and hosting-level monitoring
  before exposing a high-value production admin. No security certification is claimed.

## Verification

```bash
npm run test:admin
npm test
npm run build
```

Admin tests create an isolated temporary database and Vite server, use only test
credentials/customer fixtures, and remove them on completion. They do not seed or
reset the actual owner account, publish test social links to the real database,
send messages or click external contact links. Sandbox Chromium omits automatic
Origin because of its launch flags; browser tests explicitly provide same-origin
Origin while independent Node requests verify missing/cross-site rejection.
