// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// keystatic admin (/keystatic) is dev-only: local mode edits files on disk,
// and its server routes would otherwise force an adapter on the static build
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), react(), ...(isDev ? [keystatic()] : [])],
  vite: {
    plugins: [tailwindcss()],
  },
});