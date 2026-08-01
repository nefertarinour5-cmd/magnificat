import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Search,
  Star,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Heart,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeaturedTeachersSection } from "@/components/home/featured-teachers-section";

/**
 * Page d'accueil 100% STATIQUE.
 *
 * Aucun appel à la base de données n'est effectué côté serveur pendant
 * le build ou le rendu — toutes les données dynamiques sont chargées
 * côté client par <FeaturedTeachersSection /> via les routes /api/*.
 *
 * Avantages :
 *   - La page s'affiche TOUJOURS, même si la DB est injoignable
 *     (cas fréquent au premier déploiement Railway).
 *   - Le pré-rendu statique Next.js fonctionne sans DB.
 *   - Les robots d'indexation voient immédiatement le contenu.
 *
 * Marqueur `force-static` pour être explicite.
 */
export const dynamic = "force-static";

export default function HomePage() {
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
              Trouvez l&apos;enseignant idéal pour
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

            {/* Stats dynamiques chargées côté client */}
            <FeaturedTeachersSection />
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
