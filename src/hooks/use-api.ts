"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Lightweight wrapper around `fetch` that:
 *  - sends JSON by default
 *  - includes credentials (cookies) so the session is forwarded
 *  - surfaces API errors as Sonner toasts
 *  - returns a typed `data` payload on success
 *
 * Usage:
 *   const { apiCall } = useApi();
 *   const result = await apiCall<{ added: boolean }>("/api/favorites", { method: "POST", body: ... });
 *   if (result.success) { result.data?.added ... }
 */
export function useApi() {
  const apiCall = useCallback(
    async <T = unknown>(
      url: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          const msg = json.error || `Erreur ${res.status}`;
          toast.error(msg);
          return { success: false, error: msg };
        }

        return { success: true, data: json.data as T };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur réseau";
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    []
  );

  return { apiCall };
}
