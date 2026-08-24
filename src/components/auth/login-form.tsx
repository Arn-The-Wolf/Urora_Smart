"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not sign in");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12"
          placeholder="you@farm.rw"
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12"
        />
      </Field>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading} className="h-12 w-full text-base">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <div className="grid gap-2">
        <button
          type="button"
          className="w-full rounded-2xl bg-accent px-3 py-3 text-left text-sm"
          onClick={() => {
            setEmail("farmer@urora.farm");
            setPassword("farm1234");
          }}
        >
          <span className="font-semibold text-foreground">Demo · Farm boss</span>
          <span className="mt-0.5 block text-muted-foreground">farmer@urora.farm · farm1234 · reports</span>
        </button>
        <button
          type="button"
          className="w-full rounded-2xl border border-border bg-card px-3 py-3 text-left text-sm"
          onClick={() => {
            setEmail("operator@urora.farm");
            setPassword("farm1234");
          }}
        >
          <span className="font-semibold text-foreground">Demo · Farm operator</span>
          <span className="mt-0.5 block text-muted-foreground">operator@urora.farm · farm1234 · daily ops</span>
        </button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        New farm?{" "}
        <Link href="/register" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </form>
  );
}
