import { PrismaClient } from "@prisma/client";

// Prisma Client 싱글톤
let prisma;

export const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return prisma;
};

// Graceful shutdown
export const disconnectDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect();
    console.log("🔌 Database disconnected");
  }
};
