import express, { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CREATE
app.post('/tasks', async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const task = await prisma.task.create({
      data: { title },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// READ (All)
app.get('/tasks', async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// READ (One)
app.get('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// UPDATE
app.put('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
      },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE
app.delete('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
