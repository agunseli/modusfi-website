import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({site:'https://modusfi.io',output:'static',integrations:[tailwind()]});
