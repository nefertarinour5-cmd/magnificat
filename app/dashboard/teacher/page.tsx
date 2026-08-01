"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  Star,
  MessageCircle,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface Request {
  id: string;
  status: string;
  message: string;
  priority: string;
  createdAt: string;
  parent: {
    id: string;
    fullName: string;
    phone: string;
    whatsapp: string | null;
    city: string;
    address: string;
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-warning/15 text-warning" },
  CONTACTED: { label: "Contacté", color: "bg-primary/15 text-primary" },
  SCHEDULED: { label: "Planifié", color: "bg-chart-2/15 text-chart-2" },
  COMPLETED: { label: "Terminé", color: "bg-success/15 text-success" },
  CANCELLED: { label: "Annulé", color: "bg-destructive/15 text-destructive" },
  ORIENTED: { label: "Orienté", color: "bg-chart-4/15 text-chart-4" },
};

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const { apiCall } = useApi();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [profile, setProfile] = useState({
    bio: "",
    methods: [] as string[],
    languages: [] as string[],
    availability: "",
    phone: "",
    whatsapp: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch("/api/requests", { credentials: "include" });
    const json = await res.json();
    if (json.success) setRequests(json.data.requests);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (user && user.role === "TEACHER" && user.teacher) {
      loadData();
      const t = user.teacher;
      setProfile({
        bio: t.bio || "",
        methods: (() => { try { return JSON.parse(t.methods || "[]"); } catch { return []; } })(),
        languages: (() => { try { return JSON.parse(t.languages || "[]"); } catch { return []; } })(),
        availability: t.availability || "",
        phone: t.phone || "",
        whatsapp: t.whatsapp || "",
      });
    }
  }, [user, loadData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Connexion requise</p>
        <Button asChild>
          <Link href="/login?redirect=/dashboard/teacher">Se connecter</Link>
        </Button>
      </div>
    );
  }

  if (user.role !== "TEACHER") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Ce tableau de bord est réservé aux enseignants.</p>
      </div>
    );
  }

  const teacher = user.teacher;
  if (!teacher) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Profil enseignant introuvable.</p>
        <Button asChild>
          <Link href="/candidature">Déposer une candidature</Link>
        </Button>
      </div>
    );
  }

  const saveProfile = async () => {
    setSavingProfile(true);
    const result = await apiCall("/api/teacher/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
    setSavingProfile(false);
    if (result.success) {
      toast.success("Profil mis à jour");
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const result = await apiCall(`/api/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (result.success) {
      toast.success("Statut mis à jour");
      loadData();
    }
  };

  const stats = {
    views: teacher.viewCount,
    rating: teacher.rating,
    reviews: teacher.reviewsCount,
    pending: requests.filter((r) => r.status === "PENDING").length,
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre profil et vos demandes reçues.
          </p>
        </div>
        {teacher.isPublished && (
          <Button asChild variant="outline">
            <Link href={`/annuaire/${teacher.slug}`}>
              <Eye className="mr-2 h-4 w-4" />
              Voir mon profil public
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Vues du profil", value: stats.views, icon: Eye, color: "text-primary" },
          { label: "Note moyenne", value: `${stats.rating.toFixed(1)} ★`, icon: Star, color: "text-warning" },
          { label: "Avis reçus", value: stats.reviews, icon: Award, color: "text-chart-4" },
          { label: "Demandes en attente", value: stats.pending, icon: Clock, color: "text-destructive" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  <div className="text-2xl font-bold mt-1">{stat.value}</div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status banner */}
      {!teacher.isPublished && (
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <div>
              <div className="font-semibold">Profil non publié</div>
              <div className="text-sm text-muted-foreground">
                Votre profil sera visible publiquement après validation par l'administration.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="requests">Demandes reçues</TabsTrigger>
          <TabsTrigger value="profile">Mon profil</TabsTrigger>
        </TabsList>

        {/* Requests */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Demandes reçues</CardTitle>
              <CardDescription>
                Parents qui vous ont sollicité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    Aucune demande reçue pour le moment.
                  </p>
                </div>
              ) : (
                requests.map((req) => {
                  const status = statusLabels[req.status] || { label: req.status, color: "bg-muted" };
                  return (
                    <Card key={req.id} className="border-border/60">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{req.parent.fullName}</span>
                              <Badge className={status.color}>{status.label}</Badge>
                              {req.priority === "URGENT" && (
                                <Badge variant="destructive">Urgent</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {req.parent.city}
                            </div>
                            <p className="text-sm mt-2 p-3 rounded-lg bg-muted/40">
                              {req.message}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(req.createdAt).toLocaleString("fr-FR")}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${req.parent.phone}`}>
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                Appeler
                              </a>
                            </Button>
                            {req.parent.whatsapp && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={`https://wa.me/${req.parent.whatsapp.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                  WhatsApp
                                </a>
                              </Button>
                            )}
                            {req.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateRequestStatus(req.id, "CONTACTED")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Contacté
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRequestStatus(req.id, "SCHEDULED")}
                                >
                                  Planifier
                                </Button>
                              </>
                            )}
                            {req.status === "CONTACTED" && (
                              <Button
                                size="sm"
                                onClick={() => updateRequestStatus(req.id, "COMPLETED")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Terminer
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mon profil public</CardTitle>
              <CardDescription>
                Ces informations sont visibles par les parents dans l'annuaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Avatar className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-chart-4 text-white">
                  <AvatarFallback className="bg-transparent text-white text-xl font-bold">
                    {teacher.fullName.split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">{teacher.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {teacher.specialty} · {teacher.subject}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{teacher.level}</Badge>
                    <Badge variant="outline">
                      <Star className="mr-1 h-3 w-3 fill-warning text-warning" />
                      {teacher.rating.toFixed(1)}
                    </Badge>
                    {teacher.isFeatured && <Badge>★ Top</Badge>}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Présentation</Label>
                <Textarea
                  id="bio"
                  rows={5}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile((p) => ({ ...p, whatsapp: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Statut actuel</Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div className="p-3 rounded-lg bg-muted/40">
                    <div className="text-xs text-muted-foreground">Ville</div>
                    <div className="font-semibold">{teacher.city}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <div className="text-xs text-muted-foreground">Expérience</div>
                    <div className="font-semibold">{teacher.experienceYears} ans</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <div className="text-xs text-muted-foreground">Tarif public</div>
                    <div className="font-semibold">${teacher.publicRate || "—"}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <div className="text-xs text-muted-foreground">Crédits internes</div>
                    <div className="font-semibold">{teacher.internalCredits}</div>
                  </div>
                </div>
              </div>

              <Button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
