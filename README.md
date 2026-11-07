# ModusFi website — initial implementation

Responsive Astro website based on the approved ModusFi brand and homepage direction. **Preview, not yet production-ready.**

## Run locally

Requires a supported Node.js LTS version and npm.

```bash
npm install
npm run dev
```

Open http://localhost:4321.

## Build

```bash
npm run build
npm run preview
```

## Deploy

Static Astro output goes into `dist/`. For Cloudflare Workers static assets, follow the current Cloudflare Astro/static-assets deployment instructions and configure a Workers project with assets directory `./dist`. Do not connect the production domain until the legal details and contact form are ready.

## Important pre-launch tasks

- Confirm all published business and attribution claims.
- Replace placeholder privacy notice with reviewed legal text and required company disclosures.
- Connect a secure, spam-protected contact form backend; the preview form is intentionally disabled.
- Review accessibility, SEO, mobile layout and performance in a browser.
- Approve favicon and illustrative assets; validate trademark/brand clearance.
- Review externally hosted Google Fonts for privacy and performance, or self-host the approved font.

## Design

- Wordmark: approved `modusfi.` with turquoise `fi.`
- Primary navy `#101D32`; accent turquoise `#00B3C6`
- No team page
- Main pages: Home, Services, Expertise, Experience, About, Contact
