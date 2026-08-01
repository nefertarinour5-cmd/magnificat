"use client";

import Link from "next/link";
import {
  MapPin,
  Star,
  Clock,
  Award,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

export interface PublicTeacher {
  id: string;
  slug: string;
  fullName: string;
  specialty: string;
  level: string;
  subject: string;
  experienceYears: number;
  city: string;
  commune?: string | null;
  bio: string;
  rating: number;
  reviewsCount: number;
  availability: string;
  publicRate: number | null;
  methods: string[];
  languages: string[];
  compatibility?: number;
  isFeatured?: boolean;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() || "")
    .join("");
}

export function TeacherCardPublic({ teacher }: { teacher: PublicTeacher }) {
  const { apiCall } = useApi();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await apiCall<{ added: boolean; favorite?: { id: string } }>(
      "/api/favorites",
      {
        method: "POST",
        body: JSON.stringify({ teacherId: teacher.id }),
      }
    );
    if (result.success) {
      toast.success(result.data?.added ? "Ajouté aux favoris" : "Retiré des favoris");
    }
  };

  return (
    <Link href={`/annuaire/${teacher.slug}`} className="block group">
      <Card className="h-full border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-chart-4 text-white">
              <AvatarFallback className="bg-transparent text-white font-semibold">
                {initials(teacher.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold truncate">{teacher.fullName}</h3>
                {teacher.isFeatured && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
                    ★ Top
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {teacher.specialty} · {teacher.subject}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{teacher.city}{teacher.commune ? `, ${teacher.commune}` : ""}</span>
              </div>
            </div>
            {teacher.compatibility !== undefined && (
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-success leading-none">
                  {teacher.compatibility}%
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Match</div>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {teacher.bio}
          </p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[11px]">
              {teacher.level}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              <Clock className="mr-1 h-2.5 w-2.5" />
              {teacher.availability}
            </Badge>
            {teacher.languages.slice(0, 2).map((lang) => (
              <Badge key={lang} variant="outline" className="text-[11px]">
                {lang}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-border/60">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="font-semibold text-foreground">{teacher.rating.toFixed(1)}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {teacher.reviewsCount} avis
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Award className="h-3 w-3" />
                <span className="font-semibold text-foreground">{teacher.experienceYears} ans</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Expérience</div>
            </div>
            <div className="text-right">
              {teacher.publicRate !== null && teacher.publicRate > 0 ? (
                <>
                  <div className="text-sm font-semibold">${teacher.publicRate}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">/heure</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold">Sur demande</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Tarif admin</div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-9"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/annuaire/${teacher.slug}?action=solicit`;
              }}
            >
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              Solliciter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-2.5"
              onClick={handleFavorite}
              aria-label="Ajouter aux favoris"
            >
              <Heart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
