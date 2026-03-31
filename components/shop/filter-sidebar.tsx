"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ColorOption = {
  name: string;
  hex?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type FilterSidebarProps = {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  selectedSizes: string[];
  selectedColors: string[];
  sizeOptions: string[];
  colorOptions: ColorOption[];
  maxAvailablePrice: number;
  selectedMaxPrice: number;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onPriceChange: (value: number) => void;
  onPriceCommit: (value: number) => void;
  onClear: () => void;
  className?: string;
};

export function FilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSizes,
  selectedColors,
  sizeOptions,
  colorOptions,
  maxAvailablePrice,
  selectedMaxPrice,
  onToggleSize,
  onToggleColor,
  onPriceChange,
  onPriceCommit,
  onClear,
  className,
}: FilterSidebarProps) {
  const effectiveMax = Math.max(25, maxAvailablePrice);

  return (
    <div className={cn("rounded-3xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-base font-semibold">Filters</h2>
          <p className="text-sm text-muted-foreground">Refine by fit, tone, and budget.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>

      <div className="space-y-6 pt-5">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Category</h3>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSelectCategory("")}
              className={cn(
                "flex w-full items-center rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition",
                !selectedCategory
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              All products
            </button>
            {categories.map((category) => {
              const active = selectedCategory === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSelectCategory(category.slug)}
                  className={cn(
                    "flex w-full items-center rounded-2xl border px-3 py-2.5 text-left text-sm transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onToggleSize(size)}
                  className={cn(
                    "inline-flex min-w-[44px] items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Price range</h3>
            <span className="text-sm text-muted-foreground">Up to ${selectedMaxPrice}</span>
          </div>
          <input
            type="range"
            min={25}
            max={effectiveMax}
            step={5}
            value={selectedMaxPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            onMouseUp={(e) => onPriceCommit(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => onPriceCommit(Number((e.target as HTMLInputElement).value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$25</span>
            <span>${effectiveMax}</span>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Color</h3>
          <div className="space-y-2">
            {colorOptions.map((color) => {
              const active = selectedColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => onToggleColor(color.name)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition",
                    active
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="inline-flex h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex ?? "#d4d4d8" }}
                    />
                    {color.name}
                  </span>
                  {active && <span className="text-xs font-medium text-primary">Selected</span>}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
