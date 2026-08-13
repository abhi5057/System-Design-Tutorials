import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import {
  TaskSchema,
  CreateTaskBody,
  UpdateTaskBody,
  TaskIdParams,
  type CreateTaskBodyType,
  type UpdateTaskBodyType,
  type TaskIdParamsType
} from './schemas.js'

const prisma = new PrismaClient()
const fastify = Fastify({ logger: true })

await fastify.register(cors, {
  origin: true
})

fastify.post<{ Body: CreateTaskBodyType }>(
  '/tasks',
  {
    schema: {
      body: CreateTaskBody,
      response: { 201: TaskSchema }
    }
  },
  async (request, reply) => {
    const { title } = request.body
    const task = await prisma.task.create({
      data: { title }
    })
    return reply.code(201).send(task)
  }
)

fastify.get(
  '/tasks',
  {
    schema: {
      response: { 200: { type: 'array', items: TaskSchema } }
    }
  },
  async (request, reply) => {
    const tasks = await prisma.task.findMany()
    return tasks
  }
)

fastify.get<{ Params: TaskIdParamsType }>(
  '/tasks/:id',
  {
    schema: {
      params: TaskIdParams,
      response: { 200: TaskSchema }
    }
  },
  async (request, reply) => {
    const { id } = request.params
    const task = await prisma.task.findUnique({
      where: { id: Number(id) } // In Fastify with TypeBox validation & coercion, it might already be a number depending on config, but safe to cast or enforce
    })
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }
    return task
  }
)

fastify.put<{ Params: TaskIdParamsType; Body: UpdateTaskBodyType }>(
  '/tasks/:id',
  {
    schema: {
      params: TaskIdParams,
      body: UpdateTaskBody,
      response: { 200: TaskSchema }
    }
  },
  async (request, reply) => {
    const { id } = request.params
    const { title, completed } = request.body
    try {
      const task = await prisma.task.update({
        where: { id: Number(id) },
        data: {
          ...(title !== undefined && { title }),
          ...(completed !== undefined && { completed })
        }
      })
      return task
    } catch (err) {
      return reply.code(404).send({ error: 'Task not found or update failed' })
    }
  }
)

fastify.delete<{ Params: TaskIdParamsType }>(
  '/tasks/:id',
  {
    schema: {
      params: TaskIdParams
    }
  },
  async (request, reply) => {
    const { id } = request.params
    try {
      await prisma.task.delete({
        where: { id: Number(id) }
      })
      return reply.code(204).send()
    } catch (err) {
      return reply.code(404).send({ error: 'Task not found or delete failed' })
    }
  }
)

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3002
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Fastify server listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
