import {
  ShieldCheck,
  Users,
  Target,
  Heart,
  Lock,
  Eye,
  Award,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "À propos",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <Badge variant="outline" className="mb-3">À propos</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          La plateforme éducative de référence en RDC
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          TeachHire RDC est née d'un constat simple : les familles congolaises
          méritent un accès fiable et sécurisé à des enseignants qualifiés.
          Notre mission est de transformer la mise en relation éducative en
          une expérience professionnelle, transparente et sécurisée.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Notre mission</CardTitle>
              <CardDescription>
                Connecter chaque famille congolaise avec l'enseignant idéal,
                dans un cadre de confiance et de sécurité. Nous voulons
                démocratiser l'accès à un soutien scolaire de qualité,
                tout en valorisant le travail des enseignants.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Eye className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Notre vision</CardTitle>
              <CardDescription>
                Devenir la plateforme de référence pour l'éducation en RDC,
                en construisant un écosystème de confiance où chaque
                enfant peut bénéficier d'un accompagnement adapté à ses
                besoins, partout dans le pays.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">
          Nos valeurs fondamentales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Sécurité",
              desc: "Authentification renforcée, validation administrative, données chiffrées. La sécurité de vos informations est notre priorité absolue.",
            },
            {
              icon: Award,
              title: "Qualité",
              desc: "Chaque enseignant est vérifié avant publication. Nous maintenons un haut niveau d'exigence pour garantir des profils compétents.",
            },
            {
              icon: Users,
              title: "Communauté",
              desc: "Parents, enseignants et administration forment une communauté éducative solidaire, soutenue par notre équipe.",
            },
            {
              icon: Lock,
              title: "Confidentialité",
              desc: "Vos données personnelles sont protégées et jamais partagées sans consentement. Le respect de votre vie privée guide chacune de nos décisions.",
            },
            {
              icon: Heart,
              title: "Humain",
              desc: "Derrière chaque technologie, il y a des personnes. Notre support téléphonique et WhatsApp est là pour vous accompagner.",
            },
            {
              icon: TrendingUp,
              title: "Innovation",
              desc: "Recherche intelligente par compatibilité, suivi en temps réel, notifications : nous améliorons constamment l'expérience.",
            },
          ].map((value, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center text-primary">
                  <value.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3">{value.title}</CardTitle>
                <CardDescription className="leading-relaxed">{value.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-muted/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Sécurité & confiance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Authentification</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mots de passe chiffrés (bcrypt, 12 rounds)</li>
                  <li>• Sessions sécurisées en base de données</li>
                  <li>• Verrouillage après 5 tentatives échouées</li>
                  <li>• Protection CSRF par double cookie</li>
                  <li>• Rate limiting sur toutes les routes sensibles</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Validation</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Validation Zod côté serveur</li>
                  <li>• Vérification admin de chaque candidature</li>
                  <li>• Avis restreints aux parents ayant sollicité</li>
                  <li>• Audit trail des actions administratives</li>
                  <li>• Sessions révocables à tout moment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Une question ?
          </h2>
          <p className="text-muted-foreground mb-4">
            Notre équipe est disponible du lundi au samedi, de 8h à 18h.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:0853000674"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              📞 0853 000 674
            </a>
            <a
              href="https://wa.me/243853000674"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
