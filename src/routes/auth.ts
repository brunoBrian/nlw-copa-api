import { FastifyInstance } from "fastify";
import fetch from 'node-fetch';
import z from "zod"

import { authenticate } from "../lib/plugins/authenticate";

import { prisma } from "../lib/prisma";

export async function AuthRoutes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: [authenticate]
  }, async (request) => {
    return { user: request.user }
  })

  fastify.post('/users', async (request) => {
    const createUserBody = z.object({
      access_token: z.string()
    })

    const { access_token } = createUserBody.parse(request.body)

    console.log(access_token)

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

    const userData = await userResponse.json()

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    })

    const userInfo = userInfoSchema.parse(userData)

    // verifica se ja existe no BD
    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id
      }
    })

    //  se nao existir, cria um novo
    if(!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.picture,
        }
      })
    }

    const token = fastify.jwt.sign({
      name: userInfo.name,
      avatarUrl: userInfo.picture,
    }, {
      sub: user.id,
      expiresIn: '7 days'
    })

    return { token }
  })
}