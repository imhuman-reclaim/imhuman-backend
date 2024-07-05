import { Router, json } from 'express';
import { getUser } from '../controllers/userController';
import { isSignedIn } from '../middleware/auth';

const router = Router();

// router.post('/register', register);
router.use(json());
router.get('/',isSignedIn,getUser);


export default router;
