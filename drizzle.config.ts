import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './backend/src/database/schema.ts',
  out: './data/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL']!,
  },
});
