import { Router, json } from 'express';
import { claimReward, getAllRewards } from '../controllers/rewardController';
import { isSignedIn } from '../middleware/auth';

const router = Router();

// router.post('/claim-reward', claimReward);
router.use(json());
router.get('/', isSignedIn, getAllRewards);
router.post('/claim', isSignedIn, claimReward);
export default router;
 