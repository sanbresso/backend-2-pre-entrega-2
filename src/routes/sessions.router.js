import { Router } from "express";
import { getSessionsInfo, registerUser } from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", getSessionsInfo);
router.post("/register", registerUser);

export default router;