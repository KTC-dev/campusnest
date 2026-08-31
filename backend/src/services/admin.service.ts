import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

interface PaginationInput {
  page: number;
  pageSize: number;
}

class AdminService {
  async getStats() {
    const [totalStudents, totalAgents, totalProperties, pendingApprovals, totalBookings, approvedBookings] =
      await Promise.all([
        prisma.student.count(),
        prisma.agent.count(),
        prisma.property.count(),
        prisma.property.count({ where: { status: "PENDING" } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "APPROVED" } }),
      ]);

    return {
      totalUsers: totalStudents + totalAgents,
      totalStudents,
      totalAgents,
      totalProperties,
      pendingApprovals,
      totalBookings,
      approvedBookings,
      revenue: 0, // placeholder until a payment provider is integrated
    };
  }

  /** Listings created per day over the trailing 30 days — feeds the admin dashboard's activity chart. */
  async getListingsTrend() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const properties = await prisma.property.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    return this.bucketByDay(properties.map((p) => p.createdAt), since);
  }

  /** Bookings created per day over the trailing 30 days. */
  async getBookingsTrend() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    return this.bucketByDay(bookings.map((b) => b.createdAt), since);
  }

  async listStudents({ page, pageSize }: PaginationInput) {
    const [items, total] = await Promise.all([
      prisma.student.findMany({
        include: { user: { select: { email: true, isActive: true, createdAt: true } }, university: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.student.count(),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async listAgents({ page, pageSize }: PaginationInput) {
    const [items, total] = await Promise.all([
      prisma.agent.findMany({
        include: {
          user: { select: { email: true, isActive: true, createdAt: true } },
          _count: { select: { properties: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.agent.count(),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async listBookings({ page, pageSize }: PaginationInput) {
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        include: {
          property: { select: { title: true } },
          student: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count(),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /** Deactivating a user (rather than deleting) preserves their listings/bookings for audit history and blocks login without destroying data. */
  async setUserActive(userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");
    if (user.role === "ADMIN") throw AppError.forbidden("Admin accounts cannot be deactivated from this panel");

    return prisma.user.update({ where: { id: userId }, data: { isActive } });
  }

  /** Hard-remove a listing flagged as fraudulent. Unlike moderate("REJECTED"), this permanently deletes it and its images. */
  async removeFraudulentListing(propertyId: string) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw AppError.notFound("Listing not found");
    await prisma.property.delete({ where: { id: propertyId } });
  }

  private bucketByDay(dates: Date[], since: Date) {
    const buckets = new Map<string, number>();
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      buckets.set(d.toISOString().split("T")[0], 0);
    }
    for (const date of dates) {
      const key = date.toISOString().split("T")[0];
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
  }
}

export const adminService = new AdminService();

