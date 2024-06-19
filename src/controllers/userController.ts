
import { PrismaClient } from "@prisma/client"
import { Response } from 'express';

const prisma = new PrismaClient();



export const register = async (req: any, res: Response) => {
    const { walletAddress,  referredBy } = req.body;
  
    const referralCode = Math.random().toString(36).substr(2, 9).toUpperCase();
  
    try {
      const user = await prisma.user.create({
        data: {
          walletAddress,
          referredBy,
          referralCode,
        },
      });
      res.status(201).json({data:user});
    } catch (error:any) {
      res.status(400).json({ error: error.message });
    }
  };


const getAllUsers = async (req: any, res: Response) => {
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

const checkWalletAddress = async (req: any, res: Response) => {
    const { walletAddress } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { walletAddress },
        });

        if (user) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

const getUserByWalletAddress = async (req: any, res: Response) => {
    const { walletAddress } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { walletAddress },
        });

        if (user) {
            return res.status(200).json(user);
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
};


export { getAllUsers, checkWalletAddress, getUserByWalletAddress }