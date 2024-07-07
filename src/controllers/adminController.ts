import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// add tasks 
export const addTask = async (req: Request, res: Response) => {
    const { description, expPoints, type, providerId } = req.body;
    if(!description || !expPoints || !type || !providerId) return res.status(400).json({ error: 'All fields are required' });

    try {
        const task = await prisma.task.create({
            data: {
                description,
                expPoints,
                type,
                providerId,
                createdAt: new Date(),
            },
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add task' });
    }
};


// add reward
export const addReward = async (req: Request, res: Response) => {
    const { description, expPoints, rewardType } = req.body;
    if(!description || !expPoints || !rewardType) return res.status(400).json({ error: 'All fields are required' });
    try {
        const reward = await prisma.reward.create({
            data: {
                rewardType,
                description,
                expPoints,
                createdAt: new Date(),
            },
        });

        res.status(201).json(reward);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add reward' });
    }
};