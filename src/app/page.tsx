"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { OnboardingForm } from "@/components/OnboardingForm";
import { ToastProvider } from "@/components/ui/Toast";
import { useStore, useHydrated } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const route = useStore((s) => s.route);

  useEffect(() => {
    if (hydrated && route) {
      router.replace("/route");
    }
  }, [hydrated, route, router]);

  // Show a layout-matching skeleton while hydrating for returning users
  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--paper)]">
        <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] h-14" />
        <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8 py-12 md:py-16">
          <Skeleton variant="line" height="44px" width="60%" className="mb-10" />
          <div className="flex flex-col gap-6 max-w-[560px]">
            <Skeleton variant="block" height="44px" />
            <Skeleton variant="block" height="44px" />
            <Skeleton variant="block" height="44px" />
            <Skeleton variant="line" height="44px" width="180px" />
          </div>
        </main>
      </div>
    );
  }

  // If route exists, redirect is happening
  if (route) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)]">
      <TopBar />
      <main className="flex-1">
        <OnboardingForm />
      </main>
      <ToastProvider />
    </div>
  );
}
