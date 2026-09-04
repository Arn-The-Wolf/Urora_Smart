"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Staggered entrance for app pages after route loading finishes. */
export function PageEnter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("page-enter space-y-5", className)}>{children}</div>;
}
