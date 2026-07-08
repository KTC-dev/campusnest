import { ListingStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { uploadService } from "./upload.service";
import { notificationService } from "./notification.service";

interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  location: string;
  distanceFromCampusKm: number;
  bedrooms: number;
  bathrooms: number;
  roomType: string;
  genderRestriction: string;
  amenityIds: string[];
  images: string[];
  // Landlord affirmation before publishing
  ownerConfirmation?: boolean;
  isAvailable?: boolean;
}

interface UpdatePropertyInput extends Partial<Omit<CreatePropertyInput, "images">> {
  isAvailable?: boolean;
}

interface ListFilters {
  universitySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistanceKm?: number;
  gender?: string;
  roomType?: string;
  amenityIds?: string[];
  availableOnly?: boolean;
  page: number;
  pageSize: number;
}

const publicPropertyInclude = {
  images: { orderBy: { isPrimary: "desc" as const } },
  amenities: { include: { amenity: true } },
  university: { select: { id: true, name: true } },
  landlord: { select: { firstName: true, lastName: true, businessName: true, isVerified: true, phone: true } },
};

class PropertyService {
  /** Landlords create listings in PENDING status; an admin must approve before it's publicly visible. */
  async create(landlordId: string, universityId: string, input: CreatePropertyInput) {
    const uploaded = await Promise.all(input.images.map((img) => uploadService.uploadImage(img)));

    return prisma.property.create({
      data: {
        landlordId,
        universityId,
        title: input.title,
        description: input.description,
        price: input.price,
        location: input.location,
        distanceFromCampusKm: input.distanceFromCampusKm,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        roomType: input.roomType as any,
        genderRestriction: input.genderRestriction as any,
        status: ListingStatus.PENDING,
        isAvailable: input.isAvailable ?? true,
        images: {
          create: uploaded.map((img, i) => ({ url: img.url, publicId: img.publicId, isPrimary: i === 0 })),
        },
        amenities: {
          create: input.amenityIds.map((amenityId) => ({ amenityId })),
        },
      },
      include: publicPropertyInclude,
    });
  }

  async update(propertyId: string, landlordId: string, input: UpdatePropertyInput) {
    const property = await this.assertOwnership(propertyId, landlordId);

    // Editing a listing sends it back to PENDING re-review, unless only
    // availability changed — a landlord toggling "no vacancy" shouldn't
    // have to wait for re-approval.
    const onlyAvailabilityChanged =
      Object.keys(input).length === 1 && Object.prototype.hasOwnProperty.call(input, "isAvailable");

    const { amenityIds, roomType, genderRestriction, ...scalarInput } = input;
    const data: Prisma.PropertyUpdateInput = {
      ...scalarInput,
      ...(roomType !== undefined ? { roomType: roomType as any } : {}),
      ...(genderRestriction !== undefined ? { genderRestriction: genderRestriction as any } : {}),
      ...(onlyAvailabilityChanged ? {} : { status: ListingStatus.PENDING, rejectionReason: null }),
      ...(amenityIds
        ? { amenities: { deleteMany: {}, create: amenityIds.map((amenityId) => ({ amenityId })) } }
        : {}),
    };

    return prisma.property.update({
      where: { id: property.id },
      data,
      include: publicPropertyInclude,
    });
  }

