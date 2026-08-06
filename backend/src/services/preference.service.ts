import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

class PreferenceService {
    async getForUser(userId: string) {
        let prefs = await prisma.userPreference.findUnique({ where: { userId } });
        if (!prefs) {
            prefs = await prisma.userPreference.create({ data: { userId } });
        }
        return prefs;
    }

    async updateForUser(userId: string, input: { inApp?: boolean; email?: boolean; push?: boolean }) {
        const existing = await prisma.userPreference.findUnique({ where: { userId } });
        if (!existing) {
            const created = await prisma.userPreference.create({ data: { userId, ...input } as any });
            return created;
        }
        const updated = await prisma.userPreference.update({ where: { userId }, data: input as any });
        return updated;
    }
}

export const preferenceService = new PreferenceService();
