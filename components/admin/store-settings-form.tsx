"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveStoreSettingsAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Settings = {
  storeName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  shippingThreshold: number | null;
  currencyCode: string;
};

export function StoreSettingsForm({ settings }: { settings: Settings }) {
  const [draft, setDraft] = useState(settings);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveStoreSettingsAction({
        ...draft,
        supportEmail: draft.supportEmail || null,
        supportPhone: draft.supportPhone || null,
        shippingThreshold: draft.shippingThreshold ?? null,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to save store settings.");
        return;
      }

      toast.success("Store settings updated.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Store basics</h2>
          <p className="text-sm text-muted-foreground">
            Keep support details and merchandising thresholds in one place.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Store name</label>
            <Input
              className="mt-1"
              value={draft.storeName}
              onChange={(event) => setDraft((current) => ({ ...current, storeName: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Support email</label>
            <Input
              className="mt-1"
              type="email"
              value={draft.supportEmail ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, supportEmail: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Support phone</label>
            <Input
              className="mt-1"
              value={draft.supportPhone ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, supportPhone: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Free shipping threshold</label>
            <Input
              className="mt-1"
              type="number"
              min={0}
              step="0.01"
              value={draft.shippingThreshold ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  shippingThreshold: event.target.value === "" ? null : Number(event.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Currency code</label>
            <Input
              className="mt-1 uppercase"
              value={draft.currencyCode}
              maxLength={3}
              onChange={(event) =>
                setDraft((current) => ({ ...current, currencyCode: event.target.value.toUpperCase() }))
              }
            />
          </div>
        </div>
      </section>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
