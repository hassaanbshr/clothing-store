"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProductAction } from "@/actions/admin";
import { ProductMediaInput } from "@/components/admin/product-media-input";
import { ProductVariantsInput } from "@/components/admin/product-variants-input";
import { saveProductSchema, type SaveProductInput } from "@/lib/validations/admin";
import { slugify } from "@/lib/admin";

type Category = { id: string; name: string; slug: string };
type Variant = {
  id?: string;
  size: string;
  colorName: string;
  colorHex?: string | null;
  stockQuantity: number;
  lowStockThreshold?: number;
  sku?: string;
};
type ProductImage = { id?: string; url: string; alt?: string | null };

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    previousPrice: number | null;
    categoryId: string;
    modelSizeInfo?: string | null;
    sizeChartJson?: unknown;
    variants?: Variant[];
    images?: ProductImage[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo(
    () => ({
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      previousPrice: product?.previousPrice ?? null,
      categoryId: product?.categoryId ?? categories[0]?.id ?? "",
      modelSizeInfo: product?.modelSizeInfo ?? "",
      sizeChartJson: Array.isArray(product?.sizeChartJson) ? product?.sizeChartJson : null,
      imageUrls: product?.images?.map((image) => image.url) ?? [],
      variants:
        product?.variants?.map((variant) => ({
          size: variant.size,
          colorName: variant.colorName,
          colorHex: variant.colorHex ?? "",
          stockQuantity: variant.stockQuantity,
          lowStockThreshold: variant.lowStockThreshold ?? 5,
          sku: variant.sku ?? "",
        })) ?? [
          {
            size: "M",
            colorName: "",
            colorHex: "",
            stockQuantity: 0,
            lowStockThreshold: 5,
            sku: "",
          },
        ],
    }),
    [categories, product]
  );

  const form = useForm<SaveProductInput>({
    resolver: zodResolver(saveProductSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedSlug = useWatch({ control: form.control, name: "slug" });
  const imageUrls = useWatch({ control: form.control, name: "imageUrls" }) ?? [];

  const onSubmit = (values: SaveProductInput) => {
    startTransition(async () => {
      const result = await saveProductAction(product?.id ?? null, {
        ...values,
        slug: values.slug || slugify(values.name),
        modelSizeInfo: values.modelSizeInfo || null,
        previousPrice: values.previousPrice ?? null,
        sizeChartJson: values.sizeChartJson ?? null,
      });

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            if (!messages?.[0]) return;
            form.setError(key as keyof SaveProductInput, { message: messages[0] });
          });
        }
        toast.error(result.error ?? "Failed to save product.");
        return;
      }

      toast.success(product ? "Product updated." : "Product created.");
      router.push("/admin/products");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Basic details</h2>
          <p className="text-sm text-muted-foreground">
            Manage name, slug, storytelling, and category placement.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Product name</label>
            <Input {...register("name")} className="mt-1" placeholder="Heavyweight Crewneck Tee" />
            {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input {...register("slug")} className="mt-1" placeholder={slugify(watchedName || "product-name")} />
            <p className="mt-1 text-xs text-muted-foreground">
              SEO-friendly URL. Leave blank to auto-generate from the name.
            </p>
            {errors.slug ? <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              {...register("categoryId")}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p> : null}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register("description")}
              className="mt-1 min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Describe the fabric, fit, silhouette, and styling cues."
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Model / fit notes</label>
            <Input
              {...register("modelSizeInfo")}
              className="mt-1"
              placeholder="Model is 185cm and wears size L."
            />
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Pricing</h2>
          <p className="text-sm text-muted-foreground">Set current and discounted price points.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Price</label>
            <Input type="number" step="0.01" min={0} {...register("price", { valueAsNumber: true })} className="mt-1" />
            {errors.price ? <p className="mt-1 text-xs text-destructive">{errors.price.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-medium">Discount price</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              {...register("previousPrice", {
                setValueAs: (value) => (value === "" ? null : Number(value)),
              })}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave empty when the product is not on sale.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Media</h2>
          <p className="text-sm text-muted-foreground">
            Upload multiple product images, preview them, and drag to set the display order.
          </p>
        </div>
        <ProductMediaInput
          value={imageUrls}
          onChange={(next) => setValue("imageUrls", next, { shouldDirty: true })}
        />
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Variants & inventory</h2>
          <p className="text-sm text-muted-foreground">
            Manage sizes, colors, stock levels, and low-stock thresholds.
          </p>
        </div>
        <ProductVariantsInput fields={fields} register={register} append={append} remove={remove} />
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Size chart</h2>
          <p className="text-sm text-muted-foreground">
            Paste JSON array rows if you want a detailed size guide on the product page.
          </p>
        </div>
        <textarea
          className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          defaultValue={
            defaultValues.sizeChartJson ? JSON.stringify(defaultValues.sizeChartJson, null, 2) : ""
          }
          onChange={(event) => {
            const raw = event.target.value.trim();
            if (!raw) {
              setValue("sizeChartJson", null, { shouldDirty: true });
              return;
            }
            try {
              const parsed = JSON.parse(raw);
              setValue("sizeChartJson", parsed, { shouldDirty: true });
              clearErrors("sizeChartJson");
            } catch {
              form.setError("sizeChartJson", { message: "Size chart JSON is invalid." });
            }
          }}
          placeholder='[{"size":"M","chest":104,"waist":92,"length":71}]'
        />
        {errors.sizeChartJson ? (
          <p className="mt-1 text-xs text-destructive">{errors.sizeChartJson.message as string}</p>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving..." : product ? "Update product" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (!watchedSlug && watchedName) {
              setValue("slug", slugify(watchedName), { shouldDirty: true });
            }
          }}
        >
          Generate slug
        </Button>
      </div>
    </form>
  );
}
