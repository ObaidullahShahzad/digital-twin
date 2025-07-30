// lib/auth.ts
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { fetchGoogleAuthToken } from "@/services/api";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !!Cookies.get("authToken"),
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async () => {
      if (!isMounted) {
        console.log("handleAuth: Component unmounted, skipping");
        return;
      }

      const token = Cookies.get("authToken");
      const success = searchParams.get("success");
      const session = searchParams.get("session");
      const error = searchParams.get("error");

      console.log("useAuth: handleAuth", {
        token: token || "none",
        success,
        session,
        error,
        timestamp: new Date().toISOString(),
      });

      // If token exists, user is authenticated
      if (token) {
        if (searchParams.get("pathname") === "/signin") {
          console.log("useAuth: Token found, redirecting from /signin to /");
          router.replace("/");
        }
        setAuthState({ isAuthenticated: true, isLoading: false, error: null });
        return;
      }

      // Handle OAuth callback
      if (success === "true" && session) {
        try {
          console.log(
            "useAuth: Processing OAuth callback with session:",
            session
          );
          setAuthState((prev) => ({ ...prev, isLoading: true }));

          const authData = await fetchGoogleAuthToken(session);
          if (!authData.access_token || !authData.expires_at) {
            throw new Error(
              "Invalid response: missing access_token or expires_at"
            );
          }

          let expiresDate = new Date(authData.expires_at);
          if (isNaN(expiresDate.getTime()) || expiresDate < new Date()) {
            console.warn("useAuth: Invalid or past expires_at, using fallback");
            expiresDate = new Date(Date.now() + 60 * 60 * 1000);
          }

          Cookies.set("authToken", authData.access_token, {
            expires: expiresDate,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });

          console.log("useAuth: Cookie set, redirecting to /");
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          router.replace("/");
        } catch (err) {
          console.error("useAuth: OAuth callback error:", err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to authenticate with Google. Please try again.";
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          router.replace("/signin");
        }
      } else if (error) {
        console.error("useAuth: Authentication error from URL:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: `Authentication failed: ${error}. Please try again.`,
        });
        router.replace("/signin");
      } else {
        // No token and no valid OAuth params
        console.log(
          "useAuth: No token or OAuth params, redirecting to /signin"
        );
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        if (searchParams.get("pathname") !== "/signin") {
          router.replace("/signin");
        }
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  const signOut = () => {
    console.log("useAuth: Signing out, removing authToken");
    Cookies.remove("authToken");
    setAuthState({ isAuthenticated: false, isLoading: false, error: null });
    router.replace("/signin");
  };

  const initiateGoogleLogin = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        throw new Error("API base URL is not defined.");
      }
      const redirectUrl = `${baseUrl}login/google?redirect_uri=${encodeURIComponent(
        "http://localhost:3002/auth/callback"
      )}`;
      console.log(
        "useAuth: Initiating Google login, redirecting to:",
        redirectUrl
      );
      window.location.assign(redirectUrl);
    } catch (err) {
      console.error("useAuth: Google login error:", err);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to initiate Google login. Please try again.",
      }));
    }
  };

  return { ...authState, signOut, initiateGoogleLogin };
};
