# ModusFi Website — Architecture

## Overview
ModusFi's public corporate website is an Astro static site. Its purpose is to present services, expertise, experience, approach and contact information to prospective enterprise clients.

## Current intended stack
- Astro 7 and TypeScript
- Tailwind CSS 4 via `@tailwindcss/vite`
- Node.js 24 LTS (`.nvmrc`)
- Static HTML/CSS/limited browser JavaScript
- Cloudflare hosting (deployment product and configuration to be confirmed from the repository and Cloudflare account)

These are design assumptions from the current project discussion; always inspect repository configuration before implementing changes.

## Principles
1. Static first: do not introduce unnecessary application infrastructure.
2. Reuse existing Astro layouts and site styles.
3. Prefer semantic, accessible HTML and responsive CSS.
4. Keep build and runtime dependencies small.
5. Avoid client hydration unless it provides necessary functionality.

## Contact form — proposed integration
Existing form → HTTPS POST → Cloudflare-compatible server endpoint → validated/spam-checked submission → approved transactional email provider → clear success/error response.

This is a proposed design, **not** a statement that the endpoint is already implemented. Confirm Cloudflare Pages Functions vs Workers deployment and provider choice before coding. API keys belong in server-side secrets. Do not use `mailto:` as a substitute for the agreed form experience.

## Deployment
Build using the repository's `build` script; verify actual output directory (typically `dist/`). Use a preview URL for Gerry's review before configuring the production domain. Never commit secrets or assume a deployment is complete without testing the deployed pages.

## Change control
Small feature branches, local checks, reviewed diffs. Agents do not push, merge, or delete branches without approval.
