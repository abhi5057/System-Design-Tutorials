import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Task, TaskFilter, CreateTaskPayload, UpdateTaskPayload } from './types';
import './App.css';

const API_URL = 'http://localhost:3002/tasks';

function App() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<TaskFilter>('ALL');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');

  const { data: tasks, isLoading, error } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await axios.get<Task[]>(API_URL);
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await axios.post<Task>(API_URL, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTaskTitle('');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateTaskPayload }) => {
      const response = await axios.put<Task>(`${API_URL}/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreateTask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate({ title: newTaskTitle });
  }, [newTaskTitle, createTaskMutation]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    switch (filter) {
      case 'COMPLETED':
        return tasks.filter((t) => t.completed);
      case 'PENDING':
        return tasks.filter((t) => !t.completed);
      case 'ALL':
      default:
        return tasks;
    }
  }, [tasks, filter]);

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error fetching tasks: {error.message}</div>;

  return (
    <div className="App" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Fastify Tasks</h1>

      <form onSubmit={handleCreateTask} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title"
          style={{ flexGrow: 1, padding: '8px' }}
        />
        <button type="submit" disabled={createTaskMutation.isPending}>
          {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setFilter('ALL')} style={{ fontWeight: filter === 'ALL' ? 'bold' : 'normal' }}>All</button>
        <button onClick={() => setFilter('PENDING')} style={{ fontWeight: filter === 'PENDING' ? 'bold' : 'normal' }}>Pending</button>
        <button onClick={() => setFilter('COMPLETED')} style={{ fontWeight: filter === 'COMPLETED' ? 'bold' : 'normal' }}>Completed</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredTasks.map((task) => (
          <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid #ccc', marginBottom: '10px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => updateTaskMutation.mutate({ id: task.id, payload: { completed: !task.completed } })}
                disabled={updateTaskMutation.isPending}
              />
              <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                {task.title}
              </span>
            </div>
            <button
              onClick={() => deleteTaskMutation.mutate(task.id)}
              disabled={deleteTaskMutation.isPending}
              style={{ color: 'red', cursor: 'pointer' }}
            >
              Delete
            </button>
          </li>
        ))}
        {filteredTasks.length === 0 && <p>No tasks found.</p>}
      </ul>
    </div>
  );
}

export default App;
