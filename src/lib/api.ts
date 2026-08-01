import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code?: string
  ) {
    super(message);
  }
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status: number = 400, code?: string) {
  return NextResponse.json(
    { success: false, error: message, code },
    { status }
  );
}

export function apiZodError(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: "Validation échouée",
      details: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    },
    { status: 422 }
  );
}

export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return apiError(error.message, error.status, error.code);
  }

  if (error instanceof ZodError) {
    return apiZodError(error);
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED")
      return apiError("Authentification requise", 401);
    if (error.message === "FORBIDDEN")
      return apiError("Accès refusé", 403);
  }

  return apiError("Erreur interne du serveur", 500);
}

// Sanitize string inputs to prevent XSS
export function sanitize(input: string): string {
  return String(input ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 5000);
}

// Rate limiting - simple in-memory store (per process)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
