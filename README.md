# ModusFi website: initial implementation

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

The website is hosted on Cloudflare Pages. Build with `npm run build`, use `dist/` as the output directory, and deploy from repository root so Pages includes `functions/`. Follow [contact form setup](docs/contact-form.md) for Turnstile and Postmark configuration. Keep the form disabled until the privacy notice, spam protection and delivery checks are complete.

## Important pre-launch tasks

- Confirm all published business and attribution claims.
- Replace placeholder privacy notice with reviewed legal text and required company disclosures.
- Configure and verify the Pages Function, Turnstile and Postmark delivery using [contact form setup](docs/contact-form.md); the form is disabled until configuration is complete.
- Review accessibility, SEO, mobile layout and performance in a browser.
- Approve favicon and illustrative assets; validate trademark/brand clearance.
- Review externally hosted Google Fonts for privacy and performance, or self-host the approved font.

## Design

- Wordmark: approved `modusfi.` with turquoise `fi.`
- Primary navy `#101D32`; accent turquoise `#00B3C6`
- No team page
- Main pages: Home, Services, Expertise, Experience, About, Contact
