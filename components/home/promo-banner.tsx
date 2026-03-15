import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 px-8 py-16 text-center text-white dark:bg-neutral-100 dark:text-neutral-900 md:py-24">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          New Styles for a Modern Look
        </h2>
        <p className="mt-2 text-neutral-300 dark:text-neutral-600 max-w-xl mx-auto">
          Discover our latest collection. Limited time offer.
        </p>
        <Button asChild size="lg" className="mt-8 bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800">
          <Link href="/shop">Shop Collection</Link>
        </Button>
      </div>
    </section>
  );
}
