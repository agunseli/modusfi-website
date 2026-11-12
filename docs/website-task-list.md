# Website task list

Updated 12 November 2026. Current layout work is on `fix/contact-form-layout`.
Do not commit, push or merge without the user's permission.

## Current amendments

- Rename the AI service and route to AI & Intelligent Systems, with a legacy redirect.
- Apply the supplied AI card and service page copy while preserving the design.
- Remove em dashes and add an always-on copy-authoring rule.

## Next work, in agreement with the user

- Develop the Expertise page.

## Deployed 9 November: five review fixes

- Darker turquoise text on light backgrounds, with a separate light accent on dark backgrounds.
- Static `/sitemap.xml` generated from current Astro pages and advertised in robots.txt.
- MDC formatting support and a clean baseline; verification includes new files and skips deleted files.
- Shared Manrope semibold heading styling on Services and Expertise cards.
- Shared navigation data, current page/section indicators, visible keyboard focus, mobile Escape
  handling and reset when returning to desktop.

Validated with the full verification script, sitemap XML and contrast checks, plus desktop,
tablet and mobile browser review. Deployed on 9 November 2026.

The remaining items above are queued. Recheck the repository before starting each item.

## Deployed 9 November: service visuals

- Illustrations for Financial Technology, AI, Software and Cloud, with related Home/Services symbols.
- Distinct split, reversed and wide hero compositions within the shared brand.
- Editorial banking experience and Cloud capability rows, an open AI research section and
  horizontal Software delivery stages. Approved service copy is preserved.
- Full verification and responsive browser checks passed; ready for user review and later
  illustration refinement. Deployed on 9 November 2026.

## Contact form: 12 November

- The user confirmed that Postmark is working and contact enquiries are being delivered.
- Local layout fix: move Turnstile below the privacy text, add 24px spacing above it, use the normal
  horizontal widget when the form has at least 300px available and compact mode otherwise.
- Resizing replaces the widget only when its size mode changes and requires a fresh verification
  token. A pending submission completes before the size changes.
- The missing space in “our privacy notice” is corrected.
- All 23 contact tests and the full verification script pass. Browser layout checks used
  Cloudflare's official dummy sitekey in a temporary local build; no test email was sent.
- Deployment status is tracked through the GitHub pull request and Cloudflare Pages checks.
