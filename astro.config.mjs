import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://nasa-impact.github.io',
  base: '/AI-Agents-for-Science/',
  integrations: [mdx()],
  output: 'static',
});
