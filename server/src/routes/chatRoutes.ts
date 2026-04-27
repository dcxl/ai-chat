import { Router } from "express";
import { chat } from "../controllers/chatController";
import { sessions } from "../controllers/sessionController";
import { getEnabledModels } from "../config/models";

const router = Router();
router.post("/chat", chat);
router.get("/sessions", sessions);
router.get("/models", (_req, res) => {
  res.json(getEnabledModels());
});
export default router;
