# Contact form: Cloudflare Pages and Postmark

## Implementation

The Astro page posts JSON asynchronously to `/api/contact`. The Pages Function in
`functions/api/contact.ts` validates the request, verifies Cloudflare Turnstile, and sends a
plain-text transactional email through Postmark. No separate application server or database is needed.
`public/_routes.json` limits Pages Function invocation to `/api/contact`.

The form provides required fields, length limits, email validation, a honeypot, accessible status
messages, duplicate-click protection and a 20-second timeout. Errors retain the enquiry; only an
explicit successful JSON response clears it. Neither the frontend nor the Function logs enquiries.
Postmark and the destination mailbox necessarily process/store email according to their settings;
reflect this in the final privacy notice and choose appropriate retention in Postmark.

**Not deployed or sending live email yet.** Both frontend and server switches default to off.

## 1. Configure Postmark

Use the existing Postmark account. Create a separate Server for ModusFi to keep its configuration and
activity separate from the other domain. Use its transactional `outbound` stream.

Add `modusfi.io` under Sender Signatures/Domains and follow Postmark's domain verification steps.
In Cloudflare DNS, add the exact DKIM and custom Return-Path records Postmark supplies, then verify
in Postmark. Keep verification CNAME records DNS-only where required. Review the existing DNS and
DMARC policy before changing records. Do not replace MX records: receiving ModusFi mail is a separate
future task.

Choose a sender such as `website@modusfi.io` after domain verification. This is a proposed sender,
not an existing mailbox. Domain verification authorises sending; the initial recipient can be
`agunseli@gmail.com`, without first creating ModusFi inboxes. The visitor's email is set as Reply-To,
so replies from Gmail go to the visitor. The Function never sends automatic replies to visitors.

Copy the ModusFi Server API token into Cloudflare as a secret. Do not paste it into this repository
or the chat. Existing account plan limits still apply; no paid service or plan change has been made.

## 2. Create a Turnstile widget

In Cloudflare Turnstile, create a Managed widget for `modusfi.io` and any explicitly approved test
hostname. The frontend uses compact sizing to fit narrow mobile forms.

Copy the public site key to the frontend variable below and the secret key to the Pages Function
secret. The Function checks that the verified hostname matches the configured origin and the
Turnstile action is `contact`. Tokens are single use; the frontend resets verification after attempts.

## 3. Configure the Pages project

Open Workers & Pages, select the website's Pages project, then Settings → Variables and Secrets.
Configure Production and Preview separately. For preview testing use one exact preview hostname and
allow it in the Turnstile widget. Do not use a wildcard origin.

| Variable                      | Value                                                   | Scope                           |
| ----------------------------- | ------------------------------------------------------- | ------------------------------- |
| `PUBLIC_CONTACT_FORM_ENABLED` | `false` until launch checks pass, then `true`           | Public, Astro build             |
| `PUBLIC_TURNSTILE_SITE_KEY`   | Public widget site key                                  | Public, Astro build             |
| `CONTACT_FORM_ENABLED`        | `false` until ready, then `true`                        | Function runtime                |
| `CONTACT_ALLOWED_ORIGIN`      | `https://modusfi.io` (no trailing slash)                | Function runtime                |
| `CONTACT_FROM_EMAIL`          | Approved bare sender address, e.g. `website@modusfi.io` | Function runtime                |
| `CONTACT_TO_EMAIL`            | `agunseli@gmail.com`                                    | Function runtime                |
| `TURNSTILE_SECRET_KEY`        | Widget secret key                                       | Encrypted secret, Function only |
| `POSTMARK_SERVER_TOKEN`       | ModusFi Server API token                                | Encrypted secret, Function only |

If the site redirects to `www.modusfi.io`, use that canonical origin consistently instead. The
Function rejects requests arriving on other hostnames, including unapproved `pages.dev` aliases.
Public build variables require rebuilding the static site after changes. The runtime switch allows
delivery to be disabled independently. Never put credentials in a `PUBLIC_` variable.

## 4. Deploy Pages with Functions support

Keep the build command `npm run build`, output directory `dist`, and Node version 24. Deploy from
repository root so Pages discovers the root-level `functions/` directory. Use the existing Pages
Git integration if configured, or a Wrangler Pages deployment including the Functions directory.
Dashboard drag-and-drop of `dist` alone does not deploy the Function.

