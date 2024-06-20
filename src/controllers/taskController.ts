import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// tasks

export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await prisma.task.findMany();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
};





// userTasks

export const getAllTasksForUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // Fetch all tasks
        const tasks = await prisma.task.findMany();

        // Fetch user tasks to check completion status
        const userTasks = await prisma.userTask.findMany({
            where: { userId },
        });

        // Map tasks to include completion status
        const tasksWithStatus = tasks.map(task => {
            const userTask = userTasks.find(ut => ut.taskId === task.id);
            return {
                ...task,
                completed: !!userTask,
                completedAt: userTask?.completedAt || null,
            };
        });

        res.status(200).json(tasksWithStatus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
};

export const completeTaskForUser = async (req: Request, res: Response) => {
    const { userId, taskId, proof } = req.body as { userId: string; taskId: string, proof: string };

    try {
        const existingUserTask = await prisma.userTask.findFirst({
            where: {
                userId,
                taskId,
            },
        });

        if (existingUserTask) {
            return res.status(400).json({ error: 'Task already completed' });
        }


        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const userTask = await prisma.userTask.create({
            data: {
                userId,
                taskId,
                proof,
                completedAt: new Date(),
            },
        });

        // Increment user's XP by task's XP points
        await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: task.expPoints } },
        });

        res.status(201).json(userTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete task' });
    }
};

