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
