import { Router, json } from "express";
import {
  authenticateUser,
  generateNonce,
  authenticateUserSolana,
} from "../controllers/authController";

const router = Router();
router.use(json());
router.post("/generate-nonce", generateNonce);
router.post("/verify", authenticateUser);
router.post("/solana-verify", authenticateUserSolana);

export default router;
