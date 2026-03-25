"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MotionItem, MotionStagger } from "@/components/shared/motion";
import { NewsletterForm } from "@/components/shared/newsletter-form";

const DISMISS_KEY = "margelle-newsletter-popup-dismissed";

export function NewsletterPopup() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mountFrame = window.requestAnimationFrame(() => setMounted(true));
    const dismissed = window.localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      return () => window.cancelAnimationFrame(mountFrame);
    }

    const timer = window.setTimeout(() => setOpen(true), 2200);
    return () => {
      window.cancelAnimationFrame(mountFrame);
      window.clearTimeout(timer);
    };
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && mounted) {
      window.localStorage.setItem(DISMISS_KEY, "true");
    }
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-none bg-neutral-950 p-0 text-white" showCloseButton>
        <div className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_35%),linear-gradient(145deg,_rgba(255,255,255,0.06),_transparent_55%)]" />
          <MotionStagger className="relative space-y-6" delayChildren={0.05}>
            <DialogHeader className="space-y-3">
              <MotionItem>
                <span className="inline-flex w-fit rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 premium-panel">
                  Welcome offer
                </span>
              </MotionItem>
              <MotionItem>
                <DialogTitle className="font-heading text-3xl font-semibold leading-tight text-white">
                  Get 10% off your first order
                </DialogTitle>
              </MotionItem>
              <MotionItem>
                <DialogDescription className="text-sm text-white/72">
                  Join the MARGELLE list for new arrivals, restocks, and exclusive drops tailored to modern streetwear.
                </DialogDescription>
              </MotionItem>
            </DialogHeader>

            <MotionItem>
              <NewsletterForm
                source="popup"
                buttonLabel="Unlock 10% Off"
                placeholder="Email address"
                onSuccess={() => handleOpenChange(false)}
              />
            </MotionItem>

            <MotionItem className="flex items-center justify-between gap-3 text-xs text-white/60">
              <p>No spam. Just curated style updates.</p>
              <Button
                type="button"
                variant="ghost"
                className="h-auto px-0 text-xs text-white/70 hover:bg-transparent hover:text-white"
                onClick={() => handleOpenChange(false)}
              >
                Maybe later
              </Button>
            </MotionItem>
          </MotionStagger>
        </div>
      </DialogContent>
    </Dialog>
  );
}
