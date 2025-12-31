"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import CursorParticles from "@/components/CursorParticles";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (currentUser) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="relative">
      <CursorParticles />
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-black transition-colors shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}

