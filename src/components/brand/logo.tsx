import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function UroraMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-9 place-items-center rounded-[11px] bg-[#8ec49b] text-[#163d30]", className)}>
      <Leaf className="size-5" />
    </span>
  );
}

export function UroraWordmark({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
      <UroraMark className={cn(light ? "bg-[#6bb486] text-[#163d30]" : undefined, compact && "size-7 rounded-[9px] [&_svg]:size-3.5")} />
      <div className="leading-none">
        <p className={cn("font-bold tracking-[-1px]", compact ? "text-[16px]" : "text-[22px]", light ? "text-white" : "text-[#173d31]")}>
          Spring
        </p>
        <p className={cn("font-bold tracking-[1.7px]", compact ? "text-[7px]" : "text-[8px]", light ? "text-[#8eb6a0]" : "text-[#718079]")}>
          FARMS
        </p>
      </div>
    </div>
  );
}
