# ModusFi Website: Agent Instructions

## Purpose and positioning

ModusFi is a UK technology engineering consultancy with deep financial-services experience and applied-AI capability. The website presents its services, expertise, experience and approach to enterprise clients. Do not position ModusFi exclusively as a bank, fintech product or AI company.

Use British English. Write credible, concise copy. Follow `.cursor/rules/copy-authoring.mdc` for all copy changes, including its prohibition on em dashes and minimal correction/reporting requirements. Never invent clients, case studies, partnerships, certifications, performance figures or claims. Distinguish the founders’ prior experience (including Ecospend and its subsequent acquisition by Trustly) from work delivered by ModusFi. Do not introduce a Team page without approval.

## Repository and stack

- Astro 7, TypeScript, Tailwind CSS 4, static output, Node.js 24 LTS.
- Cloudflare is the intended hosting platform.
- Inspect `package.json`, `astro.config.mjs`, existing components and scripts before making changes. Repository files are the authority for current versions and implementation details.
- Prefer Astro and native web platform capabilities; minimise browser JavaScript and dependencies.
- Do not add React, a database, a CMS, authentication or a separate application backend without explicit approval.

## Design

- Wordmark: `modusfi.`; navy `#101D32`, turquoise `#00B3C6`.
- Headings: Manrope, generally 600. Body: Inter, generally 400.
- Clean, predominantly light layouts; restrained navy sections, generous whitespace, accessible contrast and subtle turquoise accents.
- Preserve existing design and content unless the task asks for a change. Consult `docs/design-system.md` and the relevant Cursor rules.

## Engineering

- Make the smallest coherent change. Inspect relevant files before editing.
- Use semantic HTML, accessible controls, responsive layouts, meaningful image alt text and visible keyboard focus.
- Reuse existing layouts, styles and patterns; avoid unnecessary abstractions, dependencies and unrelated formatting changes.
- Use the repository's Prettier configuration (including Astro support).
- Optimise images; avoid unnecessary scripts and client hydration.
- Never commit secrets or expose server credentials to client code.
- Validate untrusted input server-side; do not log sensitive form submissions.

## Contact form

Preserve the existing Contact Us form. Intended implementation: submit asynchronously to a Cloudflare-compatible server endpoint, validate on the server, protect against spam, and send through an approved transactional email provider. Keep credentials in server-side secrets. Do not implement a provider or incur paid-service costs without approval. Do not replace the form with `mailto:`.

## Working method

1. Inspect relevant files and clarify material ambiguities.
2. Explain significant architecture, security or cost decisions before implementation.
3. Implement only the requested scope.
4. Format modified files; run available checks and build.
5. Review `git diff` and report modified files, checks actually run, and any limitations.

Use feature branches (`feat/`, `fix/`, `chore/`, `docs/`). Do not commit to `main`, push, merge, delete branches, rewrite history, or perform destructive Git actions without explicit permission. Do not claim tests or visual checks passed unless executed.

## Further guidance

- `.cursor/rules/`: Cursor-specific guidance.
- `.agents/skills/`: reusable task workflows for compatible agents.
- `docs/architecture.md` and `docs/design-system.md`: project references.
- `scripts/ai-checks.sh`: local verification.

Treat these files as guidance, not as permission to change unrelated project behaviour. If a rule conflicts with the actual repository or user request, raise the discrepancy.
