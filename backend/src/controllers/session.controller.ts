import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sessionService } from "../services/session.service";

export const listSessions = catchAsync(async (req: Request, res: Response) => {
    const sessions = await sessionService.listForUser(req.user!.id);
    res.status(200).json({ success: true, data: sessions });
});

export const revokeSession = catchAsync(async (req: Request, res: Response) => {
    await sessionService.revoke(req.user!.id, req.params.id);
    res.status(200).json({ success: true, data: null });
});

export const revokeAllOtherSessions = catchAsync(async (req: Request, res: Response) => {
    const keepId = req.body.keepId as string | undefined;
    await sessionService.revokeAllExcept(req.user!.id, keepId ?? null);
    res.status(200).json({ success: true, data: null });
});
