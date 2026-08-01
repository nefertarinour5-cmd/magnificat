import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const requests = await db.request.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        parent: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            whatsapp: true,
            city: true,
            address: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            subject: true,
            city: true,
            phone: true,
          },
        },
      },
      take: 100,
    });

    return apiSuccess({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}
