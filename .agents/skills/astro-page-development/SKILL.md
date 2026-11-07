---
name: astro-page-development
description: Implement or modify an Astro page or component while preserving the ModusFi design and static architecture.
---

# Astro page development

Use for Astro page/component tasks, not automatically for every request.

1. Read `AGENTS.md`, the relevant page/component, `src/layouts/BaseLayout.astro`, applicable styles and `docs/design-system.md`.
2. Identify the smallest change; confirm any content or design ambiguity that would materially affect the outcome.
3. Reuse existing layout and CSS patterns. Prefer static Astro markup and semantic HTML.
4. Preserve accessibility, responsive behaviour, performance and approved copy.
5. Format modified files with the configured Prettier Astro plugin.
6. Run `bash scripts/ai-checks.sh` and inspect `git diff`.
7. Report changed files, checks run and outstanding concerns. Do not commit or push without approval.
