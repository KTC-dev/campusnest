import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { propertyService } from "../services/property.service";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/prisma";

// Small local helpers rather than a shared "attachProfile" middleware:
// only property/booking/roommate routes need the profile id, and keeping
// the lookup here makes the dependency obvious at the call site.
async function requireLandlordId(userId: string) {
  const landlord = await prisma.landlord.findUnique({ where: { userId } });
  if (!landlord) throw AppError.forbidden("Landlord profile not found");
  return landlord.id;
}

async function requireStudentId(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw AppError.forbidden("Student profile not found");
  return student.id;
}

export const createProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = await requireLandlordId(req.user!.id);

  // A listing is scoped to whichever university it serves. Phase 1 seeds a
  // single university (FUO), so we default to it here; once a second
  // university exists, the create form gains a universityId field and this
  // default is replaced by req.body.universityId.
  const university = await prisma.university.findFirstOrThrow();

  const property = await propertyService.create(landlordId, university.id, req.body);
  res.status(201).json({ success: true, data: property });
});

export const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = await requireLandlordId(req.user!.id);
  const property = await propertyService.update(req.params.id, landlordId, req.body);
  res.status(200).json({ success: true, data: property });
});

export const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = await requireLandlordId(req.user!.id);
  await propertyService.delete(req.params.id, landlordId);
  res.status(200).json({ success: true, data: null });
});

export const getProperty = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.getById(req.params.id);
  res.status(200).json({ success: true, data: property });
});

export const listProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.list(req.query as any);
  res.status(200).json({ success: true, data: result });
});

export const listMyProperties = catchAsync(async (req: Request, res: Response) => {
  const landlordId = await requireLandlordId(req.user!.id);
  const properties = await propertyService.listForLandlord(landlordId);
  res.status(200).json({ success: true, data: properties });
});

export const listPendingProperties = catchAsync(async (_req: Request, res: Response) => {
  const properties = await propertyService.listPendingForAdmin();
  res.status(200).json({ success: true, data: properties });
});

export const moderateProperty = catchAsync(async (req: Request, res: Response) => {
  const { status, rejectionReason } = req.body;
  const property = await propertyService.moderate(req.params.id, status, rejectionReason);
  res.status(200).json({ success: true, data: property });
});

export const toggleFavourite = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const result = await propertyService.toggleFavourite(studentId, req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const listFavourites = catchAsync(async (req: Request, res: Response) => {
  const studentId = await requireStudentId(req.user!.id);
  const favourites = await propertyService.listFavourites(studentId);
  res.status(200).json({ success: true, data: favourites });
});

export const listAmenities = catchAsync(async (_req: Request, res: Response) => {
  const amenities = await prisma.amenity.findMany({ orderBy: { name: "asc" } });
  res.status(200).json({ success: true, data: amenities });
});

export const getPublicStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await propertyService.getPublicStats();
  res.status(200).json({ success: true, data: stats });
});
