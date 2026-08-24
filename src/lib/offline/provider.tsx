"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Cow, CowStatus, Farm, MilkSummary, MilkingRecord, SessionUser, User } from "@/lib/types";
import { cacheCows, cacheMilkings, enqueue, flushQueue, pendingCount, readCachedCows, readCachedMilkings } from "@/lib/offline/sync";
import { createId } from "@/lib/id";
import { nowIso } from "@/lib/dates";
import type { CowInput } from "@/modules/cattle/validators";
import type { MilkingInput } from "@/modules/milk/validators";

type FarmData = {
  session: SessionUser;
  cows: Cow[];
  milkings: MilkingRecord[];
  summary: MilkSummary;
  recent: MilkingRecord[];
};

type FarmDataContextValue = {
  user: User;
  farm: Farm;
  cows: Cow[];
  milkings: MilkingRecord[];
  summary: MilkSummary;
  recent: MilkingRecord[];
  online: boolean;
  syncing: boolean;
  pending: number;
  lastError: string | null;
  refresh: () => Promise<void>;
  syncNow: () => Promise<void>;
  saveCow: (input: CowInput, id?: string) => Promise<Cow>;
  removeCow: (id: string) => Promise<void>;
  saveMilking: (input: MilkingInput, id?: string) => Promise<MilkingRecord>;
  removeMilking: (id: string) => Promise<void>;
  cowById: (id: string) => Cow | undefined;
};

const FarmDataContext = createContext<FarmDataContextValue | null>(null);

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(data && "error" in data ? (data.error ?? "Request failed") : "Request failed");
  }
  return data as T;
}

