import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { preferenceService } from "../services/preference.service";
import { AppError } from "../utils/AppError";

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
    const prefs = await preferenceService.getForUser(req.user!.id);
    res.status(200).json({ success: true, data: { inApp: prefs.inApp, email: prefs.email, push: prefs.push, securityNotifEnabled: prefs.securityNotifEnabled } });
});

export const updateNotifications = catchAsync(async (req: Request, res: Response) => {
    const input = req.body as { inApp?: boolean; email?: boolean; push?: boolean; securityNotifEnabled?: boolean };
    
    if (input.securityNotifEnabled === false) {
        throw AppError.forbidden("Security notifications cannot be disabled");
    }
    
    const prefs = await preferenceService.updateForUser(req.user!.id, input);
    res.status(200).json({ success: true, data: { inApp: prefs.inApp, email: prefs.email, push: prefs.push, securityNotifEnabled: prefs.securityNotifEnabled } });
});
