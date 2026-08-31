import { VerificationStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { uploadService } from "./upload.service";

interface SubmitVerificationInput {
    idDocument: string;
    selfie?: string;
    proofOfOwnership?: string;
    // Agent confirmation for authenticity
    confirmation?: boolean;
}

class VerificationService {
    async submitVerification(userId: string, input: SubmitVerificationInput) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
        if (!user) throw AppError.notFound("User not found");
        if (user.role !== "AGENT") throw AppError.forbidden("Only agents can submit verification requests");

        const agent = await prisma.agent.findUnique({ where: { userId }, select: { id: true } });

        const [idDocument, selfie, proofOfOwnership] = await Promise.all([
            uploadService.uploadImage(input.idDocument, "edurus/verification"),
            input.selfie ? uploadService.uploadImage(input.selfie, "edurus/verification") : Promise.resolve(null),
            input.proofOfOwnership ? uploadService.uploadImage(input.proofOfOwnership, "edurus/verification") : Promise.resolve(null),
        ]);

        return prisma.agentVerification.create({
            data: {
                userId,
                agentId: agent?.id,
                idDocumentUrl: idDocument.url,
                selfieUrl: selfie?.url,
                proofOfOwnershipUrl: proofOfOwnership?.url,
                status: VerificationStatus.PENDING,
                submitterConfirmation: input.confirmation ?? false,
            },
        });
    }

    async listVerifications() {
        return prisma.agentVerification.findMany({
            include: {
                user: { select: { email: true, role: true } },
                agent: { select: { id: true, businessName: true, firstName: true, lastName: true, isVerified: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async getMyVerification(userId: string) {
        return prisma.agentVerification.findFirst({
            where: { userId },
            include: {
                agent: { select: { id: true, businessName: true, firstName: true, lastName: true, isVerified: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getVerification(id: string) {
        const verification = await prisma.agentVerification.findUnique({
            where: { id },
            include: {
                user: { select: { email: true, role: true } },
                agent: { select: { id: true, businessName: true, firstName: true, lastName: true, isVerified: true } },
            },
        });

        if (!verification) throw AppError.notFound("Verification request not found");
        return verification;
    }

    async approveVerification(id: string) {
        const verification = await prisma.agentVerification.findUnique({ where: { id } });
        if (!verification) throw AppError.notFound("Verification request not found");

        const [updatedVerification] = await Promise.all([
            prisma.agentVerification.update({
                where: { id },
                data: {
                    status: VerificationStatus.VERIFIED,
                    reviewedAt: new Date(),
                    adminNotes: "Approved by admin",
                },
            }),
            prisma.agent.update({
                where: { userId: verification.userId },
                data: { isVerified: true },
            }).catch(() => undefined),
        ]);

        await prisma.user.update({ where: { id: verification.userId }, data: { isVerified: true } }).catch(() => undefined);

        return updatedVerification;
    }

    async rejectVerification(id: string, adminNotes?: string) {
        const verification = await prisma.agentVerification.findUnique({ where: { id } });
        if (!verification) throw AppError.notFound("Verification request not found");

        return prisma.agentVerification.update({
            where: { id },
            data: {
                status: VerificationStatus.REJECTED,
                reviewedAt: new Date(),
                adminNotes: adminNotes ?? "Rejected by admin",
            },
        });
    }
}

export const verificationService = new VerificationService();

