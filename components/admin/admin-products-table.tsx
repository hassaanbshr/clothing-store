"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteProductAction } from "@/actions/admin";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  previousPrice: number | null;
  reviewCount: number;
  totalStock: number;
  variantCount: number;
};

export function AdminProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticProducts, removeOptimistic] = useOptimistic(
    products,
    (current, productId: string) => current.filter((product) => product.id !== productId)
  );

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(`Delete ${name}? This will remove its images and variants.`);
    if (!confirmed) return;

    startTransition(async () => {
      removeOptimistic(id);
      const result = await deleteProductAction(id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete product.");
        router.refresh();
        return;
      }
      toast.success("Product deleted.");
      router.refresh();
    });
  };

  return (
    <AdminTableShell>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-medium">Product</th>
              <th className="p-4 text-left font-medium">Category</th>
              <th className="p-4 text-left font-medium">Price</th>
              <th className="p-4 text-left font-medium">Stock</th>
              <th className="p-4 text-left font-medium">Variants</th>
              <th className="p-4 text-left font-medium">Reviews</th>
              <th className="p-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {optimisticProducts.map((product) => (
              <tr key={product.id} className="border-t align-top">
                <td className="p-4">
                  <div className="font-medium">{product.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">/{product.slug}</div>
                </td>
                <td className="p-4 text-muted-foreground">{product.categoryName}</td>
                <td className="p-4">
                  <div className="font-medium">${product.price.toFixed(2)}</div>
                  {product.previousPrice ? (
                    <div className="text-xs text-muted-foreground line-through">
                      ${product.previousPrice.toFixed(2)}
                    </div>
                  ) : null}
                </td>
                <td className="p-4">
                  <Badge variant={product.totalStock <= 5 ? "destructive" : "outline"}>
                    {product.totalStock} in stock
                  </Badge>
                </td>
                <td className="p-4">{product.variantCount}</td>
                <td className="p-4">{product.reviewCount}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTableShell>
  );
}
