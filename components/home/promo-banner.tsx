import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MotionItem, MotionStagger } from "@/components/shared/motion";

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-16">
      <MotionStagger className="relative overflow-hidden rounded-2xl bg-neutral-900 px-8 py-16 text-center text-white premium-panel dark:bg-neutral-100 dark:text-neutral-900 md:py-24">
        <MotionItem>
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            New Styles for a Modern Look
          </h2>
        </MotionItem>
        <MotionItem>
          <p className="mt-2 max-w-xl mx-auto text-neutral-300 dark:text-neutral-600">
            Discover our latest collection. Limited time offer.
          </p>
        </MotionItem>
        <MotionItem>
          <Button asChild size="lg" className="premium-surface mt-8 bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800">
            <Link href="/shop">Shop Collection</Link>
          </Button>
        </MotionItem>
      </MotionStagger>
    </section>
  );
}
