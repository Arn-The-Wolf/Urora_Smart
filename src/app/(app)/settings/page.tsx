import { getSession } from "@/lib/auth/session";
import { listKraals } from "@/modules/kraals/service";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;
  const kraals = await listKraals(session.farm.id);
  return <SettingsView kraals={kraals} />;
}
