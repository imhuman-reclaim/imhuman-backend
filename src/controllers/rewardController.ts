import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// // rewards

const getAllRewards = async (req: Request, res: Response) => {
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
        res.status(200).json(userReward);
    }
    catch(error){
        res.status(500).json(error)
    }
}

//   // Claim a reward for a user
// export const claimReward = async (req: Request, res: Response) => {
//     const { userId, rewardId } = req.body as { userId: string; rewardId: string };
  
//     try {
//       // Check if the reward exists
//       const reward = await prisma.reward.findUnique({
//         where: { id: rewardId },
//       });
  
//       if (!reward) {
//         return res.status(404).json({ error: 'Reward not found' });
//       }
  
//       // Check if the user exists
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//       });
  
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       // Check if the user has enough XP
//       if (user.xp < reward.expPoints) {
//         return res.status(400).json({ error: 'Insufficient XP to claim reward' });
//       }
  
//       // Check if the reward has already been claimed by the user
//       const existingUserReward = await prisma.userReward.findFirst({
//         where: {
//           userId,
//           rewardId,
//         },
//       });
  
//       if (existingUserReward) {
//         return res.status(400).json({ error: 'Reward already claimed' });
//       }
  
//       // Claim the reward
//       const userReward = await prisma.userReward.create({
//         data: {
//           userId,
//           rewardId,
//           claimedAt: new Date(),
//         },
//       });
  
//       // Update the user's XP
//       await prisma.user.update({
//         where: { id: userId },
//         data: { xp: { decrement: reward.expPoints } },
//       });
  
//       res.status(201).json(userReward);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to claim reward' });
//     }
//   };
  

// export { getAllRewards }


