import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { adminService } from "../services/admin.service";
import { propertyService } from "../services/property.service";

export const getStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await adminService.getStats();
  res.status(200).json({ success: true, data: stats });
});

export const getAnalytics = catchAsync(async (_req: Request, res: Response) => {
  const [listingsTrend, bookingsTrend] = await Promise.all([
    adminService.getListingsTrend(),
    adminService.getBookingsTrend(),
  ]);
  res.status(200).json({ success: true, data: { listingsTrend, bookingsTrend } });
});

export const listStudents = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.listStudents(req.query as any);
  res.status(200).json({ success: true, data: result });
});

export const listLandlords = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.listLandlords(req.query as any);
  res.status(200).json({ success: true, data: result });
});

export const listBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.listBookings(req.query as any);
  res.status(200).json({ success: true, data: result });
});

export const listPendingProperties = catchAsync(async (_req: Request, res: Response) => {
  const properties = await propertyService.listPendingForAdmin();
  res.status(200).json({ success: true, data: properties });
});

export const setUserActive = catchAsync(async (req: Request, res: Response) => {
  const user = await adminService.setUserActive(req.params.userId, req.body.isActive);
  res.status(200).json({ success: true, data: user });
});

export const removeFraudulentListing = catchAsync(async (req: Request, res: Response) => {
  await adminService.removeFraudulentListing(req.params.id);
  res.status(200).json({ success: true, data: null });
});
