import { getCow } from "@/modules/cattle/service";
import { getSession } from "@/lib/auth/session";
import { CowForm } from "@/components/cattle/cow-form";
import { notFound } from "next/navigation";

export default async function EditCowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();
  const cow = await getCow(session.farm.id, id);
  if (!cow) notFound();
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl tracking-tight">Edit cow</h1>
      <CowForm cow={cow} />
    </div>
  );
}
