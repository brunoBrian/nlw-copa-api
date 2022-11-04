import { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma";

export async function AuthRoutes(fastify: FastifyInstance) {
  fastify.get('/auth', async () => {
    const count = await prisma.user.count()

    return { count }
  })
}