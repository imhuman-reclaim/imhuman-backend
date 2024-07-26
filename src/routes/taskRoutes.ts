import { Router, json, text } from "express";
import {
  GenerateProof,
  VerifyProof,
  getAllTasks,
  updateTask,
} from "../controllers/taskController";
import { isSignedIn } from "../middleware/auth";

const router = Router();

// router.post('/complete-task', completeTask);

router.get("/", isSignedIn, json(), getAllTasks);
router.post("/generate", json(), isSignedIn, GenerateProof);
router.post("/verify", text({ type: "*/*" }), VerifyProof);
router.post("/update", json(), isSignedIn, updateTask);

export default router;