The Astro development server and `astro preview` serve the frontend only. For full local runtime
testing, use Wrangler's Pages development server against built `dist` output and the root Functions
directory. Keep local secrets in an ignored environment file recognised by Wrangler. Do not use a
live token for routine tests; Postmark documents `POSTMARK_API_TEST` for API validation without
delivery. Never use test credentials or Turnstile test keys in production.

## 5. Configure rate limiting before activation

On the Cloudflare zone, create a rate limiting rule matching URI Path equals `/api/contact`, counting
per source IP. Choose a low submission threshold using the periods available on the current plan,
and use Block rather than an HTML challenge for the JSON endpoint. Test normal enquiries and shared
office IP behaviour before settling the threshold. The frontend handles HTTP 429.

Rate limiting is an edge configuration step, not an in-memory counter in the Function. The Function
already enforces request-size limits, origin checks, field validation, a honeypot and server-side
Turnstile validation. Verify the custom domain is proxied and the rule applies to the deployed
endpoint. Do not enable a paid WAF feature without approval.

## 6. Verify and activate

Publish the reviewed privacy notice first. In an isolated preview with the exact preview origin:

1. Enable both switches and supply the correct site key, secrets and sender/recipient settings.
2. Deploy the complete Pages project. Confirm `/api/contact` is served by a Function rather than an
   HTML fallback. A GET should return 405.
3. Submit a labelled test enquiry. Confirm it appears in Postmark activity and arrives at
   `agunseli@gmail.com`; inspect sender and Reply-To. Success means Postmark accepted the email,
   not a guarantee of final inbox delivery.
4. Check invalid fields, expired verification, repeated requests, unavailable delivery and rate
   limiting. Confirm errors retain the enquiry and never leak provider details or credentials.
5. Apply the verified production configuration and enable both switches. Rebuild/deploy and repeat
   a real delivery check. Do not mark delivery complete until inbox receipt has been observed.

To stop delivery, set `CONTACT_FORM_ENABLED=false`. Rebuild with the public flag false to show the
unavailable state too. Never automatically retry ambiguous failures: Postmark might already have
accepted the email before a timeout.

## API contract

`POST /api/contact`, same origin, `Content-Type: application/json`:

```json
{
  "name": "Example visitor",
  "email": "visitor@example.com",
  "message": "A brief description of the project.",
  "website": "",
  "turnstileToken": "token-from-widget"
}
```

The Function limits actual request bodies to 32 KiB, requires name/email/message, enforces
100/254/5000-character limits, rejects control characters in identity fields and a populated honeypot,
and validates Turnstile on the server. Sender and recipient come only from server configuration.
Emails use plain text; open and link tracking are disabled.

Responses are JSON with `Cache-Control: no-store`: `200 {"success":true}` only after awaited Postmark
acceptance; generic failures use `400`, `403`, `405`, `413`, `415`, `502`, `503` or `504` as applicable.
The edge rate limiting rule supplies `429`. Unexpected responses and timeouts never clear the enquiry.

## Checks

If delivery fails, open the production deployment's Functions log stream and reproduce one test.
The `contact_delivery_failed` entry records only Postmark's HTTP status and numeric error code.
It never records the provider's message, recipient, enquiry, or API token. Use the error code with
Postmark's API error reference to diagnose authentication, sender or account restrictions.

Run `node --test tests/contact-form.test.mjs tests/contact-endpoint.test.mjs`, then
`bash scripts/ai-checks.sh`. Tests mock external services; they never send email and do not substitute
for a deployed Pages/Turnstile/Postmark integration test.

## Official references

- [Postmark domain verification](https://postmarkapp.com/support/article/1046-how-do-i-verify-a-domain)
- [Postmark Email API](https://postmarkapp.com/developer/api/email-api)
- [Postmark API test token](https://postmarkapp.com/developer/api/overview)
- [Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Pages bindings and secrets](https://developers.cloudflare.com/pages/functions/bindings/)
- [Turnstile widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/)
- [Server-side Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare rate limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/create-zone-dashboard/)
