#!/usr/bin/env bash
# ============================================================
# TeachHire RDC — Script de démarrage Railway
# ============================================================
# Ce script gère robustement le démarrage sur Railway :
#   1. Applique les migrations Prisma (sans bloquer si la DB
#      n'est pas encore prête — l'app démarre quand même).
#   2. Force HOSTNAME=0.0.0.0 pour que le serveur écoute sur
#      toutes les interfaces (Railway exige ça).
#   3. Lance le serveur Next.js standalone qui lit automatiquement
#      la variable PORT fournie par Railway (8080 ou autre).
# ------------------------------------------------------------

set -u  # erreur si variable non définie (on n'utilise pas -e pour ne pas
        # bloquer le démarrage si les migrations échouent)

echo "============================================================"
echo "  TeachHire RDC — Démarrage du serveur"
echo "============================================================"
echo "  PORT        = ${PORT:-<non défini, défaut 3000>}"
echo "  HOSTNAME    = 0.0.0.0 (forcé)"
echo "  NODE_ENV    = ${NODE_ENV:-development}"
echo "  DATABASE_URL = ${DATABASE_URL:+<défini>}${DATABASE_URL:-<NON DÉFINI>}"
echo "============================================================"

# --- 1. Migrations Prisma (best-effort) ---
# On NE bloque PAS le démarrage si les migrations échouent.
# L'app doit rester accessible pour que /api/health réponde et
# que Railway ne tue pas le conteneur.
if [ -z "${DATABASE_URL:-}" ]; then
  echo ""
  echo "⚠️  DATABASE_URL n'est pas défini."
  echo "    Les migrations sont ignorées. L'app va démarrer en mode dégradé"
  echo "    (les routes qui touchent la DB renverront une erreur 500, mais"
  echo "    la page d'accueil et /api/health resteront accessibles)."
  echo "    👉 Ajoutez une base PostgreSQL sur Railway et liez DATABASE_URL"
  echo "    via \${{Postgres.DATABASE_URL}} puis redeployez."
elif ! command -v npx >/dev/null 2>&1; then
  echo ""
  echo "⚠️  npx indisponible — migrations ignorées."
else
  echo ""
  echo "→ Application des migrations Prisma..."
  if npx prisma migrate deploy; then
    echo "✓ Migrations appliquées avec succès."
  else
    echo "⚠️  Les migrations ont échoué (code $?)."
    echo "    L'app va démarrer quand même. Vérifiez que DATABASE_URL pointe"
    echo "    bien vers une base PostgreSQL accessible depuis Railway."
  fi
fi

# --- 2. Configuration réseau ---
# Railway route le trafic entrant vers le port écouté par l'app.
# Next.js standalone lit process.env.PORT (Railway fournit 8080 ou autre).
# On force HOSTNAME=0.0.0.0 pour écouter sur toutes les interfaces
# (sinon le conteneur écouterait sur localhost et Railway ne pourrait
# pas le joindre → 404 sur l'URL publique).
export HOSTNAME=0.0.0.0

# --- 3. Démarrage du serveur ---
# `exec` remplace le shell par le processus node pour que Railway
# puisse envoyer SIGTERM proprement lors du shutdown.
echo ""
echo "→ Démarrage du serveur Next.js standalone..."
echo "  Écoute sur http://${HOSTNAME}:${PORT:-3000}"
echo ""
exec node .next/standalone/server.js
