"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Star,
  Clock,
  Award,
  Phone,
  MessageCircle,
  GraduationCap,
  Languages,
  Heart,
  Share2,
  CheckCircle2,
  Eye,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import Link from "next/link";

interface TeacherDetailData {
  id: string;
  slug: string;
  fullName: string;
  specialty: string;
  level: string;
  subject: string;
  experienceYears: number;
  city: string;
  commune: string | null;
  phone: string;
  whatsapp: string | null;
  bio: string;
  methods: string[];
  languages: string[];
  rating: number;
  reviewsCount: number;
  availability: string;
  publicRate: number | null;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    parent: { fullName: string };
  }>;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() || "")
    .join("");
}

export function TeacherDetail({ teacher }: { teacher: TeacherDetailData }) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [solicitOpen, setSolicitOpen] = useState(
    searchParams.get("action") === "solicit"
  );
  const [message, setMessage] = useState(
    `Bonjour ${teacher.fullName}, je suis intéressé(e) par vos services d'enseignement en ${teacher.subject}.`
  );
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [submitting, setSubmitting] = useState(false);

  const handleSolicit = async () => {
    if (!user) {
      toast.info("Connexion requise", {
        description: "Vous devez être connecté en tant que parent pour solliciter.",
        action: {
          label: "Se connecter",
          onClick: () => window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname),
        },
      });
      return;
    }
    if (user.role !== "PARENT") {
      toast.error("Seuls les comptes parent peuvent solliciter un enseignant.");
      return;
    }

    setSubmitting(true);
    const result = await apiCall("/api/requests", {
      method: "POST",
      body: JSON.stringify({
        teacherId: teacher.id,
        message,
        priority,
      }),
    });
    setSubmitting(false);

    if (result.success) {
      toast.success("Demande envoyée !", {
        description: "L'enseignant et l'administration ont été notifiés.",
      });
      setSolicitOpen(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.info("Connexion requise pour ajouter aux favoris");
      return;
    }
    await apiCall("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ teacherId: teacher.id }),
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${teacher.fullName} — TeachHire RDC`,
        text: teacher.bio,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Header card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-primary to-chart-4 text-white shrink-0">
                  <AvatarFallback className="bg-transparent text-white text-2xl font-bold">
                    {initials(teacher.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      {teacher.fullName}
                    </h1>
                    {teacher.isFeatured && (
                      <Badge className="bg-warning text-warning-foreground">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        En vedette
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-success border-success/30">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Vérifié
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {teacher.specialty} · {teacher.subject}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {teacher.city}{teacher.commune ? `, ${teacher.commune}` : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold text-foreground">{teacher.rating.toFixed(1)}</span>
                      <span>({teacher.reviewsCount} avis)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      {teacher.experienceYears} an{teacher.experienceYears > 1 ? "s" : ""} d'expérience
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {teacher.viewCount} vues
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={handleFavorite}>
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="methods">Méthode & langues</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({teacher.reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Présentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {teacher.bio}
                  </p>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Niveau</div>
                      <div className="font-semibold mt-1 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {teacher.level}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Disponibilité</div>
                      <div className="font-semibold mt-1 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        {teacher.availability}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Expérience</div>
                      <div className="font-semibold mt-1">{teacher.experienceYears} ans</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Membre depuis</div>
                      <div className="font-semibold mt-1 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(teacher.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methods" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Méthodes pédagogiques</CardTitle>
                  <CardDescription>Les approches utilisées par l'enseignant</CardDescription>
                </CardHeader>
                <CardContent>
                  {teacher.methods.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.methods.map((m) => (
                        <Badge key={m} variant="secondary" className="py-1.5 px-3">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Non renseigné</p>
                  )}

                  <Separator className="my-4" />

                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Langues parlées</h4>
                  </div>
                  {teacher.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.languages.map((l) => (
                        <Badge key={l} variant="outline" className="py-1.5 px-3">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Non renseigné</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avis des parents</CardTitle>
                  <CardDescription>
                    Seuls les parents ayant sollicité l'enseignant peuvent laisser un avis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teacher.reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aucun avis pour le moment. Soyez le premier !
                      </p>
                    </div>
                  ) : (
                    teacher.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-lg bg-muted">
                              <AvatarFallback>
                                {initials(review.parent.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{review.parent.fullName}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Contacter l'enseignant</CardTitle>
              <CardDescription>
                Sollicitez via la plateforme pour un suivi sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center py-4 bg-muted/40 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Tarif horaire
                </div>
                {teacher.publicRate !== null && teacher.publicRate > 0 ? (
                  <div className="text-3xl font-bold mt-1">
                    ${teacher.publicRate}
                    <span className="text-sm font-normal text-muted-foreground">/h</span>
                  </div>
                ) : (
                  <div className="text-lg font-bold mt-1">Sur demande</div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Géré par l'administration
                </div>
              </div>

              <Button
                className="w-full h-11"
                size="lg"
                onClick={() => setSolicitOpen(true)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Solliciter cet enseignant
              </Button>

              {user?.role === "PARENT" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleFavorite}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Ajouter aux favoris
                </Button>
              )}

              {!user && (
                <div className="text-xs text-center text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Connectez-vous
                  </Link>{" "}
                  en tant que parent pour solliciter
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Profil vérifié par l'admin</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span>Échange via plateforme sécurisée</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 text-warning" />
                  <span>Avis validés après sollicitation</span>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 mb-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">Support TeachHire</span>
                </div>
                <a href="tel:0853000674" className="hover:text-primary transition-colors">
                  0853 000 674
                </a>
                <span className="mx-1.5">·</span>
                <a
                  href="https://wa.me/243853000674"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-success transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Solicit dialog */}
      <Dialog open={solicitOpen} onOpenChange={setSolicitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solliciter {teacher.fullName}</DialogTitle>
            <DialogDescription>
              Votre message sera transmis à l'enseignant et à l'administration pour suivi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Votre message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-1.5"
                placeholder="Décrivez votre besoin : niveau de l'élève, difficultés, disponibilités souhaitées..."
              />
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger id="priority" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Faible — Pas urgent</SelectItem>
                  <SelectItem value="NORMAL">Normal — Sous 1 semaine</SelectItem>
                  <SelectItem value="HIGH">Élevé — Sous 48h</SelectItem>
                  <SelectItem value="URGENT">Urgent — Aujourd'hui</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSolicitOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSolicit} disabled={submitting || message.length < 10}>
              {submitting ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
