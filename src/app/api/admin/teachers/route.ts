import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { teacherAdminUpdateSchema } from "@/lib/validators";
import {
  apiSuccess,
  apiError,
  apiZodError,
  handleApiError,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const teachers = await db.teacher.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        fullName: true,
        specialty: true,
        level: true,
        subject: true,
        experienceYears: true,
        city: true,
        commune: true,
        phone: true,
        whatsapp: true,
        bio: true,
        rating: true,
        reviewsCount: true,
        availability: true,
        hourlyRate: true,
        publicRate: true,
        internalCredits: true,
        isVerified: true,
        isFeatured: true,
        isPublished: true,
        viewCount: true,
        createdAt: true,
        user: {
          select: { email: true, isActive: true, lastLoginAt: true },
        },
      },
    });

    return apiSuccess({ teachers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole("ADMIN");
    const body = await request.json();
    const data = teacherAdminUpdateSchema.parse(body);

    const teacher = await db.teacher.findUnique({
      where: { id: data.teacherId },
    });
    if (!teacher) return apiError("Enseignant introuvable", 404);

    const updated = await db.teacher.update({
      where: { id: data.teacherId },
      data: {
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.publicRate !== undefined && { publicRate: data.publicRate }),
        ...(data.internalCredits !== undefined && {
          internalCredits: data.internalCredits,
        }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.isVerified !== undefined && { isVerified: data.isVerified }),
      },
    });

    await db.adminLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE_TEACHER",
        entity: "Teacher",
        entityId: teacher.id,
        details: JSON.stringify(data),
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

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireRole("ADMIN");
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("id");
    if (!teacherId) return apiError("id requis", 400);

    // Soft delete - unpublish instead of hard delete
    const teacher = await db.teacher.update({
      where: { id: teacherId },
      data: { isPublished: false },
    });

    await db.adminLog.create({
      data: {
        userId: admin.id,
        action: "UNPUBLISH_TEACHER",
        entity: "Teacher",
        entityId: teacherId,
      },
    });

    return apiSuccess({ teacher });
  } catch (error) {
    return handleApiError(error);
  }
}
