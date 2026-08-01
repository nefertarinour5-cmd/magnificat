import Link from "next/link";
import { db } from "@/lib/db";
import {
  GraduationCap,
  ShieldCheck,
  Search,
  Users,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Award,
  Heart,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeacherCardPublic } from "@/components/teachers/teacher-card-public";

async function getFeaturedTeachers() {
  try {
    const teachers = await db.teacher.findMany({
      where: {
        isPublished: true,
        isVerified: true,
        isFeatured: true,
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
        bio: true,
        rating: true,
        reviewsCount: true,
        availability: true,
        publicRate: true,
        methods: true,
        languages: true,
      },
      orderBy: [{ rating: "desc" }, { reviewsCount: "desc" }],
      take: 3,
    });

    return teachers.map((t) => ({
      ...t,
      methods: JSON.parse(t.methods || "[]") as string[],
      languages: JSON.parse(t.languages || "[]") as string[],
      compatibility: 100,
    }));
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [teachers, cities, subjects] = await Promise.all([
      db.teacher.count({ where: { isPublished: true, isVerified: true } }),
      db.teacher.groupBy({ by: ["city"], _count: { id: true } }),
      db.teacher.groupBy({ by: ["subject"], _count: { id: true } }),
    ]);
    return {
      teachers,
      cities: cities.length,
      subjects: subjects.length,
    };
  } catch {
    return { teachers: 0, cities: 0, subjects: 0 };
  }
}

export default async function HomePage() {
  const [featuredTeachers, stats] = await Promise.all([
    getFeaturedTeachers(),
    getStats(),
  ]);

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-5 bg-background/70 backdrop-blur">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-success" />
              Plateforme validée · Sécurité renforcée
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Trouvez l'enseignant idéal pour
              <br />
              <span className="text-gradient">votre enfant en RDC</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              La plateforme professionnelle qui connecte les familles congolaises
              avec des enseignants qualifiés et vérifiés. Validation administrative,
              suivi de qualité, sécurité renforcée.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="h-12 px-6">
                <Link href="/annuaire">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher un enseignant
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6">
                <Link href="/candidature">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Devenir enseignant
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { value: stats.teachers, label: "Enseignants vérifiés", icon: Users },
                { value: stats.cities, label: "Villes couvertes", icon: MapPin },
                { value: stats.subjects, label: "Matières disponibles", icon: Award },
              ].map((stat, i) => (
                <Card key={i} className="bg-background/70 backdrop-blur border-border/60">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pourquoi TeachHire RDC ?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Une plateforme conçue avec rigueur pour garantir qualité et sécurité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Validation administrative",
              desc: "Chaque enseignant est vérifié par notre équipe avant publication. Diplômes, expérience et identité contrôlés.",
              color: "text-success",
            },
            {
              icon: Search,
              title: "Recherche intelligente",
              desc: "Notre algorithme de compatibilité trie les profils selon vos critères : ville, matière, niveau, budget, disponibilité.",
              color: "text-primary",
            },
            {
              icon: Lock,
              title: "Sécurité renforcée",
              desc: "Authentification multi-facteurs, sessions sécurisées, protection CSRF, chiffrement des mots de passe par bcrypt.",
              color: "text-chart-4",
            },
            {
              icon: Star,
              title: "Système d'avis vérifiés",
              desc: "Seuls les parents ayant réellement sollicité un enseignant peuvent laisser un avis, et après validation admin.",
              color: "text-warning",
            },
            {
              icon: Clock,
              title: "Suivi en temps réel",
              desc: "Statut des demandes, notifications, historique des interactions : tout est tracé pour un suivi transparent.",
              color: "text-chart-2",
            },
            {
              icon: Heart,
              title: "Accompagnement humain",
              desc: "Une équipe de support disponible par téléphone et WhatsApp pour vous accompagner à chaque étape.",
              color: "text-destructive",
            },
          ].map((feature, i) => (
            <Card key={i} className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className={`h-11 w-11 rounded-xl bg-muted/50 grid place-items-center ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3">
              Processus transparent
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Comment ça marche
            </h2>
            <p className="mt-3 text-muted-foreground">
              Un parcours clair et sécurisé, de la candidature au suivi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Candidature",
                desc: "L'enseignant dépose son dossier complet en ligne, avec justificatifs.",
                icon: GraduationCap,
              },
              {
                step: "2",
                title: "Vérification",
                desc: "L'administration contrôle les informations et conduit un entretien.",
                icon: ShieldCheck,
              },
              {
                step: "3",
                title: "Publication",
                desc: "Une fois validé, le profil devient visible publiquement dans l'annuaire.",
                icon: CheckCircle2,
              },
              {
                step: "4",
                title: "Mise en relation",
                desc: "Le parent sollicite l'enseignant via notre canal sécurisé et suivi.",
                icon: MessageCircle,
              },
            ].map((p, i) => (
              <Card key={i} className="relative border-border/60">
                <CardHeader>
                  <div className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-gradient-to-br from-primary to-chart-4 text-white grid place-items-center text-sm font-bold shadow-md">
                    {p.step}
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3 text-base">{p.title}</CardTitle>
                  <CardDescription className="text-sm">{p.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TEACHERS */}
      {featuredTeachers.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-2">
                <Star className="mr-1 h-3 w-3 fill-warning text-warning" />
                Enseignants en vedette
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Les meilleurs profils du moment
              </h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/annuaire">
                Voir tout l'annuaire
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTeachers.map((teacher) => (
              <TeacherCardPublic key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
          <CardContent className="p-8 md:p-12 relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Prêt à commencer ?
                </h2>
                <p className="mt-2 text-primary-foreground/80 leading-relaxed">
                  Que vous soyez parent cherchant un enseignant ou enseignant
                  cherchant à proposer vos services, notre plateforme vous attend.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    Créer un compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  asChild
                >
                  <a href="tel:0853000674">
                    <Phone className="mr-2 h-4 w-4" />
                    Nous appeler
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
