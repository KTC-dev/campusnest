import { prisma } from "../config/prisma";

class SessionService {
    async listForUser(userId: string) {
        return prisma.refreshToken.findMany({ where: { userId, revoked: false }, orderBy: { createdAt: "desc" } });
    }

    async revoke(userId: string, tokenId: string) {
        const token = await prisma.refreshToken.findUnique({ where: { id: tokenId } });
        if (!token || token.userId !== userId) throw new Error("Invalid token");
        await prisma.refreshToken.update({ where: { id: tokenId }, data: { revoked: true } });
    }

    async revokeAllExcept(userId: string, keepId: string | null) {
        // If keepId is null, revoke all tokens for userId. Otherwise revoke all except keepId.
        if (!keepId) {
            await prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
            return;
        }
        await prisma.refreshToken.updateMany({ where: { userId, id: { not: keepId } as any }, data: { revoked: true } });
    }
}

export const sessionService = new SessionService();
