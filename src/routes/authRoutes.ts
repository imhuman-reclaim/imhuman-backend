import { Router } from 'express';
import { authenticate } from '../controllers/authController';

const router = Router();

router.post('/auth', authenticate);

export default router;
