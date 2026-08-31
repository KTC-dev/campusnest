import { z } from "zod";

const roomTypeEnum = z.enum(["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL"]);
const genderEnum = z.enum(["MALE", "FEMALE", "ANY"]);

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(2000),
    price: z.coerce.number().positive(),
    location: z.string().min(2),
    distanceFromCampusKm: z.coerce.number().nonnegative(),
    bedrooms: z.coerce.number().int().positive(),
    bathrooms: z.coerce.number().int().positive(),
    roomType: roomTypeEnum,
    genderRestriction: genderEnum.default("ANY"),
    amenityIds: z.array(z.string()).default([]),
    // Base64 data URLs or remote URLs; the upload service normalizes either.
    images: z.array(z.string()).min(1, "At least one image is required").max(10),
    ownerConfirmation: z.boolean().refine((value) => value === true, {
      message: "You must confirm you have the right to advertise this property",
    }),
    estimatedMoveInCost: z.coerce.number().optional(),
    agentFee: z.coerce.number().optional(),
    legalFee: z.coerce.number().optional(),
    cautionFee: z.coerce.number().optional(),
    serviceCharge: z.coerce.number().optional(),
    electricityNote: z.string().optional(),
    waterNote: z.string().optional(),
    internetNote: z.string().optional(),
    securityNote: z.string().optional(),
    rulesNotes: z.string().optional(),
    furnished: z.boolean().optional(),
    hasGenerator: z.boolean().optional(),
    hasInverter: z.boolean().optional(),
    hasSolar: z.boolean().optional(),
    hasBorehole: z.boolean().optional(),
    hasSecurity: z.boolean().optional(),
    hasGate: z.boolean().optional(),
    hasWifi: z.boolean().optional(),
    allowsCooking: z.boolean().optional(),
    allowsVisitors: z.boolean().optional(),
    allowsGenerator: z.boolean().optional(),
    allowsAppliances: z.boolean().optional(),
    hasCurfew: z.boolean().optional(),
    propertyCondition: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(10).max(2000).optional(),
    price: z.coerce.number().positive().optional(),
    location: z.string().min(2).optional(),
    distanceFromCampusKm: z.coerce.number().nonnegative().optional(),
    bedrooms: z.coerce.number().int().positive().optional(),
    bathrooms: z.coerce.number().int().positive().optional(),
    roomType: roomTypeEnum.optional(),
    genderRestriction: genderEnum.optional(),
    isAvailable: z.boolean().optional(),
    amenityIds: z.array(z.string()).optional(),
    estimatedMoveInCost: z.coerce.number().optional(),
    agentFee: z.coerce.number().optional(),
    legalFee: z.coerce.number().optional(),
    cautionFee: z.coerce.number().optional(),
    serviceCharge: z.coerce.number().optional(),
    electricityNote: z.string().optional(),
    waterNote: z.string().optional(),
    internetNote: z.string().optional(),
    securityNote: z.string().optional(),
    rulesNotes: z.string().optional(),
    furnished: z.boolean().optional(),
    hasGenerator: z.boolean().optional(),
    hasInverter: z.boolean().optional(),
    hasSolar: z.boolean().optional(),
    hasBorehole: z.boolean().optional(),
    hasSecurity: z.boolean().optional(),
    hasGate: z.boolean().optional(),
    hasWifi: z.boolean().optional(),
    allowsCooking: z.boolean().optional(),
    allowsVisitors: z.boolean().optional(),
    allowsGenerator: z.boolean().optional(),
    allowsAppliances: z.boolean().optional(),
    hasCurfew: z.boolean().optional(),
    propertyCondition: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

export const listPropertiesSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    universitySlug: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    maxDistanceKm: z.coerce.number().nonnegative().optional(),
    gender: genderEnum.optional(),
    roomType: roomTypeEnum.optional(),
    amenityIds: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((v) => (v ? (Array.isArray(v) ? v : [v]) : undefined)),
    availableOnly: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(12),
  }),
  params: z.object({}).optional(),
});

export const moderatePropertySchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
    rejectionReason: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
