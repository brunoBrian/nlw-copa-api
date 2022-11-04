import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import z from "zod"

import { prisma } from "../lib/prisma"

export async function PoolRoutes(fastify: FastifyInstance) {
  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()

    return { count }
  })

  fastify.get('/pools', () => {
    return prisma.pool.findMany()
  })

  fastify.post('/pools', async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string()
    })

    const { title } = createPoolBody.parse(request.body);
    const generateCode = new ShortUniqueId({ length: 6 })
    const code = String(generateCode()).toUpperCase()


    await prisma.pool.create({
      data: {
        title,
        code
      }
    })

    return reply.status(201).send({
      code
    })
  })
}