import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// add tasks 
export const addTask = async (req: Request, res: Response) => {
    const { description, expPoints, type, providerId } = req.body;

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


export const getAllUsers = async (req: any, res: Response) => {
    try {
        // isAdmin middleware should be used before this
        const users = await prisma.user.findMany({})
        res.status(200).json({
            message: "Users fetched successfully",
            users: users
        })
    } catch (e) {
        res.status(500).json({
            message: "Something went wrong, couldn't fetch the users",
        })
    }
}

// add reward
export const addReward = async (req: Request, res: Response) => {
    const { description, expPoints, rewardType } = req.body;

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