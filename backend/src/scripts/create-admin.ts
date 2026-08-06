import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "admin@edurus.com";
const PASSWORD = "Admin1234!";
const SALT_ROUNDS = 12;

async function main() {
    const existing = await prisma.user.findUnique({ where: { email: EMAIL } });

    if (existing) {
        if (existing.role === Role.ADMIN) {
            console.log("Admin already exists:", EMAIL);
            await prisma.$disconnect();
            return;
        }

        await prisma.user.update({
            where: { email: EMAIL },
            data: {
                role: Role.ADMIN,
                isVerified: true,
                isActive: true,
                acceptedTerms: true,
                acceptedTermsVersion: "1.0",
                acceptedTermsAt: new Date(),
                passwordHash: bcrypt.hashSync(PASSWORD, SALT_ROUNDS),
            },
        });

        await prisma.admin.upsert({
            where: { userId: existing.id },
            update: {},
            create: {
                userId: existing.id,
                firstName: "Admin",
                lastName: "User",
            },
        });

        console.log("Upgraded existing user to admin:", EMAIL);
    } else {
        const passwordHash = bcrypt.hashSync(PASSWORD, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email: EMAIL,
                passwordHash,
                role: Role.ADMIN,
                isVerified: true,
                isActive: true,
                acceptedTerms: true,
                acceptedTermsVersion: "1.0",
                acceptedTermsAt: new Date(),
                admin: {
                    create: {
                        firstName: "Admin",
                        lastName: "User",
                    },
                },
            },
        });

        console.log("Created admin user:", user.email);
    }

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("Failed to create admin:", err);
    process.exit(1);
});