"use client";

import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFormRegister,
} from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SaveProductInput } from "@/lib/validations/admin";

type ProductVariantsInputProps = {
  fields: FieldArrayWithId<SaveProductInput, "variants", "id">[];
  register: UseFormRegister<SaveProductInput>;
  append: UseFieldArrayAppend<SaveProductInput, "variants">;
  remove: (index: number) => void;
};

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];

export function ProductVariantsInput({
  fields,
  register,
  append,
  remove,
}: ProductVariantsInputProps) {
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-[1.25rem] border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Variant {index + 1}</p>
              <p className="text-xs text-muted-foreground">Size, color, SKU, and stock controls.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Size</label>
              <select
                {...register(`variants.${index}.size`)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Color name</label>
              <Input {...register(`variants.${index}.colorName`)} className="mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium">Color hex</label>
              <Input {...register(`variants.${index}.colorHex`)} className="mt-1" placeholder="#111111" />
            </div>

            <div>
              <label className="text-sm font-medium">SKU (optional)</label>
              <Input {...register(`variants.${index}.sku`)} className="mt-1" placeholder="Auto-generated if blank" />
            </div>

            <div>
              <label className="text-sm font-medium">Stock quantity</label>
              <Input
                type="number"
                min={0}
                {...register(`variants.${index}.stockQuantity`, { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Low-stock threshold</label>
              <Input
                type="number"
                min={0}
                {...register(`variants.${index}.lowStockThreshold`, { valueAsNumber: true })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            size: "M",
            colorName: "",
            colorHex: "",
            stockQuantity: 0,
            lowStockThreshold: 5,
            sku: "",
          })
        }
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Add variant
      </Button>
    </div>
  );
}
