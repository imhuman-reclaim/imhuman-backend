
import { PrismaClient } from "@prisma/client"
import { Response } from 'express';

const prisma = new PrismaClient();


export const getUser = async (req: any, res: Response) => {
    const address = req.user;
    try{
        const user = await prisma.user.findFirst({ where: { walletAddress: address }, 
        include: {
            tasks: {
                include: {
                    task: true
                },
            },
            RewardsClaim: {
                include: {
                    reward: true
                },
        },
        } });
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch(error){
        res.status(500).json(error)
    }
}


export const updateReferralCode = async (req: any, res: Response) => {
    const address = req.user;
    const { referralCode } = req.body;
    try{
        if(!referralCode){
            return res.status(400).json({ error: 'Referral code is required' });
        }
        const validateReferralCode = await prisma.user.findFirst({ where: { referralCode } });
        if(!validateReferralCode){
            return res.status(404).json({ error: 'Invalid referral code' });
        }
        const checkIfUserAlreadyHasReferralCode = await prisma.user.findFirstOrThrow({ where: { walletAddress: address } });
        if(checkIfUserAlreadyHasReferralCode.referralCode){
            return res.status(400).json({ error: 'User already has a referral code' });
        }
        const user = await prisma.user.update({
            where: { walletAddress: address },
            data: { referralCode, referredBy: validateReferralCode.walletAddress }
        });
        res.status(200).json(user);
    }
    catch(error){
        res.status(500).json(error)
    }
}


