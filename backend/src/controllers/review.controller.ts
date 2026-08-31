import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { reviewService } from "../services/review.service";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, rating, comment } = req.body;
  const review = await reviewService.create(req.user!.id, propertyId, rating, comment);
  res.status(201).json({ success: true, data: review });
});

export const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const result = await reviewService.getForProperty(req.params.propertyId, page, pageSize);
  res.status(200).json({ success: true, data: result });
});

export const getMyReview = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewService.getForStudent(req.user!.id);
  res.status(200).json({ success: true, data: review });
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewService.update(req.user!.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: review });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.delete(req.user!.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const voteHelpful = catchAsync(async (req: Request, res: Response) => {
  const { helpful } = req.body;
  const review = await reviewService.voteHelpful(req.params.id, helpful);
  res.status(200).json({ success: true, data: review });
});

export const listFlaggedReviews = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const result = await reviewService.listFlagged(page, pageSize);
  res.status(200).json({ success: true, data: result });
});
