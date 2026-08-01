import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TeachHire RDC — Plateforme éducative professionnelle",
    template: "%s · TeachHire RDC",
  },
  description:
    "La plateforme de référence en RDC pour mettre en relation parents et enseignants qualifiés. Validation administrative, sécurité renforcée, suivi de qualité.",
  keywords: [
    "TeachHire",
    "RDC",
    "enseignant",
    "cours particulier",
    "Kinshasa",
    "Bukavu",
    "Goma",
    "soutien scolaire",
    "tutorat",
  ],
  authors: [{ name: "TeachHire RDC" }],
  openGraph: {
    title: "TeachHire RDC — Plateforme éducative professionnelle",
    description:
      "Trouvez l'enseignant idéal pour votre enfant. Plateforme sécurisée avec validation administrative.",
    type: "website",
    locale: "fr_FR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
