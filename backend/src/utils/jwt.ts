import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export interface AccessTokenPayload {
  id: string;
  role: Role;
  email: string;
}

export interface RefreshTokenPayload {
  id: string;
}

// Short-lived access token: sent on every request, kept in memory on the
// client. Long-lived refresh token: stored httpOnly, used only to mint new
// access tokens. This split limits the damage window if an access token
// leaks (e.g. via XSS) while keeping the user logged in for longer.
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
