import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: { host: true, port: 3000 },
  site: 'https://tuniwave.com',
  integrations: [
    react(),
    sitemap(),
  ],
  output: 'static',
  // relying on middleware for professional trailing slash redirection
  // trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      target: 'esnext'
    }
  },
  i18n: {
    defaultLocale: 'ar',
    locales: ['en', 'fr', 'ar'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
