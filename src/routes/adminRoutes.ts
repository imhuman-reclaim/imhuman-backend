import { Router, json } from 'express';
import { addReward, addTask } from '../controllers/adminController'
import { isAdmin } from '../middleware/isAdmin';

const router = Router();
// app.use(express.json());

router.use(json());
router.post('/task/add', isAdmin, addTask);
router.post('/reward/add', isAdmin, addReward);

export default router;
