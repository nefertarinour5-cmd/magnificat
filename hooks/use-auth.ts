"use client";

import { useEffect, useState, useCallback } from "react";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "PARENT";
  isActive: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  parent?: {
    id: string;
    fullName: string;
    phone: string;
    whatsapp: string | null;
    city: string;
    address: string;
    need: string | null;
  } | null;
  teacher?: {
    id: string;
    slug: string;
    fullName: string;
    specialty: string;
    level: string;
    subject: string;
    experienceYears: number;
    city: string;
    commune: string | null;
    bio: string;
    methods: string;
    languages: string;
    rating: number;
    reviewsCount: number;
    isVerified: boolean;
    isPublished: boolean;
    isFeatured: boolean;
    availability: string;
    publicRate: number | null;
    viewCount: number;
    internalCredits: number;
    phone: string;
    whatsapp: string | null;
  } | null;
}

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      setUser(json.data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, loading, refresh, logout, setUser };
}
