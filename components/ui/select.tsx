"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

const SelectContext = React.createContext<{
  value: string;
  setValue: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

function Select({
  value: controlledValue,
  onValueChange,
  defaultValue,
  children,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  const [internalValue, setInternal] = React.useState(defaultValue ?? "");
  const [open, setOpen] = React.useState(false);
  const value = controlledValue ?? internalValue;
  const setValue = React.useCallback(
    (v: string) => {
      if (controlledValue === undefined) setInternal(v);
      onValueChange?.(v);
      setOpen(false);
    },
    [controlledValue, onValueChange]
  );
  return (
    <SelectContext.Provider value={{ value, setValue, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={ctx.open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 opacity-50" />
    </button>
  );
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const ctx = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ctx.setOpen(false);
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [ctx?.open]);

  if (!ctx?.open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SelectItem({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  const isSelected = ctx.value === value;
  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected]:bg-accent",
        className
      )}
      onClick={() => ctx.setValue(value)}
      {...props}
    >
      {children}
    </div>
  );
}

function SelectValue({ placeholder }: { placeholder?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return <span>{ctx.value || placeholder}</span>;
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
