"use client";

import { NewsletterForm } from "@/components/shared/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid gap-8 rounded-[2rem] border bg-background p-6 shadow-sm lg:grid-cols-[1fr_420px] lg:p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Members club
            </span>
            <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
              Join the list and unlock 10% off your first order
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Be first to know about new arrivals, limited restocks, and elevated everyday essentials built for modern wardrobes.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-2xl border bg-muted/40 p-4">Early access to drops</div>
              <div className="rounded-2xl border bg-muted/40 p-4">Subscriber-only offers</div>
              <div className="rounded-2xl border bg-muted/40 p-4">Styling notes and restocks</div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border bg-muted/40 p-5">
            <p className="text-sm font-medium">Get curated updates straight to your inbox.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Subscribe for updates, new arrivals, and exclusive offers.
            </p>
            <NewsletterForm
              source="homepage"
              buttonLabel="Claim 10% Off"
              className="mt-5"
              placeholder="Enter your email"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          By subscribing, you agree to occasional product updates and launch emails.
        </p>
      </div>
    </section>
  );
}