export function FarmDataProvider({
  initial,
  children,
}: {
  initial: FarmData;
  children: ReactNode;
}) {
  const [cows, setCows] = useState(initial.cows);
  const [milkings, setMilkings] = useState(initial.milkings);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const refreshPending = useCallback(async () => {
    setPending(await pendingCount());
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    setLastError(null);
    try {
      const result = await flushQueue();
      if (result.conflicts?.length) {
        const milkConflicts = result.conflicts.filter((c) => c.entity === "milking").length;
        const cowConflicts = result.conflicts.filter((c) => c.entity === "cow").length;
        const parts = [
          milkConflicts ? `${milkConflicts} milking` : null,
          cowConflicts ? `${cowConflicts} cow` : null,
        ].filter(Boolean);
        toast.warning(
          `Sync kept the newer server record for ${parts.join(" and ")} conflict${result.conflicts.length === 1 ? "" : "s"}. Check milkings if two devices logged the same session.`,
        );
      }
      const [cowRes, milkRes] = await Promise.all([
        api<{ cows: Cow[] }>("/api/cattle"),
        api<{ milkings: MilkingRecord[] }>("/api/milk"),
      ]);
      setCows(cowRes.cows);
      setMilkings(milkRes.milkings);
      await cacheCows(cowRes.cows);
      await cacheMilkings(milkRes.milkings);
      await refreshPending();
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [refreshPending]);

  const refresh = syncNow;

  useEffect(() => {
    setOnline(navigator.onLine);
    cacheCows(initial.cows).catch(() => undefined);
    cacheMilkings(initial.milkings).catch(() => undefined);
    void refreshPending();

    const onOnline = () => {
      setOnline(true);
      void syncNow();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    if (!navigator.onLine) {
      void Promise.all([readCachedCows(), readCachedMilkings()]).then(([cachedCows, cachedMilkings]) => {
        if (cachedCows.length) setCows(cachedCows);
        if (cachedMilkings.length) setMilkings(cachedMilkings);
      });
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [initial.cows, initial.milkings, refreshPending, syncNow]);

  const saveCow = useCallback(
    async (input: CowInput, id?: string) => {
      const existing = id ? cows.find((cow) => cow.id === id) : undefined;
      const now = nowIso();
      const optimistic: Cow = {
        id: existing?.id ?? input.id ?? createId(),
        farmId: initial.session.farm.id,
        clientId: existing?.clientId ?? input.clientId ?? createId(),
        tagNumber: input.tagNumber,
        name: input.name ?? null,
        breed: input.breed ?? null,
        gender: input.gender,
        birthDate: input.birthDate ?? null,
        motherTag: input.motherTag ?? null,
        status: (input.status ?? "active") as CowStatus,
        notes: input.notes ?? null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        deletedAt: null,
      };
      setCows((current) => {
        const next = current.filter((cow) => cow.id !== optimistic.id);
        return [...next, optimistic].sort((a, b) =>
          a.tagNumber.localeCompare(b.tagNumber, undefined, { numeric: true }),
        );
      });
      await cacheCows([optimistic]);

      if (navigator.onLine) {
        try {
          const result = id
            ? await api<{ cow: Cow }>(`/api/cattle/${id}`, { method: "PUT", body: JSON.stringify(input) })
            : await api<{ cow: Cow }>("/api/cattle", { method: "POST", body: JSON.stringify(input) });
          setCows((current) => current.map((cow) => (cow.id === result.cow.id ? result.cow : cow)));
          await cacheCows([result.cow]);
          return result.cow;
        } catch (error) {
          if (error instanceof TypeError) {
            await enqueue({ entity: "cow", op: "upsert", record: optimistic });
            await refreshPending();
            return optimistic;
          }
          throw error;
        }
      }
      await enqueue({ entity: "cow", op: "upsert", record: optimistic });
      await refreshPending();
      return optimistic;
    },
    [cows, initial.session.farm.id, refreshPending],
  );

  const removeCow = useCallback(
    async (id: string) => {
      const current = cows.find((cow) => cow.id === id);
      if (!current) return;
      const deleted = { ...current, deletedAt: nowIso(), updatedAt: nowIso() };
      setCows((list) => list.filter((cow) => cow.id !== id));
      await cacheCows([deleted]);
      if (navigator.onLine) {
        try {
          await api(`/api/cattle/${id}`, { method: "DELETE" });
          return;
        } catch (error) {
          if (!(error instanceof TypeError)) throw error;
        }
      }
      await enqueue({ entity: "cow", op: "delete", record: deleted });
      await refreshPending();
    },
    [cows, refreshPending],
  );

  const saveMilking = useCallback(
    async (input: MilkingInput, id?: string) => {
      const existing = id ? milkings.find((row) => row.id === id) : undefined;
      const now = nowIso();
      const optimistic: MilkingRecord = {
        id: existing?.id ?? input.id ?? createId(),
        farmId: initial.session.farm.id,
        clientId: existing?.clientId ?? input.clientId ?? createId(),
        cowId: input.cowId,
        date: input.date,
        session: input.session,
        liters: Number(input.liters),
        notes: input.notes ?? null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        deletedAt: null,
      };
      setMilkings((current) => {
        const next = current.filter((row) => row.id !== optimistic.id);
        return [optimistic, ...next];
      });
      await cacheMilkings([optimistic]);

      if (navigator.onLine) {
        try {
          const result = id
            ? await api<{ milking: MilkingRecord }>(`/api/milk/${id}`, {
                method: "PUT",
                body: JSON.stringify(input),
              })
            : await api<{ milking: MilkingRecord }>("/api/milk", {
                method: "POST",
                body: JSON.stringify(input),
              });
          setMilkings((current) => current.map((row) => (row.id === result.milking.id ? result.milking : row)));
          await cacheMilkings([result.milking]);
          return result.milking;
        } catch (error) {
          if (error instanceof TypeError) {
            await enqueue({ entity: "milking", op: "upsert", record: optimistic });
            await refreshPending();
            return optimistic;
          }
          throw error;
        }
      }
      await enqueue({ entity: "milking", op: "upsert", record: optimistic });
      await refreshPending();
      return optimistic;
    },
    [initial.session.farm.id, milkings, refreshPending],
  );

  const removeMilking = useCallback(
    async (id: string) => {
      const current = milkings.find((row) => row.id === id);
      if (!current) return;
      const deleted = { ...current, deletedAt: nowIso(), updatedAt: nowIso() };
      setMilkings((list) => list.filter((row) => row.id !== id));
      await cacheMilkings([deleted]);
      if (navigator.onLine) {
        try {
          await api(`/api/milk/${id}`, { method: "DELETE" });
          return;
        } catch (error) {
          if (!(error instanceof TypeError)) throw error;
        }
      }
      await enqueue({ entity: "milking", op: "delete", record: deleted });
      await refreshPending();
    },
    [milkings, refreshPending],
  );

  const summary = useMemo(() => deriveSummary(cows, milkings, initial.summary), [cows, milkings, initial.summary]);
  const recent = useMemo(() => [...milkings].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 8), [milkings]);

  const value = useMemo<FarmDataContextValue>(
    () => ({
      user: initial.session.user,
      farm: initial.session.farm,
      cows,
      milkings,
      summary,
      recent,
      online,
      syncing,
      pending,
      lastError,
      refresh,
      syncNow,
      saveCow,
      removeCow,
      saveMilking,
      removeMilking,
      cowById: (id: string) => cows.find((cow) => cow.id === id),
    }),
    [
      cows,
      initial.session,
      lastError,
      milkings,
      online,
      pending,
      recent,
      refresh,
      removeCow,
      removeMilking,
      saveCow,
      saveMilking,
      summary,
      syncing,
      syncNow,
    ],
  );

  return <FarmDataContext.Provider value={value}>{children}</FarmDataContext.Provider>;
}

function deriveSummary(cows: Cow[], milkings: MilkingRecord[], fallback: MilkSummary): MilkSummary {
  const today = fallback.last7Days[fallback.last7Days.length - 1]?.date;
  if (!today) return fallback;
  const from = fallback.last7Days[0]?.date;
  const yesterday = fallback.last7Days.at(-2)?.date;
  const todayRows = milkings.filter((row) => row.date === today);
  const todayBySession = { morning: 0, midday: 0, evening: 0 } as MilkSummary["todayBySession"];
  let todayLiters = 0;
  for (const row of todayRows) {
    todayLiters += row.liters;
    todayBySession[row.session] += row.liters;
  }
  const yesterdayLiters = yesterday
    ? milkings.filter((row) => row.date === yesterday).reduce((sum, row) => sum + row.liters, 0)
    : fallback.yesterdayLiters;
  const weekRows = from ? milkings.filter((row) => row.date >= from) : milkings;
  const last7Days = fallback.last7Days.map((day) => ({
    date: day.date,
    liters: milkings.filter((row) => row.date === day.date).reduce((sum, row) => sum + row.liters, 0),
  }));
  const byCow = new Map<string, number>();
  for (const row of todayRows) byCow.set(row.cowId, (byCow.get(row.cowId) ?? 0) + row.liters);
  let topCow: MilkSummary["topCow"] = null;
  for (const [cowId, liters] of byCow) {
    if (!topCow || liters > topCow.liters) {
      const cow = cows.find((item) => item.id === cowId);
      if (cow) topCow = { cowId, tagNumber: cow.tagNumber, name: cow.name, liters };
    }
  }
  return {
    todayLiters,
    todayBySession,
    weekLiters: weekRows.reduce((sum, row) => sum + row.liters, 0),
    yesterdayLiters,
    activeCows: cows.filter((cow) => cow.status === "active").length,
    totalCows: cows.length,
    topCow,
    last7Days,
  };
}

export function useFarmData() {
  const ctx = useContext(FarmDataContext);
  if (!ctx) throw new Error("useFarmData must be used within FarmDataProvider");
  return ctx;
}
