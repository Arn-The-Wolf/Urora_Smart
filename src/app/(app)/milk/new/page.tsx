import { Suspense } from "react";
import { MilkForm } from "@/components/milk/milk-form";
import { PageLoader } from "@/components/loading/page-loader";

export default function NewMilkPage() {
  return (
    <Suspense fallback={<PageLoader label="Preparing milk log" />}>
      <MilkForm />
    </Suspense>
  );
}
