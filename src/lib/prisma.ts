import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL est absent. Copiez .env.example vers .env, puis lancez docker compose.",
    );
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return { prisma: new PrismaClient({ adapter }), pool };
}

const cached = globalForPrisma.prisma
  ? { prisma: globalForPrisma.prisma, pool: globalForPrisma.pool }
  : createClient();

export const prisma = cached.prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = cached.prisma;
  globalForPrisma.pool = cached.pool;
}
