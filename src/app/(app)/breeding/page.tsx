import { getSession } from "@/lib/auth/session";
import { listBreeding } from "@/modules/breeding/service";
import { listCows } from "@/modules/cattle/service";
import { BreedingView } from "@/components/breeding/breeding-view";

export default async function BreedingPage() {
  const session = await getSession();
  if (!session) return null;
  const [events, cows] = await Promise.all([listBreeding(session.farm.id), listCows(session.farm.id)]);
  return <BreedingView events={events} cows={cows} />;
}
