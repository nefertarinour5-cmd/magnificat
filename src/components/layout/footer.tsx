import Link from "next/link";
import { GraduationCap, Phone, Mail, MessageCircle, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-4 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold">
                TeachHire <span className="text-primary">RDC</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme de référence pour la mise en relation entre parents
              et enseignants qualifiés en République Démocratique du Congo.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Accueil</Link></li>
              <li><Link href="/annuaire" className="hover:text-foreground transition-colors">Annuaire des enseignants</Link></li>
              <li><Link href="/candidature" className="hover:text-foreground transition-colors">Déposer une candidature</Link></li>
              <li><Link href="/apropos" className="hover:text-foreground transition-colors">À propos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cgu" className="hover:text-foreground transition-colors">Conditions générales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
              <li><Link href="/securite" className="hover:text-foreground transition-colors">Sécurité</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:0853000674" className="hover:text-foreground">0853 000 674</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-success" />
                <a
                  href="https://wa.me/243853000674"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:contact@teachhire-rdc.com" className="hover:text-foreground">
                  contact@teachhire-rdc.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>République Démocratique du Congo</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TeachHire RDC. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Plateforme sécurisée · Données chiffrées
          </p>
        </div>
      </div>
    </footer>
  );
}
