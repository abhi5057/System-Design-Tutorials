export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
}

export interface UpdateTaskPayload {
  title?: string;
  completed?: boolean;
}

// Example of a union type for task statuses if we were to expand on it, avoiding `any` or `unknown`
export type TaskFilter = 'ALL' | 'COMPLETED' | 'PENDING';

export interface APIErrorResponse {
  error: string;
}
