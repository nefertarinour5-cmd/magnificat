"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { passwordStrength } from "@/lib/security-utils";

export default function RegisterPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [role, setRole] = useState<"PARENT" | "TEACHER">("PARENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      const target =
        user.role === "ADMIN"
          ? "/dashboard/admin"
          : user.role === "TEACHER"
            ? "/dashboard/teacher"
            : "/dashboard/parent";
      router.replace(target);
    }
  }, [user, router]);

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          whatsapp: whatsapp || undefined,
        }),
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Échec de l'inscription");
        return;
      }

      toast.success("Compte créé avec succès !");
      await refresh();

      if (role === "TEACHER") {
        router.replace("/candidature?from=register");
      } else {
        router.replace("/dashboard/parent");
      }
      router.refresh();
    } catch {
      setError("Erreur réseau, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Créer un compte</CardTitle>
            <CardDescription>
              Rejoignez la plateforme TeachHire RDC
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={role} onValueChange={(v) => setRole(v as "PARENT" | "TEACHER")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="PARENT" className="gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  Parent
                </TabsTrigger>
                <TabsTrigger value="TEACHER" className="gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Enseignant
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Marie Nabintu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0853..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (optionnel)</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+243..."
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(strength.score / 5) * 100}%`,
                            backgroundColor: strength.color,
                          }}
                        />
                      </div>
                      <span style={{ color: strength.color }} className="font-medium">
                        {strength.label}
                      </span>
                    </div>
                    <ul className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${password.length >= 8 ? "text-success" : "text-muted-foreground/50"}`} />
                        8+ caractères
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${/[A-Z]/.test(password) ? "text-success" : "text-muted-foreground/50"}`} />
                        Majuscule
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${/[a-z]/.test(password) ? "text-success" : "text-muted-foreground/50"}`} />
                        Minuscule
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${/\d/.test(password) ? "text-success" : "text-muted-foreground/50"}`} />
                        Chiffre
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Création..." : "Créer mon compte"}
              </Button>

              {role === "TEACHER" && (
                <p className="text-xs text-muted-foreground text-center">
                  Après inscription, vous pourrez déposer votre candidature qui sera
                  examinée par notre équipe.
                </p>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
