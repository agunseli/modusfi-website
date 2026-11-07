---
name: cloudflare-deployment
description: Prepare and verify preview or production deployment of the static ModusFi Astro website on Cloudflare.
---

# Cloudflare deployment

1. Inspect `package.json`, `astro.config.mjs`, deployment configuration and the current Cloudflare product choice (Pages vs Workers).
2. Confirm build command, output directory, Node version and any functions/runtime constraints from actual project configuration and current provider documentation when available.
3. Run `bash scripts/ai-checks.sh` and ensure the static build succeeds.
4. Identify required environment variables and secrets without printing values or committing them.
5. Explain proposed Git integration, preview deployments and domain routing before changing Cloudflare settings.
6. Deploy only with explicit permission and available access. Never claim deployment succeeded without verification.
7. Verify the preview URL, navigation, images, responsive behaviour and contact form (when enabled); document any checks not performed.
8. Keep production domain changes separate from a review/preview deployment unless specifically requested.
