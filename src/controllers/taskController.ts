import { Request, Response } from 'express';
import { Reclaim, } from '@reclaimprotocol/js-sdk'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const APP_ID = process.env.APP_ID || '';
const APP_SECRET = process.env.APP_SECRET || '';
const callbackURL = 'https://api.reclaimapi.com/verifyProof';
// tasks

export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await prisma.task.findMany();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
};



export const updateTask = async (req: any, res: Response) => {
    const address = req.user;
    const { taskId } = req.body;
    try{
        if(!taskId){
            return res.status(400).json({ error: 'Task id is required' });
        }
        const task = await prisma.task.findFirst({ where: { id: taskId } });
        if(!task){
            return res.status(404).json({ error: 'Task not found' });
        }
        const user = await prisma.user.findFirst({ where: { walletAddress: address } });
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        const userTask = await prisma.userTask.create({
            data: {
            sessionId: new Date().getTime().toString(),
              completedAt: new Date(),
                taskId,
                userId: user.id,
            }
        });

        await prisma.user.update({
            where: { walletAddress: address },
            data: { xp: user.xp + task.expPoints }
        });
        res.status(200).json(userTask);
    }
    catch(error){
        res.status(500).json(error)
    }
}


export const GenerateProof = async (req: Request, res: Response) => {
    try {
        const { walletAddress, typeId } = req.query as { walletAddress: string, typeId: string }
        if(!walletAddress || !typeId){
            return res.status(400).json({ error: 'Wallet address and type are required' })
        }
        const validateTask = await prisma.task.findFirst({ where: { id: typeId } });
        if(!validateTask){
            return res.status(404).json({ error: 'Task not found' });
        }


        const reclaimClient = new Reclaim.ProofRequest(APP_ID);

        await reclaimClient.setAppCallbackUrl(`${callbackURL}`)
        await reclaimClient.buildProofRequest(validateTask?.providerId!)
        await reclaimClient.addContext('walletAddress', walletAddress)
        await reclaimClient.setSignature(
              await reclaimClient.generateSignature(
                APP_SECRET
            )
        )
        const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest()
        const sessionId = await reclaimClient.sessionId;
        const update = await prisma.userTask.create({
            data: {
                sessionId,
                taskId: typeId,
                userId: walletAddress
            }
        })
        console.log(`Proof request created for sessionId: ${update}`)
        res.status(200).json({ requestUrl, statusUrl })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}

export const VerifyProof = async (req: Request, res: Response) => {
    try{
            const sessionId = req.query.callbackId as string
            const proof = JSON.parse(decodeURIComponent(req.body))
           
            const isProofVerified = await Reclaim.verifySignedProof(proof)
            if (!isProofVerified) {
              return res.status(400).send({ message: 'Proof verification failed' })
            }
            console.log(`Proof verified for sessionId: ${sessionId}`)
            const proofData = await prisma.userTask.findFirst({ where: { sessionId: sessionId } })
            const task = await prisma.task.findFirst({ where: { id: proofData?.taskId } })
            if (!proofData) {
              return res.status(404).send({ message: 'No session found' })
            }
            await prisma.userTask.update({
                where: { id: proofData?.id },
                data: {
                    proof: JSON.stringify(proof),
                    completedAt: new Date(),
                }
            })
            await prisma.user.update({
                where: { walletAddress: proofData.userId },
                data: { xp: {
                    increment: task?.expPoints
                }}
            })
            return res.status(200).send({ message: 'Proof verification successful' })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ error: error })
    }
}
