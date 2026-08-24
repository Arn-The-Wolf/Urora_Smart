import { CowForm } from "@/components/cattle/cow-form";

export default function NewCowPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl tracking-tight">Add a cow</h1>
      <CowForm />
    </div>
  );
}
