import { Request,Response, NextFunction } from "express";
import { verifyToken } from '../utils/jwt'



const isSignedIn = async(req: Request | any, res: Response, next: NextFunction) => {
    try{
        if(req.headers['authorization'] !== undefined) {
        const token = req.headers['authorization'].split(' ')[1]
        const decoded: any = await verifyToken(token)
        if(decoded?.address) {
            req.user = decoded?.address
            next()
        }
        else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
    }
    catch(error){
        res.status(401).json({ error: 'Unauthorized' });
    }
}

export {
    isSignedIn
}