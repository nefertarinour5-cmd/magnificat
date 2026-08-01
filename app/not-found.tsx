import Link from "next/link";
import { Home, Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Page 404 personnalisée.
 *
 * Sert deux objectifs :
 *   1. UX : afficher un message clair et des liens utiles quand une
 *      page n'existe pas.
 *   2. Debug Railway : si l'URL racine renvoie un 404 inattendu, cette
 *      page s'affichera à la place de la 404 générique de Next.js,
 *      avec un message qui confirme que c'est bien l'app qui répond
 *      (et non un problème de routing Railway).
 */
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-7xl font-extrabold text-primary mb-2">404</div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Page introuvable
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              La page que vous cherchez n&apos;existe pas ou a été déplacée.
              Si le problème persiste, contactez notre équipe.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Accueil
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/annuaire">
                  <Search className="mr-2 h-4 w-4" />
                  Annuaire
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/candidature">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Candidature
                </Link>
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">TeachHire RDC</p>
              <p>Plateforme éducative professionnelle</p>
              <p className="mt-2">
                Support :{" "}
                <a href="tel:0853000674" className="text-primary hover:underline">
                  0853 000 674
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
