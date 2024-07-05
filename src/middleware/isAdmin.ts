import { Request,Response, NextFunction } from "express";



export const isAdmin = async(req: Request | any, res: Response, next: NextFunction) => {
    try{
        if(req.headers['authorization'] !== undefined) {
        const token = req.headers['authorization']
        if(token !== process.env.ADMIN_TOKEN) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next()
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
    }
    catch(error){
        res.status(401).json({ error: 'Unauthorized' });
    }
}
