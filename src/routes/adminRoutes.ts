import { Router } from 'express';
import { addReward, addTask ,getAllUsers } from '../controllers/adminController'

const router = Router();

router.post('/addTask', addTask);

export default router;
