import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Non authentifié", 401, "UNAUTHORIZED");
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        whatsapp: true,
        avatarUrl: true,
        isActive: true,
        parent: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            whatsapp: true,
            city: true,
            address: true,
            need: true,
          },
        },
        teacher: {
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
            isVerified: true,
            isPublished: true,
            isFeatured: true,
            availability: true,
            publicRate: true,
            viewCount: true,
            internalCredits: true,
          },
        },
      },
    });

    return apiSuccess({ user: fullUser });
  } catch (error) {
    return handleApiError(error);
  }
}
