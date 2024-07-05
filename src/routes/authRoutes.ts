import { Router, json } from 'express';
import { authenticateUser, generateNonce } from '../controllers/authController';

const router = Router();
router.use(json());
router.post('/generate-nonce', generateNonce);
router.post('/verify', authenticateUser);

export default router;
