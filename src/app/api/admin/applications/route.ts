import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const applications = await db.application.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        statusLogs: {
          orderBy: { changedAt: "desc" },
          take: 5,
        },
        reviewer: {
          select: { name: true },
        },
      },
      take: 100,
    });

    return apiSuccess({ applications });
  } catch (error) {
    return handleApiError(error);
  }
}
