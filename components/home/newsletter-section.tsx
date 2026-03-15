"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Join Our Newsletter
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Subscribe for updates, new arrivals, and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={status === "loading"}
          />
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "..." : "Subscribe"}
          </Button>
        </form>
        {status === "success" && (
          <p className="mt-2 text-sm text-green-600">Thanks for subscribing!</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-destructive">Something went wrong. Try again.</p>
        )}
      </div>
    </section>
  );
}
