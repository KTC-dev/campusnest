import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { conversationService } from "../services/conversation.service";

export const createConversation = catchAsync(async (req: Request, res: Response) => {
    const conversation = await conversationService.createConversation(req.user!.id, req.body);
    res.status(201).json({ success: true, data: conversation });
});

export const listConversations = catchAsync(async (req: Request, res: Response) => {
    const conversations = await conversationService.listConversations(req.user!.id);
    res.status(200).json({ success: true, data: conversations });
});

export const getConversation = catchAsync(async (req: Request, res: Response) => {
    const conversation = await conversationService.getConversation(req.user!.id, req.params.id);
    res.status(200).json({ success: true, data: conversation });
});

export const listMessages = catchAsync(async (req: Request, res: Response) => {
    const messages = await conversationService.listMessages(req.user!.id, req.params.id, {
        cursor: typeof req.query.cursor === "string" ? req.query.cursor : undefined,
        limit: typeof req.query.limit === "string" ? Number(req.query.limit) : undefined,
    });
    res.status(200).json({ success: true, data: messages });
});

export const sendMessage = catchAsync(async (req: Request, res: Response) => {
    const message = await conversationService.sendMessage(req.user!.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: message });
});

export const uploadMessageFile = catchAsync(async (req: Request, res: Response) => {
    const uploaded = await conversationService.uploadMessageFile(req.user!.id, req.body);
    res.status(201).json({ success: true, data: uploaded });
});

export const markMessageRead = catchAsync(async (req: Request, res: Response) => {
    const message = await conversationService.markMessageAsRead(req.user!.id, req.params.id);
    res.status(200).json({ success: true, data: message });
});

export const archiveConversation = catchAsync(async (req: Request, res: Response) => {
    const conversation = await conversationService.archiveConversation(req.user!.id, req.params.id);
    res.status(200).json({ success: true, data: conversation });
});
