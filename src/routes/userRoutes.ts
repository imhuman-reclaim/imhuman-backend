import { Router, json } from 'express';
import { getUser } from '../controllers/userController';
import { getRefferalCounts, getUserAndPoints } from '../controllers/leaderboard'
import { isSignedIn } from '../middleware/auth';

const router = Router();

// router.post('/register', register);
router.use(json());
router.get('/',isSignedIn,getUser);
router.get('/leaderboard', getUserAndPoints);
router.get('/leaderboard/referral', getRefferalCounts);

export default router;
