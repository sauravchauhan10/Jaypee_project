"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { authTokens } from "@/lib/auth";
import { useAuthStore, type AuthUser } from "@/store/auth-store";

// ── Types ─────────────────────────────────────────────────────

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

interface LoginInput {
  email: string;
  password: string;
  role: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
}

// ── Mutations ─────────────────────────────────────────────────

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) =>
      api.post<AuthResponse>("/api/auth/login", data),
    onSuccess: (data) => {
      authTokens.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      api.post<AuthResponse>("/api/auth/register", data),
    onSuccess: (data) => {
      authTokens.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = authTokens.getRefreshToken();
      if (refreshToken) {
        await api
          .post("/api/auth/logout", { refreshToken })
          .catch(() => null);
      }
    },
    onSettled: () => {
      authTokens.clearTokens();
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });
}

// ── Queries ───────────────────────────────────────────────────

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const result = await api.get<{ user: AuthUser }>("/api/auth/me");
      return result.user;
    },
    enabled: isAuthenticated && authTokens.hasTokens(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ── Route Guards ──────────────────────────────────────────────

export function useRequireAuth(redirectTo = "/login") {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isHydrated, router, redirectTo]);

  return { isAuthenticated, isLoading: !isHydrated };
}

export function useRedirectIfAuth(redirectTo = "/dashboard") {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isHydrated, router, redirectTo]);
}
