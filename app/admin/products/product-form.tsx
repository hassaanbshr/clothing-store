"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; slug: string };

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
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [previousPrice, setPreviousPrice] = useState(product?.previousPrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const body = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description: description || undefined,
        price: parseFloat(price) || 0,
        previousPrice: previousPrice ? parseFloat(previousPrice) : null,
        categoryId,
        variants: [{ size: "M", colorName: "Default", stockQuantity: 10 }],
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.push("/admin/products");
      else alert((await res.json()).error ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Slug</label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-from-name"
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Price</label>
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Previous price (sale)</label>
          <Input
            type="number"
            step="0.01"
            value={previousPrice}
            onChange={(e) => setPreviousPrice(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : product ? "Update product" : "Create product"}
      </Button>
    </form>
  );
}
