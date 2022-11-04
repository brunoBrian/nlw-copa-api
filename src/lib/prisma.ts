import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ['query'] // Log de todas as queries no termial
})