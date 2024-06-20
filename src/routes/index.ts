import { Router } from 'express';
import userRoutes from './userRoutes';
import taskRoutes from './taskRoutes';
import rewardRoutes from './rewardRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/user',userRoutes);
router.use(authRoutes);
router.use(taskRoutes);
router.use(rewardRoutes);
router.use('/admin', adminRoutes)

export default router;
