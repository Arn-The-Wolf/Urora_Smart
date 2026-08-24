import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[75px] w-full rounded-[9px] border border-border bg-input px-3 py-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-[#78a989] disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
