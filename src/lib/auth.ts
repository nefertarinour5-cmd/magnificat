import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { generateSessionToken, SECURITY } from "@/lib/security";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "teachhire_session";
const CSRF_COOKIE = "teachhire_csrf";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "PARENT";
  isActive: boolean;
}

export async function createSession(
  userId: string,
  request?: Request
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(
    Date.now() + SECURITY.SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  const userAgent = request?.headers.get("user-agent") ?? null;
  const ip = request?.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  await db.session.create({
    data: { id: randomUUID(), userId, token, userAgent, ip, expiresAt },
  });

  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date(), failedAttempts: 0, lockedUntil: null },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  // CSRF token - double submit cookie pattern
  const csrfToken = randomUUID();
  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.session.updateMany({
    where: { token },
    data: { revokedAt: new Date() },
  });
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(CSRF_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) return null;
    if (session.revokedAt) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) return null;
    if (!session.user.isActive) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      isActive: session.user.isActive,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(
  ...roles: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;
  return cookieToken === token;
}

export function handleAuthError(error: unknown): {
  status: number;
  message: string;
} {
  const msg = error instanceof Error ? error.message : "Erreur";
  if (msg === "UNAUTHORIZED")
    return { status: 401, message: "Authentification requise" };
  if (msg === "FORBIDDEN")
    return { status: 403, message: "Accès refusé" };
  return { status: 500, message: "Erreur serveur" };
}
