import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// rewards

const getAllRewards = async (req: Request, res: Response) => {
    try {
        const rewards = await prisma.reward.findMany();
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve rewards' });
    }
}

//user rewards

// Fetch all rewards for a specific user
export const getUserRewards = async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
  
    try {
      const userRewards = await prisma.userReward.findMany({
        where: { userId },
        include: { reward: true },
      });
  
      res.status(200).json(userRewards);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user rewards' });
    }
  };



  // Claim a reward for a user
export const claimReward = async (req: Request, res: Response) => {
    const { userId, rewardId } = req.body as { userId: string; rewardId: string };
  
    try {
      // Check if the reward exists
      const reward = await prisma.reward.findUnique({
        where: { id: rewardId },
      });
  
      if (!reward) {
        return res.status(404).json({ error: 'Reward not found' });
      }
  
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the user has enough XP
      if (user.xp < reward.expPoints) {
        return res.status(400).json({ error: 'Insufficient XP to claim reward' });
      }
  
      // Check if the reward has already been claimed by the user
      const existingUserReward = await prisma.userReward.findFirst({
        where: {
          userId,
          rewardId,
        },
      });
  
      if (existingUserReward) {
        return res.status(400).json({ error: 'Reward already claimed' });
      }
  
      // Claim the reward
      const userReward = await prisma.userReward.create({
        data: {
          userId,
          rewardId,
          claimedAt: new Date(),
        },
      });
  
      // Update the user's XP
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { decrement: reward.expPoints } },
      });
  
      res.status(201).json(userReward);
    } catch (error) {
      res.status(500).json({ error: 'Failed to claim reward' });
    }
  };
  

export { getAllRewards }