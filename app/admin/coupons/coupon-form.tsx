"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays, 10) || 90);
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          type,
          value: parseFloat(value) || 0,
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
          expiresAt: expiresAt.toISOString(),
        }),
      });
      if (res.ok) {
        setCode("");
        setValue("");
        setMinOrderAmount("");
        setMaxUses("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end p-4 border rounded-lg">
      <div>
        <label className="text-sm font-medium">Code</label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="WELCOME10"
          required
          className="mt-1 w-32"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
          className="h-9 rounded border px-2 mt-1"
        >
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed amount</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Value</label>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === "PERCENTAGE" ? "10" : "5.00"}
          required
          className="mt-1 w-24"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Min order</label>
        <Input
          type="number"
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
          placeholder="0"
          className="mt-1 w-24"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Max uses</label>
        <Input
          type="number"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="Unlimited"
          className="mt-1 w-24"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Expires (days)</label>
        <Input
          type="number"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(e.target.value)}
          className="mt-1 w-20"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create coupon"}
      </Button>
    </form>
  );
}
