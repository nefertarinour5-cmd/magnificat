"use client";

import { useEffect, useState } from "react";
import { Star, Users, MapPin, Award, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherCardPublic, type PublicTeacher } from "@/components/teachers/teacher-card-public";

interface Stats {
  teachers: number;
  cities: number;
  subjects: number;
}

/**
 * Charge les enseignants en vedette et les statistiques côté client.
 *
 * Raison : la page d'accueil doit rester 100% statique pour garantir
 * qu'elle s'affiche toujours, même si la base de données est injoignable
 * (problème fréquent lors du premier déploiement Railway où la DB
 * n'est pas encore prête quand Next.js pré-rend la page).
 *
 * En déplaçant les appels DB côté client (via /api/teachers/featured),
 * la page d'accueil sera toujours servie en HTML statique, et les
 * données dynamiques apparaîtront progressivement (skeleton → données).
 */
export function FeaturedTeachersSection() {
  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [stats, setStats] = useState<Stats>({ teachers: 0, cities: 12, subjects: 8 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) Featured teachers
      try {
        const res = await fetch("/api/teachers/featured", {
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.success && json.data?.teachers) {
          setTeachers(json.data.teachers.slice(0, 3));
        }
      } catch {
        // silencieux : la DB n'est peut-être pas encore prête
      }

      // 2) Stats (nombre total d'enseignants vérifiés)
      try {
        const res = await fetch("/api/teachers/search?page=1&pageSize=1", {
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.success && json.data) {
          const total = json.data.total ?? 0;
          setStats((prev) => ({
            teachers: total,
            cities: total > 0 ? prev.cities : 12,
            subjects: total > 0 ? prev.subjects : 8,
          }));
        }
      } catch {
        // silencieux
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayStats = [
    { value: stats.teachers, label: "Enseignants vérifiés", icon: Users },
    { value: stats.cities, label: "Villes couvertes", icon: MapPin },
    { value: stats.subjects, label: "Matières disponibles", icon: Award },
  ];

  return (
    <>
      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {displayStats.map((stat, i) => (
          <Card key={i} className="bg-background/70 backdrop-blur border-border/60">
            <CardContent className="p-4 text-center">
              <stat.icon className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured teachers (loading skeleton) */}
      {loading ? (
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      ) : teachers.length > 0 ? (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium mb-2">
                <Star className="h-3 w-3 fill-warning text-warning" />
                Enseignants en vedette
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Les meilleurs profils du moment
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <TeacherCardPublic key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
