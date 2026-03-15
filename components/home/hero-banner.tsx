import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative grid min-h-[70vh] grid-cols-1 md:grid-cols-2 gap-0 bg-muted">
      <div className="flex flex-col justify-center px-8 py-16 md:px-12 lg:px-16">
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Make your Fashion look
        </h1>
        <p className="mt-2 text-2xl text-muted-foreground md:text-3xl">More Charming</p>
        <Button asChild size="lg" variant="outline" className="mt-8 w-fit border-2">
          <Link href="/shop">Explore</Link>
        </Button>
      </div>
      <div className="relative min-h-[40vh] md:min-h-[70vh] bg-neutral-200 dark:bg-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-300/50 to-transparent dark:from-neutral-700/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-brand text-6xl text-white/90 drop-shadow-lg md:text-8xl lg:text-[7rem]">
            MARGELLE
          </span>
        </div>
      </div>
    </section>
  );
}
