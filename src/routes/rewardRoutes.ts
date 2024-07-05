import { Router, json } from 'express';
import { claimReward } from '../controllers/rewardController';
import { isSignedIn } from '../middleware/auth';

const router = Router();

// router.post('/claim-reward', claimReward);
router.use(json());
router.get('/', isSignedIn, claimReward);
router.post('/claim', isSignedIn, claimReward);
export default router;
 