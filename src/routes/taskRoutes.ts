import { Router } from 'express';
import { GenerateProof, VerifyProof, getAllTasks, updateTask } from '../controllers/taskController';

const router = Router();

// router.post('/complete-task', completeTask);

router.get('/', getAllTasks);
router.post('/generate', GenerateProof);
router.post('/verify', VerifyProof);
router.post('/update', updateTask);

export default router;
