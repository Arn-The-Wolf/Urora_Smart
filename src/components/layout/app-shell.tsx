"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { SyncBadge } from "@/components/sync/sync-badge";
import { UroraMark } from "@/components/brand/logo";
import { useFarmData } from "@/lib/offline/provider";

export function AppShell({ children }: { children: ReactNode }) {
  const { farm } = useFarmData();

  return (
    <div className="min-h-full md:pl-[246px]">
      <Sidebar />
      <header className="flex items-center justify-between bg-[#173d31] px-5 py-4 text-white md:hidden">
        <div className="flex items-center gap-2">
          <UroraMark />
          <strong className="text-xl tracking-[-1px]">urora</strong>
        </div>
        <SyncBadge />
      </header>
      <main className="mx-auto w-full max-w-[1250px] px-4 pb-24 pt-6 md:px-[42px] md:pb-12 md:pt-8">
        <p className="mb-1 text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">URORA SMART / {farm.name.toUpperCase()}</p>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
