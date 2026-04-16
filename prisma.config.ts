import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI commands (migrate dev, db push) use local SQLite file
    // Runtime code uses TURSO_DATABASE_URL via adapter-libsql
    url: process.env.LOCAL_DATABASE_URL!,
  },
});
