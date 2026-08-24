import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function UroraMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-9 place-items-center rounded-[11px] bg-[#8ec49b] text-[#163d30]", className)}>
      <Leaf className="size-5" />
    </span>
  );
}

export function UroraWordmark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <UroraMark className={light ? "bg-[#6bb486] text-[#163d30]" : undefined} />
      <div className="leading-none">
        <p className={cn("text-[22px] font-bold tracking-[-1px]", light ? "text-white" : "text-[#173d31]")}>urora</p>
        <p className={cn("text-[8px] font-bold tracking-[1.7px]", light ? "text-[#8eb6a0]" : "text-[#718079]")}>SMART FARM</p>
      </div>
    </div>
  );
}
