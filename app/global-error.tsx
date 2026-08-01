"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Boundary d'erreur GLOBAL (catch-all pour le layout racine).
 *
 * Affichée si une erreur se produit dans le RootLayout lui-même
 * (typiquement : provider qui crash, middleware cassé, etc.).
 *
 * Cette page REMPLACE le layout racine, donc elle doit inclure
 * ses propres styles minimaux (balises html/body).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TeachHire RDC] Erreur globale :", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#f7f8fb",
          color: "#0b1220",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            padding: "32px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(185,28,28,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertTriangle
              style={{ width: "28px", height: "28px", color: "#b91c1c" }}
            />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: "0 0 8px",
              color: "#0b1220",
            }}
          >
            TeachHire RDC — Erreur critique
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            L&apos;application a rencontré une erreur critique. Vous pouvez
            rafraîchir la page ou contacter le support si le problème persiste.
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "#134e8c",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: "16px", height: "16px" }} />
              Réessayer
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "transparent",
                color: "#0b1220",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <Home style={{ width: "16px", height: "16px" }} />
              Accueil
            </a>
          </div>
          {error.digest && (
            <p
              style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "1px solid #e2e8f0",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Code d&apos;erreur :{" "}
              <code style={{ fontFamily: "monospace" }}>{error.digest}</code>
            </p>
          )}
          <p
            style={{
              marginTop: "16px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Support :{" "}
            <a
              href="tel:0853000674"
              style={{ color: "#134e8c", textDecoration: "none" }}
            >
              0853 000 674
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
