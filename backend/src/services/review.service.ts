import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";

class ReviewService {
  async create(userId: string, propertyId: string, rating: number, comment?: string) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw AppError.forbidden("Only students can leave reviews");

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw AppError.notFound("Property not found");

    const existingReview = await prisma.review.findUnique({
      where: { studentId_propertyId: { studentId: student.id, propertyId } },
    });
    if (existingReview) throw AppError.conflict("You have already reviewed this property");

    const hasBooking = await prisma.booking.findFirst({
      where: { studentId: student.id, propertyId, status: "COMPLETED" },
    });
    if (!hasBooking) throw AppError.forbidden("You can only review properties you have booked");

    const review = await prisma.review.create({
      data: {
        studentId: student.id,
        propertyId,
        rating,
        comment,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, user: { select: { id: true, email: true } } } },
      },
    });

    const propertyForNotification = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { agentId: true, title: true },
    });

    if (propertyForNotification?.agentId) {
      await notificationService.notify({
        userId: propertyForNotification.agentId,
        type: "REVIEW_SUBMITTED",
        title: "New review received",
        body: `A student reviewed "${propertyForNotification.title}" (${rating} stars).`,
        actionUrl: `/properties/${propertyId}`,
      });
    }

    await this.updatePropertyAverageRating(propertyId);

    return review;
  }
  async getForProperty(propertyId: string, page = 1, pageSize = 20) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { propertyId, isApproved: true, isFlagged: false },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, user: { select: { id: true, email: true } } } },
        },
      }),
      prisma.review.count({ where: { propertyId, isApproved: true, isFlagged: false } }),
    ]);

    const averageRating = await this.getAverageRating(propertyId);

    return { reviews, total, page, pageSize, averageRating };
  }

  async getForStudent(userId: string) {
    const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
    if (!student) throw AppError.forbidden("Student profile not found");

    const review = await prisma.review.findFirst({
      where: { studentId: student.id },
      include: {
        property: { select: { id: true, title: true, location: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return review;
  }

  async getAverageRating(propertyId: string) {
    const result = await prisma.review.aggregate({
      where: { propertyId, isApproved: true, isFlagged: false },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: result._avg.rating ? Number(result._avg.rating.toFixed(1)) : 0,
      count: result._count.rating,
    };
  }

  async update(userId: string, reviewId: string, input: { rating?: number; comment?: string; isApproved?: boolean; isFlagged?: boolean; flaggedReason?: string; agentResponse?: string }) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw AppError.notFound("Review not found");

    const isAdmin = await this.isAdmin(userId);
    const isOwner = review.studentId === (await prisma.student.findUnique({ where: { userId }, select: { id: true } }))?.id;

    if (!isAdmin && !isOwner) throw AppError.forbidden("You cannot modify this review");

    const data: Record<string, unknown> = {};
    if (input.rating !== undefined) data.rating = input.rating;
    if (input.comment !== undefined) data.comment = input.comment;
    if (input.isApproved !== undefined) data.isApproved = input.isApproved;
    if (input.isFlagged !== undefined) data.isFlagged = input.isFlagged;
    if (input.flaggedReason !== undefined) data.flaggedReason = input.flaggedReason;
    if (input.agentResponse !== undefined) {
      data.agentResponse = input.agentResponse;
      data.agentRespondedAt = new Date();
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, user: { select: { id: true, email: true } } } },
      },
    });

    if (input.rating !== undefined) {
      await this.updatePropertyAverageRating(review.propertyId);
    }

    return updated;
  }

  async delete(userId: string, reviewId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw AppError.notFound("Review not found");

    const isAdmin = await this.isAdmin(userId);
    const isOwner = review.studentId === (await prisma.student.findUnique({ where: { userId }, select: { id: true } }))?.id;

    if (!isAdmin && !isOwner) throw AppError.forbidden("You cannot delete this review");

    await prisma.review.delete({ where: { id: reviewId } });
    await this.updatePropertyAverageRating(review.propertyId);
    return { success: true };
  }

  async voteHelpful(reviewId: string, helpful: boolean) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw AppError.notFound("Review not found");

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: helpful ? { increment: 1 } : review.helpfulCount,
        unhelpfulCount: !helpful ? { increment: 1 } : review.unhelpfulCount,
      },
    });

    return updated;
  }

  async listFlagged(page = 1, pageSize = 20) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { isFlagged: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          property: { select: { id: true, title: true } },
        },
      }),
      prisma.review.count({ where: { isFlagged: true } }),
    ]);

    return { reviews, total, page, pageSize };
  }

  private async updatePropertyAverageRating(_propertyId: string) {
    return;
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return user?.role === "ADMIN";
  }
}

export const reviewService = new ReviewService();
