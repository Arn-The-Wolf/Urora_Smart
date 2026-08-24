import { CowDetailView } from "@/components/cattle/cow-detail-view";

export default async function CowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CowDetailView cowId={id} />;
}
