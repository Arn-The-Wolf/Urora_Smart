"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Button> & {
  busy?: boolean;
  busyLabel?: string;
};

/** Button that shows a spinner while an async action runs. */
export function BusyButton({ busy, busyLabel, children, disabled, ...props }: Props) {
  return (
    <Button disabled={disabled || busy} aria-busy={busy || undefined} {...props}>
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {busyLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
