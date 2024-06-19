import { Router } from 'express';
import { getAllUsers, checkWalletAddress,getUserByWalletAddress } from '../controllers/userController';

const router = Router();

// router.post('/register', register);
router.get('/', getAllUsers);
router.get('/check-wallet/:walletAddress', checkWalletAddress);
router.get('/:walletAddress', getUserByWalletAddress);


export default router;
