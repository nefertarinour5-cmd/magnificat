import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, isLocked, lockExpiry, SECURITY } from "@/lib/security";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import {
  apiSuccess,
  apiError,
  apiZodError,
  handleApiError,
  rateLimit,
  getClientIp,
} from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`login:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return apiError(
        "Trop de tentatives. Réessayez dans une minute.",
        429,
        "RATE_LIMIT"
      );
    }

    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return apiError("Email ou mot de passe incorrect", 401, "INVALID_CREDENTIALS");
    }

    if (isLocked(user)) {
      const mins = Math.ceil(
        (new Date(user.lockedUntil!).getTime() - Date.now()) / 60_000
      );
      return apiError(
        `Compte verrouillé. Réessayez dans ${mins} minute${mins > 1 ? "s" : ""}.`,
        423,
        "ACCOUNT_LOCKED"
      );
    }

    if (!user.isActive) {
      return apiError("Compte désactivé. Contactez l'administration.", 403, "ACCOUNT_DISABLED");
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      const failed = user.failedAttempts + 1;
      const shouldLock = failed >= SECURITY.MAX_ATTEMPTS;

      await db.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: failed,
          lockedUntil: shouldLock ? lockExpiry() : null,
        },
      });

      if (shouldLock) {
        return apiError(
          `Trop de tentatives. Compte verrouillé ${SECURITY.LOCK_MINUTES} minutes.`,
          423,
          "ACCOUNT_LOCKED"
        );
      }

      const remaining = SECURITY.MAX_ATTEMPTS - failed;
      return apiError(
        `Identifiants incorrects. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`,
        401,
        "INVALID_CREDENTIALS"
      );
    }

    await createSession(user.id, request);

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
