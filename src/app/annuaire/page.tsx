"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Filter,
  X,
  SlidersHorizontal,
  Star,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TeacherCardPublic, type PublicTeacher } from "@/components/teachers/teacher-card-public";

const CITIES = [
  "Kinshasa", "Bukavu", "Goma", "Lubumbashi", "Kisangani",
  "Mbuji-Mayi", "Kolwezi", "Matadi", "Bunia", "Uvira", "Butembo", "Kananga",
];

const SUBJECTS = [
  "Mathématiques", "Physique-Chimie", "Informatique", "Langues",
  "Sciences", "Histoire-Géographie", "Économie", "Philosophie",
];

const LEVELS = ["Primaire", "Secondaire", "Universitaire"];
const AVAILABILITIES = ["En semaine", "Week-end", "Flexible"];
const SORTS = [
  { value: "compatibility", label: "Compatibilité" },
  { value: "rating", label: "Mieux notés" },
  { value: "experience", label: "Plus expérimentés" },
  { value: "rate", label: "Tarif croissant" },
  { value: "recent", label: "Plus récents" },
];

export default function AnnuairePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-11 w-full mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    }>
      <AnnuaireContent />
    </Suspense>
  );
}

function AnnuaireContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    subject: searchParams.get("subject") || "",
    level: searchParams.get("level") || "",
    availability: searchParams.get("availability") || "",
    minRating: searchParams.get("minRating") || "",
    maxRate: searchParams.get("maxRate") || "",
    sort: searchParams.get("sort") || "compatibility",
  });

  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchTeachers = useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.set(key, val);
      });
      params.set("page", String(p));
      params.set("pageSize", "12");

      const res = await fetch(`/api/teachers/search?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTeachers(json.data.teachers);
        setTotal(json.data.total);
        setPage(json.data.page);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTeachers(1);
  }, [fetchTeachers]);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    const queryString = params.toString();
    router.replace(`/annuaire${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [filters, router]);

  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter((v) => v !== "" && v !== "compatibility").length,
    [filters]
  );

  const resetFilters = () => {
    setFilters({
      q: "",
      city: "",
      subject: "",
      level: "",
      availability: "",
      minRating: "",
      maxRate: "",
      sort: "compatibility",
    });
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const FiltersContent = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="filter-city">Ville</Label>
        <Select value={filters.city} onValueChange={(v) => updateFilter("city", v === "all" ? "" : v)}>
          <SelectTrigger id="filter-city" className="mt-1.5">
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-subject">Matière</Label>
        <Select value={filters.subject} onValueChange={(v) => updateFilter("subject", v === "all" ? "" : v)}>
          <SelectTrigger id="filter-subject" className="mt-1.5">
            <SelectValue placeholder="Toutes les matières" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-level">Niveau</Label>
        <Select value={filters.level} onValueChange={(v) => updateFilter("level", v === "all" ? "" : v)}>
          <SelectTrigger id="filter-level" className="mt-1.5">
            <SelectValue placeholder="Tous les niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-availability">Disponibilité</Label>
        <Select value={filters.availability} onValueChange={(v) => updateFilter("availability", v === "all" ? "" : v)}>
          <SelectTrigger id="filter-availability" className="mt-1.5">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {AVAILABILITIES.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-maxRate">Budget max ($/h)</Label>
        <Input
          id="filter-maxRate"
          type="number"
          min={0}
          placeholder="Ex. 25"
          value={filters.maxRate}
          onChange={(e) => updateFilter("maxRate", e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="filter-minRating">Note minimale</Label>
        <Select value={filters.minRating} onValueChange={(v) => updateFilter("minRating", v === "all" ? "" : v)}>
          <SelectTrigger id="filter-minRating" className="mt-1.5">
            <SelectValue placeholder="Toutes les notes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les notes</SelectItem>
            <SelectItem value="4">4.0+ ★</SelectItem>
            <SelectItem value="4.5">4.5+ ★</SelectItem>
            <SelectItem value="4.8">4.8+ ★</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-sort">Trier par</Label>
        <Select value={filters.sort} onValueChange={(v) => updateFilter("sort", v)}>
          <SelectTrigger id="filter-sort" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Réinitialiser ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Annuaire des enseignants
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tous les profils sont vérifiés par notre équipe avant publication.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, spécialité, bio..."
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="default" className="h-11 md:hidden relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtres avancés</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block">
          <Card>
            <CardContent className="p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                </h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <FiltersContent />
            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? "Chargement..." : (
                <>
                  <span className="font-semibold text-foreground">{total}</span>{" "}
                  enseignant{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex gap-3 mb-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-4" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-semibold mb-1">Aucun enseignant trouvé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Essayez d'élargir vos critères de recherche.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teachers.map((teacher) => (
                <TeacherCardPublic key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchTeachers(page - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => fetchTeachers(page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
