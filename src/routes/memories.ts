import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    // Antes de qualquer requisição, verifica se o usuário está logado
    await request.jwtVerify() // Verifica se o token é válido
  })

  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub, // Somente as memórias do usuário logado
      },
      orderBy: { createdAt: 'asc' },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        except: memory.content.substring(0, 130).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      // Se a memória não for pública e o usuário logado não for o dono da memória retorna 401
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // coerce converte o valor que vier em isPublic para boolean
    })

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        isPublic,
        coverUrl,
        userId: request.user.sub,
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // coerce converte o valor que vier em isPublic para boolean
    })

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      // Busca a memória pelo id
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      // Se o usuário logado não for o dono da memória retorna 401
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    // Atualiza a memória caso o usuário logado seja o dono
    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        isPublic,
        coverUrl,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      // Busca a memória pelo id
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      // Se o usuário logado não for o dono da memória retorna 401
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    // Deleta a memória caso o usuário logado seja o dono
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
