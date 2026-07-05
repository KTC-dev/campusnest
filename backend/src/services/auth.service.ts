import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

interface RegisterStudentInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId: string;
  phone?: string;
  acceptedTerms?: boolean;
  acceptedTermsVersion?: string;
  acceptedTermsAt?: string;
}

interface RegisterLandlordInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName?: string;
  acceptedTerms?: boolean;
  acceptedTermsVersion?: string;
  acceptedTermsAt?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Kept separate from the controller so this logic is reusable (e.g. from a
// future admin "create user" endpoint) and independently testable without
// spinning up Express.
class AuthService {
  async registerStudent(input: RegisterStudentInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError.conflict("An account with this email already exists");

    const university = await prisma.university.findUnique({ where: { id: input.universityId } });
    if (!university) throw AppError.badRequest("Selected university does not exist");

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: Role.STUDENT,
        acceptedTerms: input.acceptedTerms ?? false,
        acceptedTermsVersion: input.acceptedTermsVersion ?? null,
        acceptedTermsAt: input.acceptedTermsAt ? new Date(input.acceptedTermsAt) : null,
        student: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            universityId: input.universityId,
          },
        },
      },
      include: { student: true },
    });

    return this.issueTokensFor(user.id, user.role, user.email);
  }

  async listUniversities() {
    return prisma.university.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  async registerLandlord(input: RegisterLandlordInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError.conflict("An account with this email already exists");

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: Role.LANDLORD,
        acceptedTerms: input.acceptedTerms ?? false,
        acceptedTermsVersion: input.acceptedTermsVersion ?? null,
        acceptedTermsAt: input.acceptedTermsAt ? new Date(input.acceptedTermsAt) : null,
        landlord: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            businessName: input.businessName,
          },
        },
      },
      include: { landlord: true },
    });

    return this.issueTokensFor(user.id, user.role, user.email);
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Deliberately vague error message: don't reveal whether the email
    // exists, which would let attackers enumerate registered accounts.
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw AppError.forbidden("This account has been deactivated");
    }

    return this.issueTokensFor(user.id, user.role, user.email);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw AppError.unauthorized("Refresh token is no longer valid");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) {
      throw AppError.unauthorized("Account no longer available");
    }

    // Rotate: revoke the used refresh token and issue a fresh pair. This
    // limits the blast radius if a refresh token is ever stolen.
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    return this.issueTokensFor(user.id, user.role, user.email);
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }

  async acceptTerms(userId: string, acceptedTermsVersion: string) {
    const currentVersion = acceptedTermsVersion || "1.0";
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        acceptedTerms: true,
        acceptedTermsVersion: currentVersion,
        acceptedTermsAt: new Date(),
      },
    });

    return {
      acceptedTerms: updatedUser.acceptedTerms,
      acceptedTermsVersion: updatedUser.acceptedTermsVersion,
      acceptedTermsAt: updatedUser.acceptedTermsAt,
    };
  }

  private async issueTokensFor(id: string, role: Role, email: string): Promise<AuthTokens> {
    const accessToken = signAccessToken({ id, role, email });
    const refreshToken = signRefreshToken({ id });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // matches JWT_REFRESH_EXPIRES_IN default

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: id, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
