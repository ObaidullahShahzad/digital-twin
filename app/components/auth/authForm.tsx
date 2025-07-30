// components/auth/authForm.tsx
"use client";
import { useAuth } from "@/services/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const theme = {
  primary: "#244855", // Dark teal
  secondary: "#E64833", // Coral red
  accent: "#874F41", // Brown
  neutral: "#90AEAD", // Light teal
  light: "#FBE9D0", // Light cream
  text: {
    primary: "#2D3748", // Dark gray
    secondary: "#4A5568", // Medium gray
    light: "#718096", // Light gray
  },
  background: {
    primary: "#F7FAFC", // Very light gray
    secondary: "#EDF2F7", // Light gray
    card: "#FFFFFF", // White
  },
  border: {
    light: "#E2E8F0", // Light border
    medium: "#CBD5E0", // Medium border
    dark: "#A0AEC0", // Dark border
  },
  status: {
    success: "#48BB78",
    warning: "#ED8936",
    error: "#E53E3E",
  },
};

const AuthForm: React.FC = () => {
  const { isLoading, error, initiateGoogleLogin } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: theme.primary }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 rounded-full"
              style={{
                borderColor: theme.neutral,
                borderTopColor: theme.light,
              }}
            />
          </div>
        )}

        {!isLoading && (
          <div
            className="rounded-2xl p-8 shadow-lg border"
            style={{
              backgroundColor: theme.border.light,
              borderColor: theme.neutral,
            }}
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 shadow-sm"
                style={{ backgroundColor: theme.primary }}
              >
                <Sparkles className="w-8 h-8" style={{ color: theme.light }} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-3xl font-bold mb-2"
                style={{ color: theme.primary }}
              >
                Welcome
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-sm"
                style={{ color: theme.primary }}
              >
                Sign in to continue
              </motion.p>
            </div>

            <div className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-4 py-3 rounded-lg text-sm border"
                    style={{
                      backgroundColor: `${theme.status.error}15`,
                      borderColor: `${theme.status.error}30`,
                      color: theme.status.error,
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={initiateGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-lg font-semibold shadow-sm border transition-all duration-200 disabled:opacity-50 hover:shadow-md"
                  style={{
                    backgroundColor: theme.primary,
                    borderColor: theme.neutral,
                    color: theme.background.card,
                  }}
                >
                  <div className="flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 rounded-full mr-2"
                          style={{
                            borderColor: theme.border.light,
                            borderTopColor: theme.text.secondary,
                          }}
                        />
                        <span style={{ color: theme.text.primary }}>
                          Signing in...
                        </span>
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
        )}
      </motion.div>
    </div>
  );
};

export default AuthForm;
