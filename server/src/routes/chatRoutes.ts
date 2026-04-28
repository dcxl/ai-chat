import { Router } from "express";
import { chat } from "../controllers/chatController";
import { sessions } from "../controllers/sessionController";
import { getEnabledModels } from "../config/models";
import {
  createKnowledgeCtrl,
  listKnowledgesCtrl,
  deleteKnowledgeCtrl,
  uploadDocumentCtrl,
  addTextCtrl,
  addURLCtrl,
  upload,
} from "../controllers/knowledgeController";

const router = Router();

// Chat
router.post("/chat", chat);
router.get("/sessions", sessions);
router.get("/models", (_req, res) => {
  res.json(getEnabledModels());
});

// Knowledge base
router.post("/knowledge", createKnowledgeCtrl);
router.get("/knowledge", listKnowledgesCtrl);
router.delete("/knowledge/:id", deleteKnowledgeCtrl);
router.post("/knowledge/:id/upload", upload.single("file"), uploadDocumentCtrl);
router.post("/knowledge/:id/text", addTextCtrl);
router.post("/knowledge/:id/url", addURLCtrl);

export default router;
