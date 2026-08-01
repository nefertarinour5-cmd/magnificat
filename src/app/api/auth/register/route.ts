import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  isLocked,
  lockExpiry,
  SECURITY,
} from "@/lib/security";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
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
    const rl = rateLimit(`register:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return apiError(
        "Trop de tentatives. Réessayez dans une minute.",
        429,
        "RATE_LIMIT"
      );
    }

    const body = await request.json();
    const data = registerSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existing = await db.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return apiError("Cet email est déjà utilisé", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        isActive: true,
        parent:
          data.role === "PARENT"
            ? {
                create: {
                  fullName: data.name,
                  phone: data.phone,
                  whatsapp: data.whatsapp || null,
                  city: "",
                  address: "",
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await createSession(user.id, request);

    return apiSuccess({ user }, 201);
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
