import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { userService } from "../services/user.service";

export const getMe = catchAsync(async (req: Request, res: Response) => {
    const profile = await userService.getProfile(req.user!.id);
    res.status(200).json({ success: true, data: profile });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
    const profile = await userService.updateProfile(req.user!.id, req.body);
    res.status(200).json({ success: true, data: profile });
});
