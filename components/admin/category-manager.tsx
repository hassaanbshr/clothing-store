"use client";

import { useMemo, useState, useTransition } from "react";
import { useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteCategoryAction, saveCategoryAction } from "@/actions/admin";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
  productCount: number;
};

type Draft = {
  id?: string;
  name: string;
  slug: string;
  order: number;
};

const emptyDraft: Draft = {
  name: "",
  slug: "",
  order: 0,
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [optimisticCategories, setOptimisticCategories] = useOptimistic(
    categories,
    (current, next: Category[]) => next
  );

  const sorted = useMemo(
    () => [...optimisticCategories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [optimisticCategories]
  );

  const openCreate = () => {
    setDraft({
      ...emptyDraft,
      order: sorted.length,
    });
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setDraft({
      id: category.id,
      name: category.name,
      slug: category.slug,
      order: category.order,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    startTransition(async () => {
      const result = await saveCategoryAction(draft);
      if (!result.success) {
        toast.error(result.error ?? "Failed to save category.");
        return;
      }
      toast.success(draft.id ? "Category updated." : "Category created.");
      setDialogOpen(false);
      router.refresh();
    });
  };

  const remove = (category: Category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;

    startTransition(async () => {
      setOptimisticCategories(sorted.filter((item) => item.id !== category.id));
      const result = await deleteCategoryAction(category.id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete category.");
        router.refresh();
        return;
      }
      toast.success("Category deleted.");
      router.refresh();
    });
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={openCreate}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add category
        </Button>
      </div>

      <AdminTableShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Slug</th>
                <th className="p-4 text-left font-medium">Order</th>
                <th className="p-4 text-left font-medium">Products</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="p-4 font-medium">{category.name}</td>
                  <td className="p-4 text-muted-foreground">/{category.slug}</td>
                  <td className="p-4">{category.order}</td>
                  <td className="p-4">{category.productCount}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(category)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit category" : "Create category"}</DialogTitle>
            <DialogDescription>
              Keep category names simple and searchable for both shoppers and admins.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                className="mt-1"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input
                className="mt-1"
                value={draft.slug}
                onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display order</label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={draft.order}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, order: Number(event.target.value) || 0 }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? "Saving..." : draft.id ? "Update category" : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
