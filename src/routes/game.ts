import { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma";

export async function GameRoutes(fastify: FastifyInstance) {
  fastify.get('/games/count', async () => {
    const count = await prisma.user.count()

    return { count }
  })
}