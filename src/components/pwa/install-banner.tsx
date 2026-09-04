"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("urora-pwa-dismissed") === "1") return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || !deferred) return null;

  return (
    <div className="fixed inset-x-3 bottom-[4.5rem] z-50 mx-auto max-w-md rounded-[14px] border border-border bg-white p-3 shadow-[0_12px_40px_#173d3120] md:bottom-6">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-[10px] bg-[#e4f0e4] text-primary">
          <Download className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block text-sm">Install Spring Farms</b>
          <p className="text-xs text-muted-foreground">Add to your home screen for faster offline milking.</p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              className="h-8"
              onClick={async () => {
                await deferred.prompt();
                setHidden(true);
                setDeferred(null);
              }}
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => {
                localStorage.setItem("urora-pwa-dismissed", "1");
                setHidden(true);
              }}
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="text-[#9ca9a1]"
          onClick={() => {
            localStorage.setItem("urora-pwa-dismissed", "1");
            setHidden(true);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
