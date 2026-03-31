import { cn } from "@/lib/utils";

export function AdminTableShell({
  className,
  children,
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("overflow-hidden rounded-[1.5rem] border bg-card shadow-sm", className)}>
      {children}
    </div>
  );
}
