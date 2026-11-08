# ModusFi Website — Architecture

## Overview

ModusFi's public corporate website is an Astro static site. Its purpose is to present services, expertise, experience, approach and contact information to prospective enterprise clients.

## Current intended stack

- Astro 7 and TypeScript
- Tailwind CSS 4 via `@tailwindcss/vite`
- Node.js 24 LTS (`.nvmrc`)
- Static HTML/CSS/limited browser JavaScript
- Cloudflare Pages hosting, with a Pages Function for contact enquiries

These are design assumptions from the current project discussion; always inspect repository configuration before implementing changes.

## Principles

1. Static first: do not introduce unnecessary application infrastructure.
2. Reuse existing Astro layouts and site styles.
3. Prefer semantic, accessible HTML and responsive CSS.
4. Keep build and runtime dependencies small.
5. Avoid client hydration unless it provides necessary functionality.

## Service pages

`/services` remains the overview. Homepage cards and overview links lead to four static routes:

- `/services/software-product-engineering`
- `/services/ai-intelligent-automation`
- `/services/cloud-platform-modernisation`
- `/services/financial-technology-engineering`

The AI service is titled “AI & Intelligent Systems”; its existing `ai-intelligent-automation` URL
is retained so that links remain stable.

`src/data/services.ts` holds the shared service titles, slugs, short homepage descriptions, existing
overview descriptions and capabilities. Homepage and overview ordering are defined separately to
preserve the current presentation. Keep links aligned with the corresponding files in
`src/pages/services/` when changing slugs.

Each service has its own Astro page using `src/layouts/ServiceLayout.astro`. The layout provides
metadata through `BaseLayout`, breadcrumbs, an introduction, capabilities and contact/overview links.
Its default slot accepts service-specific sections before the final call to action. Add detailed
copy, optimised imagery and semantic diagrams in those individual pages as content is approved;
do not add empty visual placeholders or client-side frameworks for this purpose.

Detailed content is maintained in the individual service pages. The shared layout supports named
introduction and call-to-action slots as well as service-specific body sections. Additional graphics
can be added as they are approved. The partner introduction PDF is background reference; its claims
and assets are not automatically approved for publication.

## Contact form

The static contact page submits to `/api/contact`, implemented as a Cloudflare Pages Function in
`functions/api/contact.ts`. It validates requests and Turnstile tokens, then sends plain-text email
through Postmark using server-side secrets. No database or separate application server is required.
The initial delivery destination is configured in Pages; it is not supplied by the visitor.

Both frontend and runtime activation flags default to off. Deployment, sender-domain verification,
secrets, edge rate limiting, the final privacy notice and real inbox delivery remain to be configured
and verified. See [contact form setup](contact-form.md) for the environment variables and deployment
steps. Local Astro dev/preview does not execute Pages Functions.

## Deployment

Build using the repository's `build` script; verify actual output directory (typically `dist/`). Use a preview URL for Gerry's review before configuring the production domain. Never commit secrets or assume a deployment is complete without testing the deployed pages.

## Change control

Small feature branches, local checks, reviewed diffs. Agents do not push, merge, or delete branches without approval.
