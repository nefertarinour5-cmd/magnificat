import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { requestSchema } from "@/lib/validators";
import {
  apiSuccess,
  apiError,
  apiZodError,
  handleApiError,
  rateLimit,
  getClientIp,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Non authentifié", 401, "UNAUTHORIZED");

    let requests;
    if (user.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: { userId: user.id },
      });
      if (!parent) return apiSuccess({ requests: [] });

      requests = await db.request.findMany({
        where: { parentId: parent.id },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              subject: true,
              city: true,
              phone: true,
              whatsapp: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: user.id },
      });
      if (!teacher) return apiSuccess({ requests: [] });

      requests = await db.request.findMany({
        where: { teacherId: teacher.id },
        include: {
          parent: {
            select: {
              id: true,
              fullName: true,
              city: true,
              phone: true,
              whatsapp: true,
              address: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Admin
      requests = await db.request.findMany({
        include: {
          parent: {
            select: {
              id: true,
              fullName: true,
              city: true,
              phone: true,
              whatsapp: true,
            },
          },
          teacher: {
            select: {
              id: true,
              fullName: true,
              subject: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }

    return apiSuccess({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`request:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return apiError(
        "Trop de demandes envoyées. Patientez une minute.",
        429,
        "RATE_LIMIT"
      );
    }

    const user = await getCurrentUser();
    if (!user) return apiError("Non authentifié", 401, "UNAUTHORIZED");
    if (user.role !== "PARENT") {
      return apiError("Seuls les parents peuvent solliciter", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const data = requestSchema.parse(body);

    const parent = await db.parent.findUnique({
      where: { userId: user.id },
    });
    if (!parent) {
      return apiError("Profil parent incomplet", 400, "PARENT_PROFILE_REQUIRED");
    }

    const teacher = await db.teacher.findFirst({
      where: {
        id: data.teacherId,
        isPublished: true,
        isVerified: true,
      },
    });
    if (!teacher) {
      return apiError("Enseignant introuvable", 404, "NOT_FOUND");
    }

    // Check for duplicate active request
    const duplicate = await db.request.findFirst({
      where: {
        parentId: parent.id,
        teacherId: teacher.id,
        status: { in: ["PENDING", "CONTACTED", "SCHEDULED"] },
      },
    });
    if (duplicate) {
      return apiError(
        "Vous avez déjà une demande active avec cet enseignant",
        409,
        "DUPLICATE_REQUEST"
      );
    }

    const req = await db.request.create({
      data: {
        parentId: parent.id,
        teacherId: teacher.id,
        message: data.message,
        priority: data.priority,
      },
    });

    // Notify the teacher
    await db.notification.create({
      data: {
        userId: teacher.userId,
        title: "Nouvelle demande de cours",
        message: `${parent.fullName} vous a sollicité pour ${teacher.subject}`,
        type: "new_request",
        link: "/dashboard/teacher",
      },
    });

    return apiSuccess({ request: req }, 201);
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
