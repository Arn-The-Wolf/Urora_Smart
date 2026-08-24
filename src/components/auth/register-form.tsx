"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmName: form.get("farmName"),
          location: form.get("location"),
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not create farm");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create farm");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Farm name" htmlFor="farmName">
        <Input id="farmName" name="farmName" required className="h-12" placeholder="Nyagatare Hills Dairy" />
      </Field>
      <Field label="Location" htmlFor="location">
        <Input id="location" name="location" className="h-12" placeholder="Nyagatare, Rwanda" />
      </Field>
      <Field label="Your name" htmlFor="name">
        <Input id="name" name="name" required className="h-12" placeholder="Jean Uwase" />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required className="h-12" placeholder="you@farm.rw" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" required minLength={8} className="h-12" />
      </Field>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading} className="h-12 w-full text-base">
        {loading ? "Creating farm…" : "Create farm"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have a ledger?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
