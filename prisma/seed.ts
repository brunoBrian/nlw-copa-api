import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Bruno Sousa',
      email: 'bruno@teste.com.br.',
      avatarUrl: 'https://github.com/brunoBrian.png',
    }
  })

  const pool = await prisma.pool.create({
    data: {
      title: 'Palmeiras x Flamego',
      code: 'BOL12345',
      ownerId: user.id,

      participants: {
        create: {
          userId: user.id
        }
      }
    }
  })

  await prisma.game.create({
    data: {
      date: '2022-11-03T18:34:27.072Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'BR'
    }
  })

   await prisma.game.create({
    data: {
      date: '2022-11-05T18:34:27.072Z',
      firstTeamCountryCode: 'AR',
      secondTeamCountryCode: 'BR',

      guesses: {
        create: {
          firstTeamPoints: 1,
          secondTeamPoints: 3,
          
          participant: {
            connect: {
              userId_poolId: {
                poolId: pool.id,
                userId: user.id
              }
            }
          }

        }
      }
    }
  })
}

main()