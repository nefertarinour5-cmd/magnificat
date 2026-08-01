import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { teacherApplicationSchema } from "@/lib/validators";
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
    const { getCurrentUser, requireRole } = await import("@/lib/auth");
    const user = await requireRole("ADMIN");

    const applications = await db.application.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        statusLogs: {
          orderBy: { changedAt: "desc" },
          take: 5,
        },
      },
    });

    return apiSuccess({ applications });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`application:${ip}`, 3, 60_000);
    if (!rl.allowed) {
      return apiError(
        "Trop de candidatures soumises. Patientez une minute.",
        429,
        "RATE_LIMIT"
      );
    }

    const body = await request.json();
    const data = teacherApplicationSchema.parse(body);

    // Check if email already has a pending application
    const existing = await db.application.findFirst({
      where: {
        email: data.email,
        status: { in: ["PENDING", "INTERVIEW"] },
      },
    });

    if (existing) {
      return apiError(
        "Une candidature est déjà en cours de traitement avec cet email.",
        409,
        "DUPLICATE_APPLICATION"
      );
    }

    const application = await db.application.create({
      data: {
        ...data,
        whatsapp: data.whatsapp || null,
        commune: data.commune || null,
        age: data.age ?? null,
        methods: JSON.stringify(data.methods),
        languages: JSON.stringify(data.languages),
      },
    });

    // Log status change
    await db.applicationStatusLog.create({
      data: {
        applicationId: application.id,
        status: "PENDING",
        note: "Candidature soumise",
      },
    });

    return apiSuccess({ application }, 201);
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
