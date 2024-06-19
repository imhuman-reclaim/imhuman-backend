import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

export const authenticate = async (req: Request, res: Response) => {
  const { walletAddress, signature } = req.body;

  try {
    const message = "Authenticate";
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};
