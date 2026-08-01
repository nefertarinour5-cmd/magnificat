"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Clock,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  DollarSign,
  Star,
  Loader2,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  Trash2,
  Edit,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  age: number | null;
  specialty: string;
  level: string;
  subject: string;
  experienceYears: number;
  city: string;
  commune: string | null;
  desiredRate: number;
  availability: string;
  bio: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

interface Teacher {
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
  rating: number;
  reviewsCount: number;
  availability: string;
  hourlyRate: number;
  publicRate: number | null;
  internalCredits: number;
  isVerified: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  user: { email: string; isActive: boolean; lastLoginAt: string | null };
}

interface Request {
  id: string;
  status: string;
  message: string;
  priority: string;
  createdAt: string;
  parent: { id: string; fullName: string; phone: string; whatsapp: string | null; city: string; address: string };
  teacher: { id: string; fullName: string; subject: string; city: string; phone: string };
}

interface Parent {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string | null;
  city: string;
  address: string;
  need: string | null;
  createdAt: string;
  user: { email: string; isActive: boolean; lastLoginAt: string | null };
  _count: { requests: number; reviews: number; favorites: number };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-warning/15 text-warning" },
  CONTACTED: { label: "Contacté", color: "bg-primary/15 text-primary" },
  SCHEDULED: { label: "Planifié", color: "bg-chart-2/15 text-chart-2" },
  COMPLETED: { label: "Terminé", color: "bg-success/15 text-success" },
  CANCELLED: { label: "Annulé", color: "bg-destructive/15 text-destructive" },
  ORIENTED: { label: "Orienté", color: "bg-chart-4/15 text-chart-4" },
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { apiCall } = useApi();
  const [stats, setStats] = useState<{
    pendingApplications: number;
    publishedTeachers: number;
    activeParents: number;
    pendingRequests: number;
    totalTeachers: number;
    totalParents: number;
    totalRequests: number;
  } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    application: Application | null;
  }>({ open: false, application: null });
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "INTERVIEW">("APPROVE");
  const [publicRate, setPublicRate] = useState("");
  const [internalCredits, setInternalCredits] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Teacher edit dialog
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    teacher: Teacher | null;
  }>({ open: false, teacher: null });
  const [editForm, setEditForm] = useState({
    hourlyRate: "",
    publicRate: "",
    internalCredits: "",
    isFeatured: false,
    isPublished: true,
    isVerified: true,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    const [statsRes, appsRes, teachersRes, reqRes, parentsRes] = await Promise.all([
      fetch("/api/admin/stats", { credentials: "include" }),
      fetch("/api/admin/applications", { credentials: "include" }),
      fetch("/api/admin/teachers", { credentials: "include" }),
      fetch("/api/admin/requests", { credentials: "include" }),
      fetch("/api/admin/parents", { credentials: "include" }),
    ]);
    const statsJson = await statsRes.json();
    const appsJson = await appsRes.json();
    const teachersJson = await teachersRes.json();
    const reqJson = await reqRes.json();
    const parentsJson = await parentsRes.json();

    if (statsJson.success) setStats(statsJson.data.stats);
    if (appsJson.success) setApplications(appsJson.data.applications);
    if (teachersJson.success) setTeachers(teachersJson.data.teachers);
    if (reqJson.success) setRequests(reqJson.data.requests);
    if (parentsJson.success) setParents(parentsJson.data.parents);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadData();
    }
  }, [user, loadData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Accès réservé aux administrateurs.</p>
        <Button asChild className="mt-4">
          <Link href="/login?redirect=/dashboard/admin">Se connecter</Link>
        </Button>
      </div>
    );
  }

  const openReview = (app: Application, action: "APPROVE" | "REJECT" | "INTERVIEW") => {
    setReviewDialog({ open: true, application: app });
    setReviewAction(action);
    setPublicRate(String(app.desiredRate));
    setInternalCredits("0");
    setAdminNote("");
  };

  const submitReview = async () => {
    if (!reviewDialog.application) return;
    setSubmittingReview(true);
    const result = await apiCall("/api/applications/review", {
      method: "POST",
      body: JSON.stringify({
        applicationId: reviewDialog.application.id,
        action: reviewAction,
        publicRate: reviewAction === "APPROVE" ? parseInt(publicRate) || 0 : undefined,
        internalCredits: reviewAction === "APPROVE" ? parseInt(internalCredits) || 0 : undefined,
        adminNote: adminNote || undefined,
      }),
    });
    setSubmittingReview(false);
    if (result.success) {
      toast.success(reviewAction === "APPROVE" ? "Candidature acceptée" : reviewAction === "REJECT" ? "Candidature refusée" : "Entretien programmé");
      setReviewDialog({ open: false, application: null });
      loadData();
    }
  };

  const openEdit = (teacher: Teacher) => {
    setEditDialog({ open: true, teacher });
    setEditForm({
      hourlyRate: String(teacher.hourlyRate),
      publicRate: String(teacher.publicRate || ""),
      internalCredits: String(teacher.internalCredits),
      isFeatured: teacher.isFeatured,
      isPublished: teacher.isPublished,
      isVerified: teacher.isVerified,
    });
  };

  const submitEdit = async () => {
    if (!editDialog.teacher) return;
    setSubmittingEdit(true);
    const result = await apiCall("/api/admin/teachers", {
      method: "PATCH",
      body: JSON.stringify({
        teacherId: editDialog.teacher.id,
        hourlyRate: parseInt(editForm.hourlyRate) || 0,
        publicRate: editForm.publicRate ? parseInt(editForm.publicRate) : undefined,
        internalCredits: parseInt(editForm.internalCredits) || 0,
        isFeatured: editForm.isFeatured,
        isPublished: editForm.isPublished,
        isVerified: editForm.isVerified,
      }),
    });
    setSubmittingEdit(false);
    if (result.success) {
      toast.success("Enseignant mis à jour");
      setEditDialog({ open: false, teacher: null });
      loadData();
    }
  };

  const unpublishTeacher = async (id: string) => {
    if (!confirm("Retirer cet enseignant de la publication ?")) return;
    const result = await apiCall(`/api/admin/teachers?id=${id}`, { method: "DELETE" });
    if (result.success) {
      toast.success("Enseignant dépublié");
      loadData();
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    const result = await apiCall(`/api/requests/${id}`, { method: "DELETE" });
    if (result.success) {
      toast.success("Demande supprimée");
      loadData();
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Administration
        </h1>
        <p className="text-muted-foreground mt-1">
          Pilotage de la plateforme TeachHire RDC
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Candidatures en attente", value: stats.pendingApplications, icon: Clock, color: "text-warning" },
            { label: "Enseignants publiés", value: stats.publishedTeachers, icon: GraduationCap, color: "text-primary" },
            { label: "Parents inscrits", value: stats.activeParents, icon: Users, color: "text-chart-2" },
            { label: "Demandes en attente", value: stats.pendingRequests, icon: MessageCircle, color: "text-destructive" },
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
      )}

      <Tabs defaultValue="applications">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
          <TabsTrigger value="applications">Candidatures</TabsTrigger>
          <TabsTrigger value="teachers">Enseignants</TabsTrigger>
          <TabsTrigger value="requests">Demandes</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
        </TabsList>

        {/* Applications */}
        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidatures en attente</CardTitle>
              <CardDescription>
                Validez ou refusez les candidatures enseignants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : applications.filter((a) => a.status === "PENDING").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune candidature en attente.
                </div>
              ) : (
                applications.filter((a) => a.status === "PENDING").map((app) => (
                  <Card key={app.id} className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{app.fullName}</span>
                            <Badge variant="secondary">{app.age} ans</Badge>
                            <Badge variant="outline">{app.specialty}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {app.subject} · {app.level} · {app.experienceYears} ans d'expérience
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.city}{app.commune ? `, ${app.commune}` : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {app.phone}
                            </span>
                            <span>{app.email}</span>
                          </div>
                          <p className="text-sm mt-2 p-3 rounded-lg bg-muted/40 line-clamp-3">
                            {app.bio}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Soumis le {new Date(app.createdAt).toLocaleString("fr-FR")} · Tarif souhaité: ${app.desiredRate}/h
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button size="sm" onClick={() => openReview(app, "APPROVE")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Accepter
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openReview(app, "INTERVIEW")}>
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Entretien
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => openReview(app, "REJECT")}>
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers */}
        <TabsContent value="teachers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enseignants publiés</CardTitle>
              <CardDescription>
                Gérez les profils, tarifs et statuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun enseignant.
                </div>
              ) : (
                teachers.map((t) => (
                  <Card key={t.id} className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/annuaire/${t.slug}`} className="font-semibold hover:text-primary">
                              {t.fullName}
                            </Link>
                            {t.isFeatured && <Badge className="bg-warning text-warning-foreground">★ Top</Badge>}
                            {!t.isPublished && <Badge variant="destructive">Non publié</Badge>}
                            {!t.isVerified && <Badge variant="outline">Non vérifié</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {t.subject} · {t.level} · {t.city}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span>★ {t.rating.toFixed(1)} ({t.reviewsCount})</span>
                            <span>{t.experienceYears} ans exp.</span>
                            <span>{t.viewCount} vues</span>
                            <span>Tarif: ${t.publicRate || "—"}</span>
                            <span>Crédits: {t.internalCredits}</span>
                            <span>{t.user.email}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Modifier
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => unpublishTeacher(t.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Dépublier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les demandes</CardTitle>
              <CardDescription>
                Suivi des sollicitations parent → enseignant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune demande.
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
                              <span className="text-muted-foreground">→</span>
                              <span className="font-semibold">{req.teacher.fullName}</span>
                              <Badge className={status.color}>{status.label}</Badge>
                              {req.priority === "URGENT" && <Badge variant="destructive">Urgent</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {req.teacher.subject} · {req.parent.city}
                            </div>
                            <p className="text-sm mt-2 p-3 rounded-lg bg-muted/40 line-clamp-2">
                              {req.message}
                            </p>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(req.createdAt).toLocaleString("fr-FR")}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${req.parent.phone}`}>
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                Parent
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${req.teacher.phone}`}>
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                Enseignant
                              </a>
                            </Button>
                            <Select onValueChange={(v) => updateRequestStatus(req.id, v)}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Changer statut" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CONTACTED">Contacté</SelectItem>
                                <SelectItem value="SCHEDULED">Planifié</SelectItem>
                                <SelectItem value="COMPLETED">Terminé</SelectItem>
                                <SelectItem value="ORIENTED">Orienté</SelectItem>
                                <SelectItem value="CANCELLED">Annulé</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteRequest(req.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Supprimer
                            </Button>
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

        {/* Parents */}
        <TabsContent value="parents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Parents inscrits</CardTitle>
              <CardDescription>
                Vue d'ensemble des comptes parents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : parents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun parent inscrit.
                </div>
              ) : (
                parents.map((p) => (
                  <Card key={p.id} className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{p.fullName}</span>
                            {!p.user.isActive && <Badge variant="destructive">Inactif</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {p.city} · {p.address}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {p.phone}
                            </span>
                            <span>{p.user.email}</span>
                            <span>Inscrit le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
                          </div>
                          {p.need && (
                            <p className="text-sm mt-2 p-3 rounded-lg bg-muted/40">
                              Besoin: {p.need}
                            </p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{p._count.requests} demandes</span>
                            <span>{p._count.reviews} avis</span>
                            <span>{p._count.favorites} favoris</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${p.phone}`}>
                            <Phone className="h-3.5 w-3.5 mr-1" />
                            Appeler
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(o) => setReviewDialog({ open: o, application: reviewDialog.application })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "APPROVE" && "Accepter la candidature"}
              {reviewAction === "REJECT" && "Refuser la candidature"}
              {reviewAction === "INTERVIEW" && "Programmer un entretien"}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.application?.fullName} — {reviewDialog.application?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewAction === "APPROVE" && (
              <>
                <div>
                  <Label htmlFor="publicRate">Tarif public ($/heure)</Label>
                  <Input
                    id="publicRate"
                    type="number"
                    value={publicRate}
                    onChange={(e) => setPublicRate(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="internalCredits">Crédits internes initiaux</Label>
                  <Input
                    id="internalCredits"
                    type="number"
                    value={internalCredits}
                    onChange={(e) => setInternalCredits(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="adminNote">Note interne (optionnel)</Label>
              <Textarea
                id="adminNote"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="mt-1.5"
                placeholder="Commentaire pour les archives..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog({ open: false, application: null })}>
              Annuler
            </Button>
            <Button
              onClick={submitReview}
              disabled={submittingReview}
              variant={reviewAction === "REJECT" ? "destructive" : "default"}
            >
              {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teacher Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(o) => setEditDialog({ open: o, teacher: editDialog.teacher })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'enseignant</DialogTitle>
            <DialogDescription>
              {editDialog.teacher?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-hourlyRate">Tarif interne ($/h)</Label>
                <Input
                  id="edit-hourlyRate"
                  type="number"
                  value={editForm.hourlyRate}
                  onChange={(e) => setEditForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-publicRate">Tarif public ($/h)</Label>
                <Input
                  id="edit-publicRate"
                  type="number"
                  value={editForm.publicRate}
                  onChange={(e) => setEditForm((f) => ({ ...f, publicRate: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-internalCredits">Crédits internes</Label>
              <Input
                id="edit-internalCredits"
                type="number"
                value={editForm.internalCredits}
                onChange={(e) => setEditForm((f) => ({ ...f, internalCredits: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isFeatured}
                  onChange={(e) => setEditForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Enseignant en vedette (★ Top)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Profil publié publiquement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isVerified}
                  onChange={(e) => setEditForm((f) => ({ ...f, isVerified: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Profil vérifié</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, teacher: null })}>
              Annuler
            </Button>
            <Button onClick={submitEdit} disabled={submittingEdit}>
              {submittingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
