import { Type, type Static } from '@sinclair/typebox'

export const TaskSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  completed: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})
export type Task = Static<typeof TaskSchema>

export const CreateTaskBody = Type.Object({
  title: Type.String({ minLength: 1 }),
})
export type CreateTaskBodyType = Static<typeof CreateTaskBody>

export const UpdateTaskBody = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1 })),
  completed: Type.Optional(Type.Boolean()),
})
export type UpdateTaskBodyType = Static<typeof UpdateTaskBody>

export const TaskIdParams = Type.Object({
  id: Type.Number(),
})
export type TaskIdParamsType = Static<typeof TaskIdParams>