  async delete(propertyId: string, landlordId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: true },
    });
    if (!property || property.landlordId !== landlordId) {
      throw AppError.notFound("Listing not found");
    }

    await Promise.all(property.images.map((img) => uploadService.deleteImage(img.publicId).catch(() => undefined)));
    await prisma.property.delete({ where: { id: propertyId } });
  }

  async getById(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        ...publicPropertyInclude,
        reviews: { include: { student: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!property) throw AppError.notFound("Listing not found");
    return property;
  }

  /** Public search — only ever returns APPROVED, available-by-default listings. */
  async list(filters: ListFilters) {
    const where: Prisma.PropertyWhereInput = {
      status: ListingStatus.APPROVED,
      ...(filters.availableOnly !== false ? { isAvailable: true } : {}),
      ...(filters.universitySlug ? { university: { slug: filters.universitySlug } } : {}),
      ...(filters.gender ? { genderRestriction: { in: [filters.gender as any, "ANY"] } } : {}),
      ...(filters.roomType ? { roomType: filters.roomType as any } : {}),
      ...(filters.minPrice || filters.maxPrice
        ? { price: { gte: filters.minPrice ?? undefined, lte: filters.maxPrice ?? undefined } }
        : {}),
      ...(filters.maxDistanceKm ? { distanceFromCampusKm: { lte: filters.maxDistanceKm } } : {}),
      ...(filters.amenityIds?.length
        ? { amenities: { some: { amenityId: { in: filters.amenityIds } } } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: publicPropertyInclude,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.property.count({ where }),
    ]);

    return { items, total, page: filters.page, pageSize: filters.pageSize, totalPages: Math.ceil(total / filters.pageSize) };
  }

  async listForLandlord(landlordId: string) {
    return prisma.property.findMany({
      where: { landlordId },
      include: { images: true, university: { select: { id: true, name: true } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async listPendingForAdmin() {
    return prisma.property.findMany({
      where: { status: ListingStatus.PENDING },
      include: publicPropertyInclude,
      orderBy: { createdAt: "asc" },
    });
  }

  async moderate(propertyId: string, status: "APPROVED" | "REJECTED" | "SUSPENDED", rejectionReason?: string) {
    const property = await prisma.property.findUnique({ where: { id: propertyId }, include: { landlord: true } });
    if (!property) throw AppError.notFound("Listing not found");

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { status, rejectionReason: status === "REJECTED" ? rejectionReason ?? "Did not meet listing standards" : null },
    });

    await notificationService.notify({
      userId: property.landlord.userId,
      type: "LISTING_STATUS",
      title:
        status === "APPROVED" ? "Listing approved ✅" : status === "REJECTED" ? "Listing rejected" : "Listing suspended",
      body:
        status === "APPROVED"
          ? `"${property.title}" is now live and visible to students.`
          : status === "REJECTED"
            ? `"${property.title}" was rejected: ${rejectionReason ?? "did not meet listing standards"}`
            : `"${property.title}" has been suspended by an admin.`,
    });

    return updated;
  }

  async toggleFavourite(studentId: string, propertyId: string) {
    const existing = await prisma.favourite.findUnique({
      where: { studentId_propertyId: { studentId, propertyId } },
    });

    if (existing) {
      await prisma.favourite.delete({ where: { studentId_propertyId: { studentId, propertyId } } });
      return { favourited: false };
    }

    await prisma.favourite.create({ data: { studentId, propertyId } });
    return { favourited: true };
  }

  async listFavourites(studentId: string) {
    const favourites = await prisma.favourite.findMany({
      where: { studentId },
      include: { property: { include: publicPropertyInclude } },
      orderBy: { createdAt: "desc" },
    });
    return favourites.map((f) => f.property);
  }

  /** Public, unauthenticated counts for the landing page's stats section — deliberately minimal (no revenue/PII), safe to expose to anyone. */
  async getPublicStats() {
    const [studentsRegistered, verifiedProperties, verifiedLandlords, successfulBookings] = await Promise.all([
      prisma.student.count(),
      prisma.property.count({ where: { status: "APPROVED" } }),
      prisma.landlord.count({ where: { isVerified: true } }),
      prisma.booking.count({ where: { status: { in: ["APPROVED", "COMPLETED"] } } }),
    ]);
    return { studentsRegistered, verifiedProperties, verifiedLandlords, successfulBookings };
  }

  private async assertOwnership(propertyId: string, landlordId: string) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw AppError.notFound("Listing not found");
    if (property.landlordId !== landlordId) throw AppError.forbidden("You do not own this listing");
    return property;
  }
}

export const propertyService = new PropertyService();
