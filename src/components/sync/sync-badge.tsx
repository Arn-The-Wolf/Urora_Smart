"use client";

import { CloudOff, LoaderCircle, RefreshCw, Wifi } from "lucide-react";
import { useFarmData } from "@/lib/offline/provider";
import { cn } from "@/lib/utils";

export function SyncBadge() {
  const { online, syncing, pending, syncNow } = useFarmData();

  if (online && pending === 0 && !syncing) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
        <Wifi className="size-3" />
        Synced
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void syncNow()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        online ? "bg-sun/30 text-foreground" : "bg-earth/15 text-earth",
      )}
    >
      {syncing ? <LoaderCircle className="size-3 animate-spin" /> : online ? <RefreshCw className="size-3" /> : <CloudOff className="size-3" />}
      {online ? (pending ? `${pending} to sync` : "Syncing") : "Offline"}
    </button>
  );
}
