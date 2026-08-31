import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { accommodationRequestService } from "../services/accommodation-request.service";

export const createAccommodationRequest = catchAsync(async (req: Request, res: Response) => {
  const request = await accommodationRequestService.create({
    ...req.body,
    studentId: req.user!.id,
  });
  res.status(201).json({ success: true, data: request });
});

export const listMyRequests = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const result = await accommodationRequestService.listForStudent(req.user!.id, page, pageSize);
  res.status(200).json({ success: true, data: result });
});

export const listOpenRequests = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const result = await accommodationRequestService.listOpenForAgents({
    universityId: req.query.universityId as string | undefined,
    roomType: req.query.roomType as string | undefined,
    minBudget: req.query.minBudget ? Number(req.query.minBudget) : undefined,
    maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : undefined,
    status: req.query.status as string | undefined,
    page,
    pageSize,
  });
  res.status(200).json({ success: true, data: result });
});

export const getAccommodationRequest = catchAsync(async (req: Request, res: Response) => {
  const request = await accommodationRequestService.getById(req.params.id, req.user!.id, req.user!.role);
  res.status(200).json({ success: true, data: request });
});

export const updateAccommodationRequest = catchAsync(async (req: Request, res: Response) => {
  const request = await accommodationRequestService.update(req.params.id, req.user!.id, req.user!.role, req.body);
  res.status(200).json({ success: true, data: request });
});

export const deleteAccommodationRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await accommodationRequestService.delete(req.params.id, req.user!.id, req.user!.role);
  res.status(200).json({ success: true, data: result });
});
