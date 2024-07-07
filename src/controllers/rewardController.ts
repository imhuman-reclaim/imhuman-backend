import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// // rewards

export const getAllRewards = async (_: Request, res: Response) => {
    try {
        const rewards = await prisma.reward.findMany();
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve rewards' });
    }
}

// //user rewards



export const claimReward = async (req: any, res: Response) => {
    const user = req.user
    const { rewardId } = req.body;
    try{
        if(!rewardId){
            return res.status(400).json({ error: 'Reward id is required' });
        }
        const reward = await prisma.reward.findFirst({ where: { id: rewardId } });
        if(!reward){
            return res.status(404).json({ error: 'Reward not found' });
        }
        const findUser = await prisma.user.findFirst({ where: { walletAddress: user } });
        if(!findUser){
            return res.status(404).json({ error: 'User not found' });
        }
        const eligibleForReward = await prisma.user.findFirst({ where: { walletAddress: user, xp: { gte: reward.expPoints } } });
        if(!eligibleForReward){
            return res.status(400).json({ error: 'Insufficient XP to claim reward' });
        }
        const userReward = await prisma.userReward.create({
            data: {
                rewardId,
                userId: findUser.id,
            }
        });
        if(!userReward){
            return res.status(500).json({ error: 'Failed to claim reward' });
        }
        await prisma.user.update({
            where: { walletAddress: user },
            data: { RewardsClaim: {
                connect: { id: userReward.id }
            } }
        });
        res.status(200).json(userReward);
    }
    catch(error){
        res.status(500).json(error)
    }
}
