import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const teacher = await db.teacher.findFirst({
      where: {
        AND: [
          { OR: [{ id }, { slug: id }] },
          { isPublished: true },
          { isVerified: true },
        ],
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
        phone: true,
        whatsapp: true,
        bio: true,
        methods: true,
        languages: true,
        rating: true,
        reviewsCount: true,
        availability: true,
        publicRate: true,
        isFeatured: true,
        isVerified: true,
        viewCount: true,
        createdAt: true,
        reviews: {
          where: { isApproved: true },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            parent: {
              select: { fullName: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!teacher) {
      return apiError("Enseignant introuvable", 404, "NOT_FOUND");
    }

    // Increment view count (fire-and-forget)
    db.teacher
      .update({
        where: { id: teacher.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return apiSuccess({
      teacher: {
        ...teacher,
        methods: JSON.parse(teacher.methods || "[]"),
        languages: JSON.parse(teacher.languages || "[]"),
        // Hide direct contact until parent is authenticated - frontend will decide
        // But we still return it because the solicit modal will use it
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
