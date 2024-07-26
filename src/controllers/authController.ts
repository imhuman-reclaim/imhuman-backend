import { Request, Response } from "express";
import { ethers, uuidV4, randomBytes } from "ethers";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt";
const prisma = new PrismaClient();

// register user
export const generateNonce = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;

  try {
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }
    const nonce = await uuidV4(randomBytes(16));
    const loadNonce = await prisma.nonce.findFirst({
      where: { walletAddress, isUsed: false },
    });
    let id;
    if (loadNonce) {
      id = await prisma.nonce.update({
        where: { id: loadNonce.id },
        data: { nonce },
      });
    } else {
      id = await prisma.nonce.create({ data: { walletAddress, nonce } });
    }
    res.status(200).json({
      id: id?.id,
      nonce: `Welcome to ImHuman\n\nClick to sign in.\n\nThis request does not trigger any transaction or cost any fees.\n\nWallet Address: ${walletAddress}\n\nNonce: ${nonce}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const verifySCWSign = async (
  sign: string,
  message: string,
  walletAddress: string
) => {
  try {
    const response = await fetch(
      `https://api.connect.cometh.io/wallets/${walletAddress}/is-valid-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.COMETH_API_KEY!,
        },
        body: JSON.stringify({
          signature: sign,
          message: message,
        }),
      }
    );
    const data = await response.json();
    if (!data.success) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

// authenticate user
export const authenticateUser = async (req: Request, res: Response) => {
  const { id, signature } = req.body;
  try {
    if (!id || !signature) {
      return res.status(400).json({ error: "id and signature is required" });
    }
    const nonce = await prisma.nonce.findFirst({
      where: { id, isUsed: false },
    });
    if (!nonce) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const message = `Welcome to ImHuman\n\nClick to sign in.\n\nThis request does not trigger any transaction or cost any fees.\n\nWallet Address: ${nonce?.walletAddress}\n\nNonce: ${nonce?.nonce}`;
    const referralCode = uuidV4(randomBytes(16)).slice(0, 6);

    if (signature.length !== 132) {
      const isValid = await verifySCWSign(
        signature,
        message,
        nonce?.walletAddress
      );
      if (!isValid) {
        return res.status(400).json({ error: "Invalid signature" });
      }
    } else {
      //const message = `Welcome to ImHuman\n\nClick to sign in.\n\nThis request does not trigger any transaction or cost any fees.\n\n\n\nWallet Address: 0xE855027BB11E4820D302956143333c80A02142B1\n\nNonce: 23437498-3d0c-4690-a14c-cd9bac6474ef`
      const recoveredAddress = ethers.verifyMessage(message, signature);
      console.log(recoveredAddress);
      if (
        recoveredAddress?.toLocaleLowerCase() !==
        nonce?.walletAddress?.toLocaleLowerCase()
      ) {
        return res.status(400).json({ error: "Invalid signature" });
      }
    }
    const token = await generateToken({ address: nonce?.walletAddress });
    await prisma.nonce.update({ where: { id }, data: { isUsed: true } });
    const user = await prisma.user.findFirst({
      where: { walletAddress: nonce?.walletAddress },
    });
    if (!user) {
      await prisma.user.create({
        data: {
          walletAddress: nonce?.walletAddress,
          referralCode: referralCode,
        },
      });
    }
    return res.status(200).json({ token, isFirstTime: !user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error);
  }
};

export const authenticateUserSolana = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  try {
    // const message = `Welcome to ImHuman\n\nClick to sign in.\n\nThis request does not trigger any transaction or cost any fees.\n\nWallet Address: ${nonce?.walletAddress}\n\nNonce: ${nonce?.nonce}`;
    const referralCode = uuidV4(randomBytes(16)).slice(0, 6);

    const token = generateToken({ address: walletAddress });
    const user = await prisma.user.findFirst({
      where: { walletAddress: walletAddress },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          walletAddress: walletAddress,
          referralCode: referralCode,
        },
      });
    }

    return res.status(200).json({ token, isFirstTime: !user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error);
  }
};
