#!/usr/bin/env bash
# Build script for TeachHire RDC project
# Produces a complete zip file in /home/z/my-project/download/

set -e

PROJECT_ROOT="/home/z/my-project/work/teachhire"
OUTPUT_DIR="/home/z/my-project/download"
ZIP_NAME="teachhire-rdc-railway-ready.zip"
TMP_DIR="/tmp/teachhire-rdc-build"

echo "📦 Building TeachHire RDC zip (Railway-ready)..."

# Clean previous build
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR/teachhire-rdc"
mkdir -p "$OUTPUT_DIR"

# Copy project files (excluding heavy/unneeded directories)
cd "$PROJECT_ROOT"

# Define what to include
INCLUDE=(
  "src"
  "prisma"
  "scripts"
  "public"
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "next.config.ts"
  "postcss.config.mjs"
  "tailwind.config.ts"
  "components.json"
  "eslint.config.mjs"
  "Caddyfile"
  ".gitignore"
  ".env.example"
  ".env.production.example"
  "railway.json"
  "nixpacks.toml"
  "Procfile"
  "README.md"
  "DEMARRAGE-RAPIDE.md"
  "RAILWAY-DEPLOIEMENT.md"
)

for item in "${INCLUDE[@]}"; do
  if [ -e "$item" ]; then
    cp -r "$item" "$TMP_DIR/teachhire-rdc/"
    echo "  ✓ $item"
  fi
done

# Create the zip
cd "$TMP_DIR"
zip -rq "$OUTPUT_DIR/$ZIP_NAME" "teachhire-rdc" \
  -x "*/node_modules/*" \
  -x "*/.next/*" \
  -x "*/out/*" \
  -x "*/build/*" \
  -x "*/.git/*" \
  -x "*/.env" \
  -x "*/.env.local" \
  -x "*/.env.production" \
  -x "*/dev.log" \
  -x "*/server.log"

# Show result
ZIP_SIZE=$(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)
echo ""
echo "✅ Build terminé avec succès !"
echo "📦 Fichier: $OUTPUT_DIR/$ZIP_NAME"
echo "📏 Taille: $ZIP_SIZE"
echo ""
echo "Contenu du zip:"
unzip -l "$OUTPUT_DIR/$ZIP_NAME" | tail -20
