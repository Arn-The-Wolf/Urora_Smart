import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { FarmDataProvider } from "@/lib/offline/provider";
import { listCows } from "@/modules/cattle/service";
import { getMilkSummary, listMilkings } from "@/modules/milk/service";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [cows, milkings, summary] = await Promise.all([
    listCows(session.farm.id),
    listMilkings(session.farm.id),
    getMilkSummary(session.farm.id),
  ]);

  return (
    <FarmDataProvider
      initial={{
        session,
        cows,
        milkings,
        summary,
        recent: milkings.slice(0, 8),
      }}
    >
      <AppShell>{children}</AppShell>
    </FarmDataProvider>
  );
}
