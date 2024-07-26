import { Request, Response } from "express";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const APP_ID = process.env.APP_ID || "";
const APP_SECRET = process.env.APP_SECRET || "";
const callbackURL =
  "https://m8aanm1noe.execute-api.ap-southeast-1.amazonaws.com/api/task/verify";
// tasks

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
};

export const updateTask = async (req: any, res: Response) => {
  const address = req.user;
  const { taskId } = req.body;
  try {
    if (!taskId) {
      return res.status(400).json({ error: "Task id is required" });
    }
    const task = await prisma.task.findFirst({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (task.providerId !== "0x0") {
      return res.status(400).json({ error: "cannot update task" });
    }
    const user = await prisma.user.findFirst({
      where: { walletAddress: address },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isCompleted = await prisma.userTask.findFirst({
      where: { userId: user.id, taskId },
    });
    if (isCompleted) {
      return res.status(400).json({ error: "Task already completed" });
    }
    const userTask = await prisma.userTask.create({
      data: {
        sessionId: new Date().getTime().toString(),
        completedAt: new Date(),
        taskId,
        userId: user.id,
      },
    });
    if (!userTask) {
      return res.status(500).json({ error: "Failed to update task" });
    }

    await prisma.user.update({
      where: { walletAddress: address },
      data: {
        xp: user.xp + task.expPoints,
        tasks: {
          connect: { id: userTask?.id },
        },
      },
    });
    res.status(200).json(userTask);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const GenerateProof = async (req: any, res: Response) => {
  try {
    const walletAddress = req.user;
    const { taskId } = req.body as { taskId: string };
    if (!taskId) {
      return res.status(400).json({ error: "taskId are required" });
    }
    const validateTask = await prisma.task.findFirst({ where: { id: taskId } });
    if (!validateTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    const reclaimClient = new Reclaim.ProofRequest(APP_ID);
    await reclaimClient.setAppCallbackUrl(`${callbackURL}`);
    await reclaimClient.buildProofRequest(validateTask?.providerId!);
    await reclaimClient.addContext("walletAddress", walletAddress);
    await reclaimClient.setSignature(
      await reclaimClient.generateSignature(APP_SECRET)
    );
    const { requestUrl, statusUrl } =
      await reclaimClient.createVerificationRequest();
    const userId = await prisma.user.findFirst({ where: { walletAddress } });
    const sessionId = await reclaimClient.sessionId;
    const update = await prisma.userTask.create({
      data: {
        sessionId,
        taskId: taskId,
        userId: userId?.id!,
      },
    });
    console.log(`Proof request created for sessionId: ${update}`);
    res.status(200).json({ requestUrl, statusUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const VerifyProof = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.callbackId as string;
    const proof = JSON.parse(decodeURIComponent(req.body));

    const isProofVerified = await Reclaim.verifySignedProof(proof);
    if (!isProofVerified) {
      return res.status(400).send({ message: "Proof verification failed" });
    }
    console.log(`Proof verified for sessionId: ${sessionId}`);
    const proofData = await prisma.userTask.findFirst({
      where: { sessionId: sessionId },
    });
    if (proofData?.completedAt) {
      return res.status(400).send({ message: "Proof already verified" });
    }
    const task = await prisma.task.findFirst({
      where: { id: proofData?.taskId },
    });
    if (!proofData) {
      return res.status(404).send({ message: "No session found" });
    }
    await prisma.userTask.update({
      where: { id: proofData?.id },
      data: {
        proof: JSON.stringify(proof),
        completedAt: new Date(),
      },
    });
    await prisma.user.update({
      where: { id: proofData?.userId },
      data: {
        xp: {
          increment: task?.expPoints,
        },
      },
    });
    return res.status(200).send({ message: "Proof verification successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};
