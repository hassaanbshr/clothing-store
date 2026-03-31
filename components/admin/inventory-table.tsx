"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateInventoryAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InventoryRow = {
  id: string;
  productName: string;
  size: string;
  colorName: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
};

type DraftState = Record<
  string,
  {
    stockQuantity: number;
    lowStockThreshold: number;
  }
>;

export function InventoryTable({ variants }: { variants: InventoryRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<DraftState>(
    Object.fromEntries(
      variants.map((variant) => [
        variant.id,
        {
          stockQuantity: variant.stockQuantity,
          lowStockThreshold: variant.lowStockThreshold,
        },
      ])
    )
  );

  const hasChanges = useMemo(
    () =>
      variants.reduce<Record<string, boolean>>((acc, variant) => {
        const draft = drafts[variant.id];
        acc[variant.id] =
          draft.stockQuantity !== variant.stockQuantity ||
          draft.lowStockThreshold !== variant.lowStockThreshold;
        return acc;
      }, {}),
    [drafts, variants]
  );

  const updateDraft = (
    variantId: string,
    field: "stockQuantity" | "lowStockThreshold",
    value: number
  ) => {
    setDrafts((current) => ({
      ...current,
      [variantId]: {
        ...current[variantId],
        [field]: Number.isNaN(value) ? 0 : Math.max(0, value),
      },
    }));
  };

  const resetDraft = (variant: InventoryRow) => {
    setDrafts((current) => ({
      ...current,
      [variant.id]: {
        stockQuantity: variant.stockQuantity,
        lowStockThreshold: variant.lowStockThreshold,
      },
    }));
  };

  const saveVariant = (variant: InventoryRow) => {
    const draft = drafts[variant.id];

    startTransition(async () => {
      const result = await updateInventoryAction({
        variantId: variant.id,
        stockQuantity: draft.stockQuantity,
        lowStockThreshold: draft.lowStockThreshold,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to update inventory.");
        return;
      }

      toast.success(`Inventory updated for ${variant.productName} (${variant.size} / ${variant.colorName}).`);
      router.refresh();
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left font-medium">Product</th>
            <th className="p-4 text-left font-medium">SKU</th>
            <th className="p-4 text-left font-medium">Size</th>
            <th className="p-4 text-left font-medium">Color</th>
            <th className="p-4 text-left font-medium">Stock</th>
            <th className="p-4 text-left font-medium">Low threshold</th>
            <th className="p-4 text-left font-medium">Quick adjust</th>
            <th className="p-4 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => {
            const draft = drafts[variant.id];
            const isLowStock = draft.stockQuantity <= draft.lowStockThreshold;

            return (
              <tr
                key={variant.id}
                className={`border-t align-top ${isLowStock ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}
              >
                <td className="p-4">
                  <div className="font-medium">{variant.productName}</div>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{variant.sku}</td>
                <td className="p-4">{variant.size}</td>
                <td className="p-4">{variant.colorName}</td>
                <td className="p-4">
                  <Input
                    type="number"
                    min={0}
                    value={draft.stockQuantity}
                    onChange={(event) =>
                      updateDraft(variant.id, "stockQuantity", Number(event.target.value))
                    }
                    className="w-24"
                  />
                </td>
                <td className="p-4">
                  <Input
                    type="number"
                    min={0}
                    value={draft.lowStockThreshold}
                    onChange={(event) =>
                      updateDraft(variant.id, "lowStockThreshold", Number(event.target.value))
                    }
                    className="w-24"
                  />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateDraft(
                          variant.id,
                          "stockQuantity",
                          draft.stockQuantity + 5
                        )
                      }
                    >
                      +5
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateDraft(
                          variant.id,
                          "stockQuantity",
                          draft.stockQuantity + 10
                        )
                      }
                    >
                      +10
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateDraft(variant.id, "stockQuantity", 0)}
                    >
                      Set 0
                    </Button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending || !hasChanges[variant.id]}
                      onClick={() => saveVariant(variant)}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending || !hasChanges[variant.id]}
                      onClick={() => resetDraft(variant)}
                    >
                      Reset
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
