import { cn } from "@/lib/utils";

export function PageLoader({ label = "Opening the ledger" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <div className="relative grid place-items-center">
        <span className="absolute size-16 rounded-full border-2 border-primary/30 animate-[pulse-ring_1.4s_ease-out_infinite]" />
        <span className="absolute size-16 rounded-full border-2 border-primary/20 animate-[pulse-ring_1.4s_ease-out_infinite] [animation-delay:280ms]" />
        <div className="relative size-14 overflow-hidden rounded-2xl bg-primary shadow-lg">
          <div className="milk-loader absolute inset-x-1 bottom-1 top-4 rounded-md bg-[#F4E4B8]" />
        </div>
      </div>
      <p className="font-heading text-lg text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">Fetching today&apos;s milk and herd…</p>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shine h-28 rounded-2xl", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton-shine h-8 w-40 rounded-full" />
      <div className="skeleton-shine h-44 rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton-shine h-20 rounded-2xl" />
        <div className="skeleton-shine h-20 rounded-2xl" />
        <div className="skeleton-shine h-20 rounded-2xl" />
      </div>
      <div className="skeleton-shine h-40 rounded-3xl" />
      <div className="space-y-2">
        <div className="skeleton-shine h-16 rounded-2xl" />
        <div className="skeleton-shine h-16 rounded-2xl" />
        <div className="skeleton-shine h-16 rounded-2xl" />
      </div>
    </div>
  );
}
