import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TeacherDetail } from "@/components/teachers/teacher-detail";

async function getTeacher(slug: string) {
  try {
    const teacher = await db.teacher.findFirst({
      where: {
        slug,
        isPublished: true,
        isVerified: true,
      },
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
        phone: true,
        whatsapp: true,
        bio: true,
        methods: true,
        languages: true,
        rating: true,
        reviewsCount: true,
        availability: true,
        publicRate: true,
        isFeatured: true,
        viewCount: true,
        createdAt: true,
        reviews: {
          where: { isApproved: true },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            parent: { select: { fullName: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!teacher) return null;

    return {
      ...teacher,
      methods: JSON.parse(teacher.methods || "[]") as string[],
      languages: JSON.parse(teacher.languages || "[]") as string[],
    };
  } catch {
    return null;
  }
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await getTeacher(slug);
  if (!teacher) notFound();

  return <TeacherDetail teacher={teacher} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await getTeacher(slug);
  if (!teacher) {
    return { title: "Enseignant introuvable" };
  }
  return {
    title: `${teacher.fullName} — ${teacher.subject} à ${teacher.city}`,
    description: teacher.bio.slice(0, 160),
  };
}
