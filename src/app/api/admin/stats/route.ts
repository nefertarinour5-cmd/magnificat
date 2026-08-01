import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const [
      pendingApplications,
      publishedTeachers,
      activeParents,
      pendingRequests,
      totalTeachers,
      totalParents,
      totalRequests,
      recentApplications,
      recentRequests,
    ] = await Promise.all([
      db.application.count({ where: { status: "PENDING" } }),
      db.teacher.count({ where: { isPublished: true, isVerified: true } }),
      db.parent.count(),
      db.request.count({ where: { status: "PENDING" } }),
      db.teacher.count(),
      db.parent.count(),
      db.request.count(),
      db.application.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.request.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          parent: { select: { fullName: true, city: true } },
          teacher: { select: { fullName: true, subject: true } },
        },
      }),
    ]);

    // Stats by city
    const teachersByCityRaw = await db.teacher.groupBy({
      by: ["city"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    });

    const teachersBySubjectRaw = await db.teacher.groupBy({
      by: ["subject"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    });

    return apiSuccess({
      stats: {
        pendingApplications,
        publishedTeachers,
        activeParents,
        pendingRequests,
        totalTeachers,
        totalParents,
        totalRequests,
      },
      recentApplications,
      recentRequests,
      teachersByCity: teachersByCityRaw.map((c) => ({
        city: c.city,
        count: c._count.id,
      })),
      teachersBySubject: teachersBySubjectRaw.map((s) => ({
        subject: s.subject,
        count: s._count.id,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
