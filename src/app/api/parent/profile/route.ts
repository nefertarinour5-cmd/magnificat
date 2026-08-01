import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parentProfileSchema } from "@/lib/validators";
import {
  apiSuccess,
  apiError,
  apiZodError,
  handleApiError,
} from "@/lib/api";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Non authentifié", 401, "UNAUTHORIZED");
    if (user.role !== "PARENT") {
      return apiError("Réservé aux parents", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const data = parentProfileSchema.parse(body);

    const parent = await db.parent.upsert({
      where: { userId: user.id },
      update: {
        fullName: data.fullName,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        city: data.city,
        address: data.address,
        need: data.need || null,
      },
      create: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        city: data.city,
        address: data.address,
        need: data.need || null,
      },
    });

    // Update user fields too
    await db.user.update({
      where: { id: user.id },
      data: {
        name: data.fullName,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
      },
    });

    return apiSuccess({ parent });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
