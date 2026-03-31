"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/admin";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b bg-background/70 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <p className="font-brand text-lg">MARGELLE</p>
          <p className="text-sm text-muted-foreground">Admin Console</p>
        </div>

        <nav className="grid gap-2">
          {adminNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl border px-4 py-3 transition-colors",
                  active
                    ? "border-primary/30 bg-primary/5 text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
