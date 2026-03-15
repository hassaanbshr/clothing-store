"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingBagIcon, HeartIcon, SearchIcon, MenuIcon, UserIcon } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=men", label: "Men" },
  { href: "/shop?category=women", label: "Women" },
  { href: "/shop?category=accessories", label: "Accessories" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const totalCount = useCartStore((s) => s.getTotalItems());
  const openCart = useUIStore((s) => s.openCart);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-brand text-[1.35rem] leading-none">
          MARGELLE
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/shop?q=" aria-label="Search">
              <SearchIcon className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist" aria-label="Wishlist">
              <HeartIcon className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" onClick={openCart} aria-label="Cart">
            <ShoppingBagIcon className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {totalCount}
              </span>
            )}
          </Button>
          <ThemeToggle />
          {status === "authenticated" ? (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account" aria-label="Account">
                <UserIcon className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/cart" onClick={() => setMobileOpen(false)}>Cart</Link>
                <Link href="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                {session ? (
                  <Link href="/account" onClick={() => setMobileOpen(false)}>Account</Link>
                ) : (
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
