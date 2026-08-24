import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { WashView } from "@/components/ops/wash-view";
import { listWashes } from "@/modules/wash/service";

export default async function WashPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const washes = await listWashes(session.farm.id);
  return <WashView washes={washes} />;
}
