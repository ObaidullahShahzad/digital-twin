"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { setCookie } from "@/services/serverAction";

const AuthForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const handleAuth = async () => {
      if (hasRedirected) return;

      const token = Cookies.get("authToken");
      const success = searchParams.get("success");
      const accessToken = searchParams.get("access_token");
      const expiresAt = searchParams.get("expires_at");

      console.log("AuthForm useEffect:", {
        success,
        accessToken,
        expiresAt,
        token,
      });

      if (token) {
        console.log("Existing token found, redirecting to /bots");
        setHasRedirected(true);
        router.replace("/bots");
        return;
      }

      if (success === "true" && accessToken) {
        console.log("Setting new token and redirecting to /bots");
        const expiresDate = expiresAt
          ? new Date(expiresAt)
          : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 1 day
        if (isNaN(expiresDate.getTime())) {
          console.error("Invalid expiresAt date:", expiresAt);
          setError("Invalid token expiration date. Please try again.");
          return;
        }
        await setCookie("authToken", accessToken);
        setHasRedirected(true);
        router.replace("/bots");
      } else if (success === "false") {
        console.log("Authentication failed");
        setError("Authentication failed. Please try again.");
      }
    };
    handleAuth();
  }, [searchParams, router, hasRedirected]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      if (!baseUrl) {
        throw new Error("API base URL is not defined.");
      }
      window.location.href = `${baseUrl}login/google`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate Google login. Please try again."
      );
      setLoading(false);
    }
  };

  const particles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full"
      animate={{
        x: [0, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 5,
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">{particles}</div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-2xl bg-white/95 border border-white/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-gray-50/20 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/30 to-transparent rounded-3xl" />

          <div className="relative z-10 text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2"
            >
              Welcome
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-sm"
            >
              Sign in to continue
            </motion.p>
          </div>

          <div className="relative z-10 space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-50/80 border border-red-200/50 text-red-600 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 relative overflow-hidden hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <div className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"
                      />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.20-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
