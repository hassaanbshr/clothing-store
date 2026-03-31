"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { GripVerticalIcon, ImagePlusIcon, LoaderCircleIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductMediaInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

type UploadPreview = {
  id: string;
  previewUrl: string;
  status: "uploading" | "error";
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function ProductMediaInput({
  value,
  onChange,
}: ProductMediaInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const previewEntries = fileArray.map((file) => ({
      id: `${file.name}-${crypto.randomUUID()}`,
      previewUrl: URL.createObjectURL(file),
      status: "uploading" as const,
    }));

    setUploads((current) => [...current, ...previewEntries]);

    const formData = new FormData();
    fileArray.forEach((file) => formData.append("files", file));
    formData.append("folder", "products");

    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Upload failed");
      }

      const urls = (payload.uploads as { url: string }[]).map((item) => item.url);
      onChange([...value, ...urls]);
      previewEntries.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));
      setUploads((current) => current.filter((item) => !previewEntries.some((preview) => preview.id === item.id)));
    } catch {
      setUploads((current) =>
        current.map((item) =>
          previewEntries.some((preview) => preview.id === item.id)
            ? { ...item, status: "error" }
            : item
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void uploadFiles(event.dataTransfer.files);
        }}
        className="rounded-[1.25rem] border border-dashed bg-muted/20 p-6 text-center"
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="rounded-full bg-background p-3 shadow-sm">
            <ImagePlusIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Drop product images here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload multiple JPG, PNG, or WEBP files and drag to reorder them.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Select images
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(event) => {
              if (!event.target.files) return;
              void uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {value.length === 0 && uploads.length === 0 ? null : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {value.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedIndex == null || draggedIndex === index) return;
                onChange(moveItem(value, draggedIndex, index));
                setDraggedIndex(null);
              }}
              className="group rounded-[1.25rem] border bg-card p-3 shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                <Image src={url} alt="" fill className="object-cover" unoptimized />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GripVerticalIcon className="h-4 w-4" />
                  {index === 0 ? "Primary image" : `Image ${index + 1}`}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  onClick={() => onChange(value.filter((item) => item !== url))}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {uploads.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-[1.25rem] border bg-card p-3 shadow-sm",
                item.status === "error" && "border-destructive/50"
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                <Image src={item.previewUrl} alt="" fill className="object-cover opacity-70" unoptimized />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <LoaderCircleIcon className="h-5 w-5 animate-spin text-white" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {item.status === "error" ? "Upload failed" : "Uploading..."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
