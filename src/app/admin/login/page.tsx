"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Couldn't sign in.");
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="max-w-md border border-brand-border bg-white p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
            Admin
          </p>
          <h1 className="mt-2 font-display text-xl font-bold text-brand-ink">
            Supabase isn&rsquo;t connected yet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">
            The admin backend needs a Supabase project and a few environment
            variables before anyone can log in. See{" "}
            <code className="text-brand-gold-deep">SUPABASE_SETUP.md</code> at
            the repo root for the exact steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-brand-border bg-white p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
          Manzell Admin
        </p>
        <h1 className="mt-2 font-display text-2xl italic text-brand-ink">Sign in</h1>

        <label className="mt-6 block text-sm font-medium text-brand-ink">
          Email
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-gold"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-brand-ink">
          Password
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-gold"
          />
        </label>

        {status === "error" && errorMessage && (
          <p className="mt-4 text-sm font-medium text-status-reduced">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-brand-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background disabled:opacity-60"
        >
          {status === "loading" && <Loader2 className="animate-spin" size={16} />}
          Sign in
        </button>

        <p className="mt-5 text-xs text-brand-ink/50">
          Admin accounts are created in the Supabase dashboard — there&rsquo;s
          no public sign-up.
        </p>
      </form>
    </div>
  );
}
