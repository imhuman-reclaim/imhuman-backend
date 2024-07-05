import { Router } from 'express';
import { addReward, addTask } from '../controllers/adminController'
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

router.post('/task/add', isAdmin, addTask);
router.post('/reward/add', isAdmin, addReward);

export default router;
