import { Router } from 'express';
import { GenerateProof, VerifyProof, getAllTasks, updateTask } from '../controllers/taskController';
import { isSignedIn } from '../middleware/auth';

const router = Router();

// router.post('/complete-task', completeTask);

router.get('/',isSignedIn, getAllTasks);
router.post('/generate', isSignedIn, GenerateProof);
router.post('/verify', isSignedIn, VerifyProof);
router.post('/update', isSignedIn, updateTask);

export default router;
