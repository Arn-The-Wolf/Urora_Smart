"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { SyncBadge } from "@/components/sync/sync-badge";
import { UroraMark } from "@/components/brand/logo";
import { LogoutButton } from "@/components/auth/logout-button";
import { PwaInstallBanner } from "@/components/pwa/install-banner";
import { useFarmData } from "@/lib/offline/provider";

export function AppShell({ children }: { children: ReactNode }) {
  const { farm, pending, online } = useFarmData();

  return (
    <div className="min-h-full md:pl-[246px]">
      <Sidebar />
      <header className="flex items-center justify-between bg-[#173d31] px-5 py-4 text-white md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-lg transition hover:opacity-90" aria-label="Spring Farms home">
          <UroraMark />
          <strong className="text-xl tracking-[-1px]">Spring Farms</strong>
        </Link>
        <div className="flex items-center gap-2">
          <SyncBadge />
          <LogoutButton variant="ghost" className="border border-[#35604d] text-[#d8e6dc] hover:bg-[#2b5d4a] hover:text-white" />
        </div>
      </header>
      {!online || pending > 0 ? (
        <div className="border-b border-[#e5c9b8] bg-[#fff8f3] px-4 py-2 text-center text-xs text-[#8a5a32] md:px-[42px]">
          {!online
            ? "You’re offline — cow, milk, health, stock, and wash changes queue on this device."
            : `${pending} change${pending === 1 ? "" : "s"} waiting to sync. Tap the sync badge when ready.`}
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-[1250px] px-4 pb-24 pt-6 md:px-[42px] md:pb-12 md:pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 md:mb-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 rounded-[10px] border border-[#dfe8df] bg-white px-3.5 py-2.5 text-sm font-bold text-[#176b45] shadow-sm transition hover:border-[#b9cbbd] hover:bg-[#f6faf5]"
            aria-label="Spring Farms home"
          >
            <UroraMark />
            Spring Farms
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-full border border-[#dfe8df] bg-[#f6faf5] px-3.5 py-1.5 text-sm text-[#3d5c4c]">
              {farm.name}
            </span>
            <LogoutButton />
          </div>
        </div>
        {children}
      </main>
      <PwaInstallBanner />
      <BottomNav />
    </div>
  );
}
