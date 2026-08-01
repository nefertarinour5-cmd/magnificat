import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requestStatusUpdateSchema } from "@/lib/validators";
import {
  apiSuccess,
  apiError,
  apiZodError,
  handleApiError,
} from "@/lib/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return apiError("Non authentifié", 401, "UNAUTHORIZED");

    const body = await request.json();
    const data = requestStatusUpdateSchema.parse(body);

    const req = await db.request.findUnique({
      where: { id },
      include: {
        parent: true,
        teacher: true,
      },
    });

    if (!req) {
      return apiError("Demande introuvable", 404, "NOT_FOUND");
    }

    // Authorization: parent owns it OR admin OR teacher assigned
    const canUpdate =
      user.role === "ADMIN" ||
      (user.role === "PARENT" && req.parent.userId === user.id) ||
      (user.role === "TEACHER" && req.teacher.userId === user.id);

    if (!canUpdate) {
      return apiError("Action non autorisée", 403, "FORBIDDEN");
    }

    // Parents can only cancel; teachers/admins can change status freely
    if (user.role === "PARENT" && data.status !== "CANCELLED") {
      return apiError(
        "Vous pouvez uniquement annuler votre demande",
        403,
        "FORBIDDEN"
      );
    }

    const updated = await db.request.update({
      where: { id },
      data: {
        status: data.status,
        adminNote: data.adminNote || null,
      },
    });

    // Notify the other party
    const notifyUserId =
      user.role === "PARENT" ? req.teacher.userId : req.parent.userId;

    await db.notification.create({
      data: {
        userId: notifyUserId,
        title: "Mise à jour de demande",
        message: `Demande #${id.slice(-6)} → ${data.status}`,
        type: "request_update",
        link: user.role === "PARENT" ? "/dashboard/teacher" : "/dashboard/parent",
      },
    });

    return apiSuccess({ request: updated });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return apiError("Non authentifié", 401, "UNAUTHORIZED");
    if (user.role !== "ADMIN") {
      return apiError("Suppression réservée à l'admin", 403, "FORBIDDEN");
    }

    await db.request.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
