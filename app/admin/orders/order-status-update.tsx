"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderStatusUpdate({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async () => {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update order status.");
        return;
      }
      toast.success("Order status updated.");
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-8 rounded border px-2 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={handleUpdate} disabled={isPending}>
        {isPending ? "Saving..." : "Update"}
      </Button>
    </div>
  );
}
