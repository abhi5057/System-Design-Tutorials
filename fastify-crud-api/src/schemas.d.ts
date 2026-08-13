import { type Static } from '@sinclair/typebox';
export declare const TaskSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    title: import("@sinclair/typebox").TString;
    completed: import("@sinclair/typebox").TBoolean;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export type Task = Static<typeof TaskSchema>;
export declare const CreateTaskBody: import("@sinclair/typebox").TObject<{
    title: import("@sinclair/typebox").TString;
}>;
export type CreateTaskBodyType = Static<typeof CreateTaskBody>;
export declare const UpdateTaskBody: import("@sinclair/typebox").TObject<{
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    completed: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type UpdateTaskBodyType = Static<typeof UpdateTaskBody>;
export declare const TaskIdParams: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
}>;
export type TaskIdParamsType = Static<typeof TaskIdParams>;
//# sourceMappingURL=schemas.d.ts.map