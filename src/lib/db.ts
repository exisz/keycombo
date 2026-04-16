import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * Prisma client configured for Turso (libSQL) in production
 * and local SQLite in development.
 *
 * Usage:
 *   import { prisma } from "@/lib/db";
 *   const items = await prisma.item.findMany();
 *
 * NOTE: This file is only used when the site needs a database.
 * Static-only sites (output: "export") should NOT import this.
 * Remove output: "export" from next.config.ts before using.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // In production/preview on Vercel: use Turso via libsql adapter
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }

  // Local development: use local SQLite (no adapter needed)
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
