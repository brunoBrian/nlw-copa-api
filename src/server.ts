import cors from "@fastify/cors"
import { PrismaClient } from "@prisma/client"
import Fastify from "fastify"
import z from "zod"
import ShortUniqueId from "short-unique-id"

const prisma = new PrismaClient({
  log: ['query'] // Log de todas as queries no termial
})

async function bootstrap() {
  const fastify = Fastify({
    logger: true
  })

  await fastify.register(cors, {
    origin: true // true qualquer aplicação acessa o back
  })

  fastify.get('/pools/count', () => {
    return prisma.pool.count()
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

  await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap()