import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { teacherUpdateSchema } from "@/lib/validators";
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
    if (user.role !== "TEACHER") {
      return apiError("Réservé aux enseignants", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const data = teacherUpdateSchema.parse(body);

    const teacher = await db.teacher.findUnique({
      where: { userId: user.id },
    });
    if (!teacher) return apiError("Profil introuvable", 404);

    const updated = await db.teacher.update({
      where: { id: teacher.id },
      data: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.methods !== undefined && {
          methods: JSON.stringify(data.methods),
        }),
        ...(data.languages !== undefined && {
          languages: JSON.stringify(data.languages),
        }),
        ...(data.availability !== undefined && { availability: data.availability }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp || null }),
      },
    });

    return apiSuccess({ teacher: updated });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
