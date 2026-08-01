import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaLog: Prisma.PrismaClientOptions["log"] =
  process.env.NODE_ENV === "development"
    ? ["query", "warn", "error"]
    : ["error"];

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: prismaLog,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
