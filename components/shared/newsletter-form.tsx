"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NewsletterFormProps = {
  source?: string;
  compact?: boolean;
  buttonLabel?: string;
  placeholder?: string;
  onSuccess?: () => void;
  className?: string;
};

export function NewsletterForm({
  source = "site",
  compact = false,
  buttonLabel = "Subscribe",
  placeholder = "Enter your email",
  onSuccess,
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-2 sm:flex-row", compact && "sm:items-center")}
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={cn("h-11", compact && "sm:h-10")}
          disabled={status === "loading"}
          required
        />
        <Button type="submit" className={cn("h-11 px-5", compact && "sm:h-10")} disabled={status === "loading"}>
          {status === "loading" ? "..." : buttonLabel}
        </Button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-sm text-green-600">Thanks for subscribing. Your welcome offer is on the way.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-destructive">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
