import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import akdRefValidator from './integrations/akd-ref-validator.js';

export default defineConfig({
  site: 'https://nasa-impact.github.io',
  base: '/AI-Agents-for-Science/',
  integrations: [mdx(), akdRefValidator()],
  output: 'static',
});
