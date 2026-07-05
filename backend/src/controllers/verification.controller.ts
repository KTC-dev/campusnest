import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { verificationService } from "../services/verification.service";

export const submitVerification = catchAsync(async (req: Request, res: Response) => {
    const payload = { idDocument: req.body.idDocument, selfie: req.body.selfie, proofOfOwnership: req.body.proofOfOwnership, confirmation: req.body?.confirmation === true };
    const verification = await verificationService.submitVerification(req.user!.id, payload);
    res.status(201).json({ success: true, data: verification });
});

export const listVerifications = catchAsync(async (_req: Request, res: Response) => {
    const verifications = await verificationService.listVerifications();
    res.status(200).json({ success: true, data: verifications });
});

export const getVerification = catchAsync(async (req: Request, res: Response) => {
    const verification = await verificationService.getVerification(req.params.id);
    res.status(200).json({ success: true, data: verification });
});

export const approveVerification = catchAsync(async (req: Request, res: Response) => {
    const verification = await verificationService.approveVerification(req.params.id);
    res.status(200).json({ success: true, data: verification });
});

export const rejectVerification = catchAsync(async (req: Request, res: Response) => {
    const verification = await verificationService.rejectVerification(req.params.id, req.body?.adminNotes);
    res.status(200).json({ success: true, data: verification });
});
