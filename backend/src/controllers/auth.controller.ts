import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { authService } from "../services/auth.service";

// Controllers stay thin: parse the request, call the service, shape the
// response. All decision-making lives in the service layer.

export const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.registerStudent(req.body);
  res.status(201).json({ success: true, data: tokens });
});

export const registerLandlord = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.registerLandlord(req.body);
  res.status(201).json({ success: true, data: tokens });
});

export const listUniversities = catchAsync(async (_req: Request, res: Response) => {
  const universities = await authService.listUniversities();
  res.status(200).json({ success: true, data: universities });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const tokens = await authService.login(email, password);
  res.status(200).json({ success: true, data: tokens });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);
  res.status(200).json({ success: true, data: tokens });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  res.status(200).json({ success: true, data: null });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  // req.user is guaranteed by the `authenticate` middleware on this route.
  res.status(200).json({ success: true, data: req.user });
});

export const acceptTerms = catchAsync(async (req: Request, res: Response) => {
  const { acceptedTermsVersion } = req.body;
  const result = await authService.acceptTerms(req.user!.id, acceptedTermsVersion);
  res.status(200).json({ success: true, data: result });
});
