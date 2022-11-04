import cors from "@fastify/cors"
import Fastify from "fastify"

import { AuthRoutes, GameRoutes, GuessRoutes, PoolRoutes, UserRoutes } from "./routes"

async function bootstrap() {
  const fastify = Fastify({
    logger: true
  })

  await fastify.register(cors, {
    origin: true // true qualquer aplicação acessa o back
  })

  await fastify.register(PoolRoutes)
  await fastify.register(GameRoutes)
  await fastify.register(UserRoutes)
  await fastify.register(GuessRoutes)
  await fastify.register(AuthRoutes)

  await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap()