import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// SQLite (desarrollo):   DATABASE_URL="file:./dev.db"
// PostgreSQL (producción): DATABASE_URL="postgresql://user:pass@localhost:5432/transit_ai"
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --transpile-only --project tsconfig.json prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
