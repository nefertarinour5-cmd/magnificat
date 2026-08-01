import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiSuccess({ favorites: [] });
    if (user.role !== "PARENT") return apiSuccess({ favorites: [] });

    const parent = await db.parent.findUnique({
      where: { userId: user.id },
      include: {
        favorites: {
          include: {
            teacher: {
              select: {
                id: true,
                slug: true,
                fullName: true,
                subject: true,
                city: true,
                rating: true,
                publicRate: true,
                availability: true,
                level: true,
                specialty: true,
              },
            },
          },
        },
      },
    });

    if (!parent) return apiSuccess({ favorites: [] });

    return apiSuccess({
      favorites: parent.favorites.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        teacher: f.teacher,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Non authentifié", 401, "UNAUTHORIZED");
    if (user.role !== "PARENT") {
      return apiError("Réservé aux parents", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const { teacherId } = body as { teacherId?: string };
    if (!teacherId) return apiError("teacherId requis", 400);

    const parent = await db.parent.findUnique({ where: { userId: user.id } });
    if (!parent) return apiError("Profil parent requis", 400);

    const teacher = await db.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) return apiError("Enseignant introuvable", 404);

    try {
      const fav = await db.favorite.create({
        data: { parentId: parent.id, teacherId },
      });
      return apiSuccess({ favorite: fav, added: true }, 201);
    } catch {
      // Already exists - remove it (toggle)
      await db.favorite.delete({
        where: { parentId_teacherId: { parentId: parent.id, teacherId } },
      });
      return apiSuccess({ added: false });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
