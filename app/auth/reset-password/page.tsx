"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reset failed");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <p className="text-green-600 font-medium">Password reset successfully.</p>
        <p className="text-muted-foreground text-sm mt-2">Redirecting to sign in...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Invalid or missing reset token.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">New password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Confirm password</label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          className="mt-1"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">
        Reset password
      </h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-4 text-sm text-center">
        <Link href="/auth/login" className="text-muted-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
