import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { applicationReviewSchema } from "@/lib/validators";
import {
  apiSuccess,
  apiError,
  apiZodError,
  handleApiError,
} from "@/lib/api";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("ADMIN");
    const body = await request.json();
    const data = applicationReviewSchema.parse(body);

    const application = await db.application.findUnique({
      where: { id: data.applicationId },
    });

    if (!application) {
      return apiError("Candidature introuvable", 404, "NOT_FOUND");
    }

    if (application.status !== "PENDING" && application.status !== "INTERVIEW") {
      return apiError(
        "Cette candidature a déjà été traitée",
        409,
        "ALREADY_REVIEWED"
      );
    }

    // Log the status change
    await db.applicationStatusLog.create({
      data: {
        applicationId: application.id,
        status: data.action === "APPROVE" ? "APPROVED" : data.action === "REJECT" ? "REJECTED" : "INTERVIEW",
        note: data.adminNote || null,
        changedById: admin.id,
      },
    });

    if (data.action === "APPROVE") {
      // Create user account for the teacher
      const existingUser = await db.user.findUnique({
        where: { email: application.email },
      });

      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
        // Upgrade to teacher role if needed
        if (existingUser.role !== "TEACHER") {
          await db.user.update({
            where: { id: existingUser.id },
            data: { role: "TEACHER" },
          });
        }
      } else {
        // Generate temporary password (in production: send email)
        const { hashPassword } = await import("@/lib/security");
        const tempPassword = Math.random().toString(36).slice(2, 14);
        const passwordHash = await hashPassword(tempPassword);
        const newUser = await db.user.create({
          data: {
            email: application.email,
            name: application.fullName,
            passwordHash,
            role: "TEACHER",
            phone: application.phone,
            whatsapp: application.whatsapp,
            isActive: true,
          },
        });
        userId = newUser.id;
      }

      // Create the teacher profile (Teacher has no `teacherId` field —
      // the link is owned by Application.teacherId, set further below)
      const slug = `${slugify(application.fullName)}-${Math.random().toString(36).slice(2, 6)}`;
      const teacher = await db.teacher.create({
        data: {
          userId,
          slug,
          fullName: application.fullName,
          specialty: application.specialty,
          level: application.level,
          subject: application.subject,
          experienceYears: application.experienceYears,
          city: application.city,
          commune: application.commune,
          phone: application.phone,
          whatsapp: application.whatsapp,
          hourlyRate: data.publicRate ?? application.desiredRate,
          publicRate: data.publicRate ?? application.desiredRate,
          availability: application.availability,
          bio: application.bio,
          methods: application.methods,
          languages: application.languages,
          rating: 4.5,
          reviewsCount: 0,
          isVerified: true,
          isPublished: true,
          internalCredits: data.internalCredits ?? 0,
          isFeatured: false,
        },
      });

      await db.application.update({
        where: { id: application.id },
        data: {
          status: "APPROVED",
          teacherId: teacher.id, // Link the application back to the new teacher
          reviewedById: admin.id,
          reviewedAt: new Date(),
          adminNote: data.adminNote || null,
        },
      });

      // Log admin action
      await db.adminLog.create({
        data: {
          userId: admin.id,
          action: "APPROVE_APPLICATION",
          entity: "Application",
          entityId: application.id,
          details: `Teacher profile created: ${teacher.id}`,
        },
      });

      return apiSuccess({
        teacher,
        message: "Candidature acceptée et profil enseignant créé",
      });
    }

    if (data.action === "REJECT") {
      await db.application.update({
        where: { id: application.id },
        data: {
          status: "REJECTED",
          reviewedById: admin.id,
          reviewedAt: new Date(),
          adminNote: data.adminNote || null,
        },
      });

      await db.adminLog.create({
        data: {
          userId: admin.id,
          action: "REJECT_APPLICATION",
          entity: "Application",
          entityId: application.id,
          details: data.adminNote || null,
        },
      });

      return apiSuccess({ message: "Candidature refusée" });
    }

    // INTERVIEW
    await db.application.update({
      where: { id: application.id },
      data: {
        status: "INTERVIEW",
        reviewedById: admin.id,
        reviewedAt: new Date(),
        adminNote: data.adminNote || null,
      },
    });

    return apiSuccess({ message: "Entretien programmé" });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
