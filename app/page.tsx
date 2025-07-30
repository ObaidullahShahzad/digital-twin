"use client";
import { useAuth } from "@/services/auth";
import AuthForm from "./components/auth/authForm";
import BotsList from "./components/botList/botList";
import { Suspense } from "react";
import Loading from "./components/loading";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("page.tsx: Rendering", {
    isAuthenticated,
    isLoading,
    timestamp: new Date().toISOString(),
  });

  return isAuthenticated ? <BotsList /> : <AuthForm />;
}
