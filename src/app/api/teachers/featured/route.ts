import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleApiError, rateLimit, getClientIp } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`featured:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      return apiSuccess({ teachers: [] });
    }

    const teachers = await db.teacher.findMany({
      where: {
        isPublished: true,
        isVerified: true,
        isFeatured: true,
      },
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
        bio: true,
        rating: true,
        reviewsCount: true,
        availability: true,
        publicRate: true,
        methods: true,
        languages: true,
      },
      orderBy: [{ rating: "desc" }, { reviewsCount: "desc" }],
      take: 6,
    });

    return apiSuccess({
      teachers: teachers.map((t) => ({
        ...t,
        methods: JSON.parse(t.methods || "[]"),
        languages: JSON.parse(t.languages || "[]"),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
