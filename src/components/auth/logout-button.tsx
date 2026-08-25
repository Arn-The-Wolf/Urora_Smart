"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className, variant = "outline" }: { className?: string; variant?: "outline" | "ghost" }) {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant={variant} size="sm" className={cn("gap-2", className)} onClick={() => void onLogout()}>
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
