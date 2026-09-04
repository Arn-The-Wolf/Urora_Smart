import { cn } from "@/lib/utils";

export function PageLoader({ label = "Opening the ledger" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 animate-fade-in" role="status" aria-live="polite">
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
    <div className="space-y-4 animate-fade-in" role="status" aria-label="Loading dashboard">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="skeleton-shine h-5 w-28 rounded-full" />
          <div className="skeleton-shine h-8 w-48 rounded-full" />
          <div className="skeleton-shine h-4 w-56 rounded-full" />
        </div>
        <div className="skeleton-shine h-11 w-32 rounded-[9px]" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="skeleton-shine h-24 rounded-[15px]" />
        <div className="skeleton-shine h-24 rounded-[15px]" />
        <div className="skeleton-shine h-24 rounded-[15px]" />
        <div className="skeleton-shine h-24 rounded-[15px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <div className="skeleton-shine h-48 rounded-[15px]" />
        <div className="skeleton-shine h-48 rounded-[15px]" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shine h-16 rounded-2xl" />
        <div className="skeleton-shine h-16 rounded-2xl" />
        <div className="skeleton-shine h-16 rounded-2xl" />
      </div>
    </div>
  );
}

export function ListPageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-fade-in" role="status" aria-label="Loading">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="skeleton-shine h-8 w-36 rounded-full" />
          <div className="skeleton-shine h-4 w-48 rounded-full" />
        </div>
        <div className="skeleton-shine h-11 w-28 rounded-[9px]" />
      </div>
      <div className="skeleton-shine h-11 w-full rounded-2xl" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-shine h-20 rounded-2xl" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in" role="status" aria-label="Loading form">
      <div className="skeleton-shine h-8 w-40 rounded-full" />
      <div className="skeleton-shine h-4 w-56 rounded-full" />
      <div className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
        <div className="skeleton-shine h-12 rounded-xl" />
        <div className="skeleton-shine h-12 rounded-xl" />
        <div className="skeleton-shine h-28 rounded-xl" />
        <div className="skeleton-shine h-12 rounded-xl" />
      </div>
    </div>
  );
}

export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f3f7f2]" role="status" aria-label="Loading Spring Farms">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="skeleton-shine h-8 w-36 rounded-full" />
        <div className="flex gap-3">
          <div className="skeleton-shine h-8 w-16 rounded-full" />
          <div className="skeleton-shine h-9 w-28 rounded-full" />
        </div>
      </div>
      <div className="relative mx-4 overflow-hidden rounded-3xl bg-[#91c932]" style={{ minHeight: "min(70vh, 560px)" }}>
        <div className="absolute inset-0 landing-loader-pulse" />
        <div className="absolute bottom-10 left-6 space-y-3">
          <div className="h-10 w-48 rounded-full bg-white/25" />
          <div className="h-12 w-72 max-w-[80vw] rounded-full bg-white/30" />
          <div className="h-4 w-64 max-w-[70vw] rounded-full bg-white/20" />
          <div className="mt-4 flex gap-3">
            <div className="h-12 w-40 rounded-full bg-white/35" />
            <div className="h-12 w-28 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shine h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6 animate-fade-in" role="status" aria-label="Loading">
      <div className="w-full max-w-md space-y-4">
        <div className="skeleton-shine mx-auto h-10 w-40 rounded-full" />
        <div className="skeleton-shine h-12 w-full rounded-xl" />
        <div className="skeleton-shine h-12 w-full rounded-xl" />
        <div className="skeleton-shine h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
