import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

interface UpdateProfileInput {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    faculty?: string | null;
    level?: string | null;
    avatarUrl?: string | null;
    businessName?: string | null;
    universityId?: string;
}

class UserService {
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                landlord: true,
                admin: true,
            },
        });

        if (!user) throw AppError.notFound("User not found");

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            student: user.student,
            landlord: user.landlord,
            admin: user.admin,
        };
    }

    async updateProfile(userId: string, input: UpdateProfileInput) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
        });

        if (!user) throw AppError.notFound("User not found");

        const roleSpecificData = this.buildRoleSpecificUpdate(user.role, input);

        if (Object.keys(roleSpecificData).length > 0) {
            if (user.role === Role.STUDENT) {
                await prisma.student.update({ where: { userId }, data: roleSpecificData });
            } else if (user.role === Role.LANDLORD) {
                await prisma.landlord.update({ where: { userId }, data: roleSpecificData });
            } else if (user.role === Role.ADMIN) {
                await prisma.admin.update({ where: { userId }, data: roleSpecificData });
            }
        }

        return this.getProfile(userId);
    }

    private buildRoleSpecificUpdate(role: Role, input: UpdateProfileInput) {
        const data: Record<string, unknown> = {};

        if (role === Role.STUDENT) {
            if (input.firstName !== undefined) data.firstName = input.firstName;
            if (input.lastName !== undefined) data.lastName = input.lastName;
            if (input.phone !== undefined) data.phone = input.phone;
            if (input.faculty !== undefined) data.faculty = input.faculty;
            if (input.level !== undefined) data.level = input.level;
            if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
            if (input.universityId !== undefined) data.universityId = input.universityId;
        }

        if (role === Role.LANDLORD) {
            if (input.firstName !== undefined) data.firstName = input.firstName;
            if (input.lastName !== undefined) data.lastName = input.lastName;
            if (input.phone !== undefined) data.phone = input.phone;
            if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
            if (input.businessName !== undefined) data.businessName = input.businessName;
        }

        if (role === Role.ADMIN) {
            if (input.firstName !== undefined) data.firstName = input.firstName;
            if (input.lastName !== undefined) data.lastName = input.lastName;
        }

        return data;
    }
}

export const userService = new UserService();
