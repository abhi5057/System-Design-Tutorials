import { Type } from '@sinclair/typebox';
export const TaskSchema = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    completed: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});
export const CreateTaskBody = Type.Object({
    title: Type.String({ minLength: 1 }),
});
export const UpdateTaskBody = Type.Object({
    title: Type.Optional(Type.String({ minLength: 1 })),
    completed: Type.Optional(Type.Boolean()),
});
export const TaskIdParams = Type.Object({
    id: Type.Number(),
});
//# sourceMappingURL=schemas.js.map