import cors from "@fastify/cors"
import { PrismaClient } from "@prisma/client"
import Fastify from "fastify"

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

  await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap()