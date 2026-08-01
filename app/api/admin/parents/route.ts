import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const parents = await db.parent.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        whatsapp: true,
        city: true,
        address: true,
        need: true,
        createdAt: true,
        user: {
          select: { email: true, isActive: true, lastLoginAt: true },
        },
        _count: {
          select: { requests: true, reviews: true, favorites: true },
        },
      },
      take: 100,
    });

    return apiSuccess({ parents });
  } catch (error) {
    return handleApiError(error);
  }
}
