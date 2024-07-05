import { Router } from 'express';
import { authenticateUser, generateNonce } from '../controllers/authController';

const router = Router();

router.post('/generate-nonce', generateNonce);
router.post('/verify', authenticateUser);

export default router;
