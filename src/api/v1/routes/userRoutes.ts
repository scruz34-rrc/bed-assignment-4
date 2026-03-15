import express from "express";
import { signInHandler } from "../controllers/userController";

const router = express.Router();

router.post("/signIn", signInHandler);

export default router;