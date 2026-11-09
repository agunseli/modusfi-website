import type { APIRoute } from 'astro';

// Discover the current static Astro pages at build time, including service details.
// Dynamic routes need explicit expansion if introduced in future.
const pages = Object.keys(import.meta.glob('./**/*.astro'));

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Set the canonical site URL before generating the sitemap.');

  const urls = pages.sort().map((page) => {
    const path = page
      .replace(/^\.\//, '')
      .replace(/\.astro$/, '')
      .replace(/(^|\/)index$/, '$1');
    const url = new URL(path ? `/${path.replace(/\/$/, '')}/` : '/', site);
    const escaped = url.href.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    return `  <url><loc>${escaped}</loc></url>`;
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
