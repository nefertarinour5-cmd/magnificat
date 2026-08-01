"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const CITIES = [
  "Kinshasa", "Bukavu", "Goma", "Lubumbashi", "Kisangani",
  "Mbuji-Mayi", "Kolwezi", "Matadi", "Bunia", "Uvira", "Butembo", "Kananga",
];

const SUBJECTS = [
  "Mathématiques", "Physique-Chimie", "Informatique", "Langues",
  "Sciences", "Histoire-Géographie", "Économie", "Philosophie", "Autre",
];

const SPECIALTIES = [
  "Mathématicien",
  "Scientifique",
  "Lettre / langue",
  "Informatique",
  "Autre",
];

const LEVELS = ["Primaire", "Secondaire", "Universitaire"];
const AVAILABILITIES = ["En semaine", "Week-end", "Flexible"];
const METHOD_OPTIONS = [
  "Cours théorique",
  "Exercices pratiques",
  "Préparation examens",
  "TP à domicile",
  "Suivi continu",
  "Projets pratiques",
  "Conversation",
  "Atelier d'écriture",
  "Schémas visuels",
  "Quiz réguliers",
  "Pair programming",
  "Code review",
  "Manipulations",
  "Multimédia",
  "Mises en situation",
];

const LANGUAGE_OPTIONS = [
  "Français", "Anglais", "Swahili", "Lingala", "Tshiluba", "Kikongo", "Autre",
];

export default function CandidaturePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-96 w-full mt-6" />
        </div>
      </div>
    }>
      <CandidatureContent />
    </Suspense>
  );
}

function CandidatureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [methods, setMethods] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    age: "",
    specialty: "",
    level: "",
    subject: "",
    experienceYears: "",
    city: "",
    commune: "",
    desiredRate: "",
    availability: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        whatsapp: user.whatsapp || prev.whatsapp,
      }));
    }
  }, [user]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMethod = (m: string) => {
    setMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const toggleLanguage = (l: string) => {
    setLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: form.age ? parseInt(form.age) : undefined,
          experienceYears: parseInt(form.experienceYears),
          desiredRate: parseInt(form.desiredRate),
          methods,
          languages,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Échec de la soumission");
        return;
      }

      setSuccess(true);
      toast.success("Candidature envoyée !", {
        description: "Notre équipe va examiner votre dossier.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 rounded-full bg-success/10 grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Candidature envoyée !</h1>
            <p className="text-muted-foreground mb-6">
              Merci pour votre intérêt. Notre équipe administrative va examiner
              votre dossier dans les plus brefs délais. Vous serez contacté(e)
              par téléphone ou WhatsApp pour un entretien.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => router.push("/")}>
                Retour à l'accueil
              </Button>
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Déposer une autre candidature
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Badge variant="outline" className="mb-2">
            <GraduationCap className="mr-1.5 h-3 w-3" />
            Espace enseignant
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Déposer une candidature
          </h1>
          <p className="mt-2 text-muted-foreground">
            Votre dossier sera examiné par notre équipe. Une fois validé, votre
            profil sera publié dans l'annuaire public.
          </p>
        </div>

        {!user && !authLoading && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous n'êtes pas connecté. Vous pouvez soumettre une candidature
              sans compte, mais nous recommandons de{" "}
              <a href="/register" className="font-semibold text-primary hover:underline">
                créer un compte enseignant
              </a>{" "}
              pour un suivi optimal.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Albert Kalemba"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={80}
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="34"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="pl-10"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    required
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="pl-10"
                    placeholder="0853..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (optionnel)</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="+243..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Compétences professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Compétences professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Spécialité *</Label>
                <Select value={form.specialty} onValueChange={(v) => updateField("specialty", v)} required>
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Matière principale *</Label>
                <Select value={form.subject} onValueChange={(v) => updateField("subject", v)} required>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Niveau d'enseignement *</Label>
                <Select value={form.level} onValueChange={(v) => updateField("level", v)} required>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Expérience (années) *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min={0}
                  max={60}
                  required
                  value={form.experienceYears}
                  onChange={(e) => updateField("experienceYears", e.target.value)}
                  placeholder="8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Localisation et disponibilité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Localisation & disponibilité
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Select value={form.city} onValueChange={(v) => updateField("city", v)} required>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="commune">Commune / Quartier</Label>
                <Input
                  id="commune"
                  value={form.commune}
                  onChange={(e) => updateField("commune", e.target.value)}
                  placeholder="Ibanda / Ndendere"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilité *</Label>
                <Select value={form.availability} onValueChange={(v) => updateField("availability", v)} required>
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITIES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desiredRate">Tarif souhaité ($/heure) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="desiredRate"
                    type="number"
                    min={0}
                    required
                    value={form.desiredRate}
                    onChange={(e) => updateField("desiredRate", e.target.value)}
                    className="pl-10"
                    placeholder="25"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sera affiché publiquement. L'administration peut l'ajuster.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Présentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Présentation professionnelle
              </CardTitle>
              <CardDescription>
                Présentez votre méthode, votre expérience et vos points forts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Présentation *</Label>
                <Textarea
                  id="bio"
                  required
                  rows={5}
                  minLength={20}
                  maxLength={2000}
                  value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Méthode, expérience, points forts, type d'accompagnement..."
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.bio.length}/2000
                </p>
              </div>

              <div className="space-y-2">
                <Label>Méthodes pédagogiques</Label>
                <div className="flex flex-wrap gap-2">
                  {METHOD_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMethod(m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        methods.includes(m)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Langues parlées</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLanguage(l)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        languages.includes(l)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end sticky bottom-4 z-10">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer la candidature
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
