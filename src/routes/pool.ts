import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import z from "zod"
import { authenticate } from "../lib/plugins/authenticate"

import { prisma } from "../lib/prisma"

export async function PoolRoutes(fastify: FastifyInstance) {
  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()

    return { count }
  })

  fastify.get('/pools', {
    onRequest: [authenticate]
  }, (request) => {
    const pools = prisma.pool.findMany({
      where: {
        participants: {
          some: {
            userId: request.user.sub
          }
        },
      },
      include: {
        _count: {//adiciona contagem de participantes na resposta da pesquisa
          select: {
            participants: true
          }
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        owner: {
          select: { //adiciona essas propriedades na resposta da pesquisa
            id: true,
            name: true
          }
        }
      }
    })

    return pools;
  })

  fastify.post('/pools', async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string()
    })

    const { title } = createPoolBody.parse(request.body);
    const generateCode = new ShortUniqueId({ length: 6 })
    const code = String(generateCode()).toUpperCase()

    try {
      await request.jwtVerify()

       await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub
            }
          }
        }
      })
    } catch(err) {
      await prisma.pool.create({
        data: {
          title,
          code
        }
      })
    }

    return reply.status(201).send({
      code
    })
  })

  fastify.post('/pools/:id/join', {
    onRequest: [authenticate]
  }, async (request, reply) => {
    const createPoolJoinBody = z.object({
      code: z.string()
    })
    const { code } = createPoolJoinBody.parse(request.body);

    const pool = await prisma.pool.findUnique({
      where: {
        code
      },
      include: {
        participants: {
          where: {
            userId: request.user.sub
          }
        }
      }
    })

    if(!pool) {
      return reply.status(400).send({
        message: 'Pool not found'
      })
    }

    if(pool.participants.length > 0) {
      return reply.status(400).send({
        message: 'You already joined this pool'
      })
    }

    // coloca o primeiro usuario do bolao como dono (caso criar o bolao sem logar, caso da app web)
    if(!pool.ownerId) {
      await prisma.pool.update({
        where: {
          id: pool.id
        },
        data: {
          ownerId: request.user.sub
        }
      })
    }

    await prisma.participant.create({
      data: {
        poolId: pool.id,
        userId: request.user.sub
      }
    })

    return reply.status(201).send()
  })
}