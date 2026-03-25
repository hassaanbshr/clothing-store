"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBagIcon, HeartIcon, SearchIcon, MenuIcon, UserIcon, SparklesIcon, MoonStarIcon } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/shop?category=men", label: "Men" },
  { href: "/shop?category=women", label: "Women" },
  { href: "/shop?q=hoodie", label: "Hoodies" },
  { href: "/shop?q=t-shirt", label: "T-Shirts" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const totalCount = useCartStore((s) => s.getTotalItems());
  const openCart = useUIStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex min-h-16 items-center gap-4 px-4 py-3">
        <Link href="/" className="font-brand premium-link text-[1.35rem] leading-none md:text-[1.45rem]">
          MARGELLE
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="premium-link text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/shop" className="hidden flex-1 items-center lg:flex lg:max-w-sm">
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Search hoodies, tees, essentials..."
              className="premium-panel premium-ring h-10 rounded-full border-border/70 bg-background/90 pl-9 pr-4 shadow-sm transition-shadow focus-visible:border-foreground/30 focus-visible:ring-foreground/10"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <Button variant="ghost" size="icon" asChild className="pressable lg:hidden">
            <Link href="/shop?q=" aria-label="Search">
              <SearchIcon className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="pressable hidden sm:inline-flex">
            <Link href="/shop?sort=newest" aria-label="New arrivals">
              <SparklesIcon className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="pressable hidden sm:inline-flex">
            <Link href="/wishlist" aria-label="Wishlist">
              <HeartIcon className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="pressable relative" onClick={openCart} aria-label="Cart">
            <ShoppingBagIcon className="h-5 w-5" />
            <AnimatePresence>
              {mounted && totalCount > 0 && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow-sm"
                >
                  {totalCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          {status === "authenticated" ? (
            <Button variant="ghost" size="icon" asChild className="pressable hidden sm:inline-flex">
              <Link href="/account" aria-label="Account">
                <UserIcon className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild className="premium-surface hidden sm:inline-flex">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <div className="mt-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between border-b pb-4 pr-10"
                >
                  <div>
                    <SheetTitle className="font-brand text-xl leading-none">MARGELLE</SheetTitle>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">Navigation</p>
                  </div>
                </motion.div>
                <form action="/shop" className="space-y-2" onSubmit={() => setMobileOpen(false)}>
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Search
                  </label>
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      name="q"
                      placeholder="Search products"
                      className="premium-panel premium-ring h-11 pl-9"
                    />
                  </div>
                </form>

                <nav className="flex flex-col gap-4">
                  <Link
                    href="/shop"
                    className="rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    Shop All
                  </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                </nav>

                <div className="space-y-3 border-t pt-4 text-sm">
                  <SheetClose asChild>
                    <Link href="/cart" className="block text-muted-foreground hover:text-foreground">
                      Cart
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/wishlist" className="block text-muted-foreground hover:text-foreground">
                      Wishlist
                    </Link>
                  </SheetClose>
                  {session ? (
                    <SheetClose asChild>
                      <Link href="/account" className="block text-muted-foreground hover:text-foreground">
                        Account
                      </Link>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link href="/auth/login" className="block text-muted-foreground hover:text-foreground">
                        Sign In
                      </Link>
                    </SheetClose>
                  )}
                  <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MoonStarIcon className="h-4 w-4" />
                      <span>Theme</span>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
