import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { searchSchema } from "@/lib/validators";
import { apiSuccess, apiZodError, handleApiError, rateLimit, getClientIp } from "@/lib/api";

function normalize(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compatibilityScore(
  teacher: {
    city: string;
    commune: string | null;
    subject: string;
    level: string;
    availability: string;
    experienceYears: number;
    rating: number;
    publicRate: number | null;
    isVerified: boolean;
    isFeatured: boolean;
  },
  filters: {
    q?: string;
    city?: string;
    subject?: string;
    level?: string;
    availability?: string;
    maxRate?: number;
  }
): number {
  let score = 16;

  if (filters.city) {
    if (
      normalize(teacher.city).includes(normalize(filters.city)) ||
      normalize(teacher.commune).includes(normalize(filters.city))
    ) {
      score += 28;
    } else {
      score += 4;
    }
  }

  if (filters.subject) {
    if (normalize(teacher.subject).includes(normalize(filters.subject))) {
      score += 24;
    } else {
      score += 4;
    }
  }

  if (filters.level) {
    if (normalize(teacher.level).includes(normalize(filters.level))) {
      score += 18;
    } else {
      score += 4;
    }
  }

  if (filters.availability) {
    if (normalize(teacher.availability).includes(normalize(filters.availability))) {
      score += 10;
    } else {
      score += 2;
    }
  }

  if (filters.maxRate !== undefined && teacher.publicRate !== null) {
    if (teacher.publicRate <= filters.maxRate) {
      score += 16;
    } else {
      score += Math.max(0, 16 - Math.min(10, teacher.publicRate - filters.maxRate));
    }
  }

  score += Math.min(12, teacher.experienceYears);
  score += teacher.isVerified ? 6 : 0;
  score += teacher.isFeatured ? 4 : 0;
  score += Math.round((teacher.rating - 4) * 8);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`search:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      return apiSuccess(
        {
          teachers: [],
          total: 0,
          page: 1,
          pageSize: 12,
          message: "Limite de recherches atteinte",
        },
        200
      );
    }

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const data = searchSchema.parse(params);

    const where = {
      isPublished: true,
      isVerified: true,
      ...(data.city ? { city: { contains: data.city } } : {}),
      ...(data.subject ? { subject: { contains: data.subject } } : {}),
      ...(data.level ? { level: data.level } : {}),
      ...(data.availability ? { availability: data.availability } : {}),
      ...(data.minExperience !== undefined
        ? { experienceYears: { gte: data.minExperience } }
        : {}),
      ...(data.minRating !== undefined
        ? { rating: { gte: data.minRating } }
        : {}),
      ...(data.maxRate !== undefined
        ? { publicRate: { lte: data.maxRate } }
        : {}),
    };

    const [total, teachers] = await Promise.all([
      db.teacher.count({ where }),
      db.teacher.findMany({
        where,
        select: {
          id: true,
          slug: true,
          fullName: true,
          specialty: true,
          level: true,
          subject: true,
          experienceYears: true,
          city: true,
          commune: true,
          bio: true,
          rating: true,
          reviewsCount: true,
          availability: true,
          publicRate: true,
          isFeatured: true,
          isVerified: true,
          methods: true,
          languages: true,
          viewCount: true,
          createdAt: true,
        },
        orderBy: [
          { isFeatured: "desc" },
          { rating: "desc" },
          { createdAt: "desc" },
        ],
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
      }),
    ]);

    // Calculate compatibility scores and sort
    const withScore = teachers.map((t) => {
      const filters = {
        q: data.q,
        city: data.city,
        subject: data.subject,
        level: data.level,
        availability: data.availability,
        maxRate: data.maxRate,
      };

      let compat = compatibilityScore(t, filters);

      // q full-text search across bio/name
      if (data.q) {
        const blob = normalize(
          [t.fullName, t.bio, t.subject, t.city, t.commune, t.specialty, t.level].join(" ")
        );
        if (blob.includes(normalize(data.q))) {
          compat += 22;
        } else {
          return null; // Excluded by full-text search
        }
      }

      return {
        ...t,
        methods: JSON.parse(t.methods || "[]"),
        languages: JSON.parse(t.languages || "[]"),
        compatibility: compat,
      };
    }).filter((t): t is NonNullable<typeof t> => t !== null);

    // Sort by requested criterion
    const sorted = [...withScore].sort((a, b) => {
      switch (data.sort) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.experienceYears - a.experienceYears;
        case "recent":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "rate":
          return (a.publicRate ?? 0) - (b.publicRate ?? 0);
        case "compatibility":
        default:
          return b.compatibility - a.compatibility;
      }
    });

    return apiSuccess({
      teachers: sorted,
      total: sorted.length,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: Math.ceil(sorted.length / data.pageSize),
    });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiZodError(error as never);
    }
    return handleApiError(error);
  }
}
