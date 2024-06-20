import { Router } from 'express';
import { checkWalletAddress,getUserByWalletAddress } from '../controllers/userController';

const router = Router();

// router.post('/register', register);
router.get('/check-wallet/:walletAddress', checkWalletAddress);
router.get('/:walletAddress', getUserByWalletAddress);


export default router;
