import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MotionItem, MotionReveal, MotionStagger } from "@/components/shared/motion";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b bg-neutral-950 text-white">
      <MotionReveal
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_34%),radial-gradient(circle_at_75%_20%,_rgba(255,180,120,0.22),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.06),_transparent_45%)]"
        distance={0}
        duration={1}
      />
      <MotionReveal
        aria-hidden
        className="absolute inset-y-0 right-[-10%] hidden w-[48%] rounded-full bg-white/10 blur-3xl lg:block"
        delay={0.15}
        distance={0}
        duration={1.1}
      />

      <div className="container relative mx-auto grid min-h-[78vh] items-center gap-10 px-4 py-14 md:min-h-[82vh] md:grid-cols-[1.05fr_0.95fr] md:px-6 lg:gap-16 lg:py-20">
        <MotionStagger className="max-w-2xl space-y-6" delayChildren={0.1}>
          <MotionItem>
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 premium-panel">
              New season essentials
            </span>
          </MotionItem>
          <MotionItem className="space-y-4">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
              Premium Streetwear for Everyday Confidence
            </h1>
            <p className="max-w-xl text-base text-white/75 sm:text-lg lg:text-xl">
              Minimal. Comfortable. Built for modern style.
            </p>
          </MotionItem>

          <MotionItem className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="pressable h-11 px-6 text-sm font-semibold premium-surface">
              <Link href="/shop">Shop Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="pressable h-11 border-white/20 bg-white/5 px-6 text-sm text-white hover:bg-white/10 hover:text-white premium-panel"
            >
              <Link href="/shop?sort=newest">New Arrivals</Link>
            </Button>
          </MotionItem>

          <MotionStagger className="grid max-w-xl grid-cols-3 gap-3 pt-3 text-left" delayChildren={0.2} staggerChildren={0.1}>
            {[
              { value: "24hr", label: "dispatch on new drops" },
              { value: "4.9", label: "average customer rating" },
              { value: "Rs 2500+", label: "free delivery threshold" },
            ].map((item) => (
              <MotionItem key={item.label}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 premium-panel">
                  <div className="font-brand text-xl text-white">{item.value}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">{item.label}</p>
                </div>
              </MotionItem>
            ))}
          </MotionStagger>
        </MotionStagger>

        <MotionReveal className="relative" delay={0.2} distance={30}>
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur premium-panel md:ml-auto md:max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/16 via-transparent to-white/5" />
            <div className="relative flex h-full flex-col justify-between rounded-[1.5rem] border border-white/10 bg-neutral-900/80 p-5">
              <div className="flex items-start justify-between">
                <span className="font-brand text-3xl tracking-tight text-white/95 sm:text-4xl">
                  MARGELLE
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Streetwear
                </span>
              </div>

              <div className="relative flex-1">
                <div className="absolute inset-x-[10%] top-[10%] bottom-[14%] rounded-[999px] bg-gradient-to-b from-stone-200 via-stone-400 to-stone-800 opacity-80 blur-sm" />
                <div className="absolute bottom-0 left-[15%] right-[15%] h-[78%] rounded-t-[8rem] bg-gradient-to-b from-stone-100 via-stone-300 to-stone-700" />
                <div className="absolute bottom-[12%] left-1/2 h-[32%] w-[34%] -translate-x-1/2 rounded-[2rem] border border-white/20 bg-gradient-to-b from-neutral-950/40 to-neutral-950/80 backdrop-blur" />
                <div className="absolute bottom-[38%] left-1/2 h-[18%] w-[24%] -translate-x-1/2 rounded-t-[999px] rounded-b-[1.6rem] border border-white/15 bg-gradient-to-b from-stone-300 to-stone-700" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">Best Seller</p>
                  <p className="mt-2 text-sm font-medium">Layer-ready silhouettes for every day.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">Comfort First</p>
                  <p className="mt-2 text-sm font-medium">Designed to feel easy from morning to night.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-6 left-6 hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 backdrop-blur md:inline-flex premium-panel">
            Elevated basics
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
