import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";
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
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    if (!teacherId) return apiError("teacherId requis", 400);

    const reviews = await db.review.findMany({
      where: { teacherId, isApproved: true },
      include: {
        parent: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return apiSuccess({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`review:${ip}`, 3, 60_000);
    if (!rl.allowed) {
      return apiError("Trop d'avis soumis. Patientez.", 429, "RATE_LIMIT");
    }

    const user = await getCurrentUser();
    if (!user) return apiError("Non authentifié", 401, "UNAUTHORIZED");
    if (user.role !== "PARENT") {
      return apiError("Seuls les parents peuvent laisser un avis", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const data = reviewSchema.parse(body);

    const parent = await db.parent.findUnique({ where: { userId: user.id } });
    if (!parent) return apiError("Profil parent requis", 400);

    // Check if parent has actually had a request with this teacher
    const hasRequest = await db.request.findFirst({
      where: { parentId: parent.id, teacherId: data.teacherId },
    });
    if (!hasRequest) {
      return apiError(
        "Vous devez avoir sollicité cet enseignant pour laisser un avis",
        403,
        "NO_REQUEST_HISTORY"
      );
    }

    // Check for existing review (one per parent per teacher)
    const existing = await db.review.findUnique({
      where: {
        parentId_teacherId: {
          parentId: parent.id,
          teacherId: data.teacherId,
        },
      },
    });
    if (existing) {
      return apiError("Vous avez déjà laissé un avis", 409, "ALREADY_REVIEWED");
    }

    const review = await db.review.create({
      data: {
        parentId: parent.id,
        teacherId: data.teacherId,
        rating: data.rating,
        comment: data.comment || null,
        isApproved: false, // Requires admin approval
      },
    });

    return apiSuccess(
      { review, message: "Avis soumis, en attente de validation" },
      201
    );
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
