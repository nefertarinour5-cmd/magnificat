import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user) {
      const cookieStore = await cookies();
      const token = cookieStore.get("teachhire_session")?.value;
      if (token) {
        await destroySession(token);
      }
    }
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
