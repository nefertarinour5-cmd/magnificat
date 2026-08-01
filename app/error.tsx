"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Page d'erreur runtime (catch-all pour les erreurs React).
 *
 * Affichée quand une erreur se produit pendant le rendu d'une page.
 * Permet à l'utilisateur de retry ou de revenir à l'accueil sans
 * voir une page blanche ou un stack trace technique.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur côté serveur (visible dans les logs Railway)
    console.error("[TeachHire RDC] Erreur runtime :", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-14 w-14 rounded-full bg-destructive/10 grid place-items-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Désolé, une erreur inattendue s&apos;est produite. Vous pouvez
              réessayer ou retourner à l&apos;accueil. Si le problème persiste,
              contactez le support.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={reset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Accueil
                </Link>
              </Button>
            </div>
            {error.digest && (
              <p className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
                Code d&apos;erreur : <code className="font-mono">{error.digest}</code>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
