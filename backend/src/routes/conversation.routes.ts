import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import * as conversationController from "../controllers/conversation.controller";
import { createConversationSchema, idParamSchema, sendMessageSchema } from "../utils/validation/conversation.schema";

const router = Router();

router.use(authenticate);
router.post("", validate(createConversationSchema), conversationController.createConversation);
router.get("", conversationController.listConversations);
router.get("/:id", validate(idParamSchema), conversationController.getConversation);
router.post("/:id/messages", validate(sendMessageSchema), conversationController.sendMessage);
router.patch("/messages/:id/read", validate(idParamSchema), conversationController.markMessageRead);
router.delete("/:id", validate(idParamSchema), conversationController.archiveConversation);

export default router;
