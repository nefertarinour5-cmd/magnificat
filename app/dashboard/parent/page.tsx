"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import Link from "next/link";

interface Request {
  id: string;
  status: string;
  message: string;
  priority: string;
  createdAt: string;
  teacher: {
    id: string;
    fullName: string;
    subject: string;
    city: string;
    phone: string;
    whatsapp: string | null;
  };
}

interface Favorite {
  id: string;
  createdAt: string;
  teacher: {
    id: string;
    slug: string;
    fullName: string;
    subject: string;
    city: string;
    rating: number;
    publicRate: number | null;
  };
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase() || "").join("");
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-warning/15 text-warning" },
  CONTACTED: { label: "Contacté", color: "bg-primary/15 text-primary" },
  SCHEDULED: { label: "Planifié", color: "bg-chart-2/15 text-chart-2" },
  COMPLETED: { label: "Terminé", color: "bg-success/15 text-success" },
  CANCELLED: { label: "Annulé", color: "bg-destructive/15 text-destructive" },
  ORIENTED: { label: "Orienté", color: "bg-chart-4/15 text-chart-4" },
};

export default function ParentDashboard() {
  const { user, loading } = useAuth();
  const { apiCall } = useApi();
  const [requests, setRequests] = useState<Request[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    city: "",
    address: "",
    need: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    const [reqRes, favRes] = await Promise.all([
      fetch("/api/requests", { credentials: "include" }),
      fetch("/api/favorites", { credentials: "include" }),
    ]);
    const reqJson = await reqRes.json();
    const favJson = await favRes.json();
    if (reqJson.success) setRequests(reqJson.data.requests);
    if (favJson.success) setFavorites(favJson.data.favorites);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (user && user.role === "PARENT") {
      loadData();
      if (user.parent) {
        setProfile({
          fullName: user.parent.fullName || user.name,
          phone: user.parent.phone || user.phone || "",
          whatsapp: user.parent.whatsapp || user.whatsapp || "",
          city: user.parent.city || "",
          address: user.parent.address || "",
          need: user.parent.need || "",
        });
      } else {
        setProfile({
          fullName: user.name,
          phone: user.phone || "",
          whatsapp: user.whatsapp || "",
          city: "",
          address: "",
          need: "",
        });
      }
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
          <Link href="/login?redirect=/dashboard/parent">Se connecter</Link>
        </Button>
      </div>
    );
  }

  if (user.role !== "PARENT") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Ce tableau de bord est réservé aux parents.</p>
      </div>
    );
  }

  const saveProfile = async () => {
    setSavingProfile(true);
    const result = await apiCall("/api/parent/profile", {
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
      toast.success("Demande annulée");
      loadData();
    }
  };

  const removeFavorite = async (teacherId: string) => {
    const result = await apiCall("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ teacherId }),
    });
    if (result.success) {
      toast.success("Retiré des favoris");
      loadData();
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    active: requests.filter((r) => ["CONTACTED", "SCHEDULED"].includes(r.status)).length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Bonjour, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos demandes, vos favoris et votre profil.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Demandes totales", value: stats.total, icon: MessageCircle, color: "text-primary" },
          { label: "En attente", value: stats.pending, icon: Clock, color: "text-warning" },
          { label: "Actives", value: stats.active, icon: Send, color: "text-chart-2" },
          { label: "Terminées", value: stats.completed, icon: CheckCircle2, color: "text-success" },
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

      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="requests">Demandes</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        {/* Requests */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes demandes</CardTitle>
              <CardDescription>
                Historique de vos sollicitations aux enseignants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-3">
                    Aucune demande pour le moment.
                  </p>
                  <Button asChild>
                    <Link href="/annuaire">Explorer l'annuaire</Link>
                  </Button>
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
                              <Link
                                href={`/annuaire/${req.teacher.fullName.toLowerCase().replace(/\s+/g, "-")}`}
                                className="font-semibold hover:text-primary"
                              >
                                {req.teacher.fullName}
                              </Link>
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {req.teacher.subject} · {req.teacher.city}
                            </div>
                            <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                              {req.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>{new Date(req.createdAt).toLocaleString("fr-FR")}</span>
                              {req.priority !== "NORMAL" && (
                                <Badge variant="outline" className="text-xs">
                                  Priorité {req.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${req.teacher.phone}`}>
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                Appeler
                              </a>
                            </Button>
                            {req.teacher.whatsapp && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={`https://wa.me/${req.teacher.whatsapp.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                  WhatsApp
                                </a>
                              </Button>
                            )}
                            {req.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => updateRequestStatus(req.id, "CANCELLED")}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Annuler
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

        {/* Favorites */}
        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes favoris</CardTitle>
              <CardDescription>Enseignants que vous avez sauvegardés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-3">
                    Aucun favori pour le moment.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/annuaire">Explorer l'annuaire</Link>
                  </Button>
                </div>
              ) : (
                favorites.map((fav) => (
                  <Card key={fav.id} className="border-border/60">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-chart-4 text-white">
                        <AvatarFallback className="bg-transparent text-white">
                          {initials(fav.teacher.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/annuaire/${fav.teacher.slug}`}
                          className="font-semibold hover:text-primary truncate block"
                        >
                          {fav.teacher.fullName}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {fav.teacher.subject} · {fav.teacher.city}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFavorite(fav.teacher.id)}
                        aria-label="Retirer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mon profil</CardTitle>
              <CardDescription>
                Ces informations permettent aux enseignants de mieux vous connaître
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
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
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                    className="mt-1.5"
                    placeholder="Commune, avenue, quartier..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="need">Besoin principal</Label>
                  <Textarea
                    id="need"
                    rows={3}
                    value={profile.need}
                    onChange={(e) => setProfile((p) => ({ ...p, need: e.target.value }))}
                    placeholder="Soutien, devoirs, examens, cours à domicile..."
                  />
                </div>
              </div>
              <Button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
