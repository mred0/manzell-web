"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export default function EnquiryForm({
  initialListing,
  initialRef,
}: {
  initialListing?: string;
  initialRef?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 border border-brand-border bg-white p-10 text-center">
        <CheckCircle2 className="text-status-let" size={40} />
        <h2 className="font-display text-xl font-bold text-brand-ink">
          Thank you — we&rsquo;ve received your enquiry
        </h2>
        <p className="max-w-sm text-sm text-brand-ink/70">
          A Manzell adviser will be in touch shortly, usually within one
          working day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 border border-brand-border bg-white p-6 md:p-8"
    >
      {initialListing && (
        <>
          <input type="hidden" name="listingId" value={initialRef ?? ""} />
          <input type="hidden" name="listingTitle" value={initialListing} />
        </>
      )}

      {initialListing && (
        <div className="bg-brand-surface px-4 py-3 text-sm text-brand-ink/80">
          Regarding: <span className="font-semibold">{initialListing}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-brand-ink">
          Full name
          <input
            required
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1.5 w-full border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-gold"
          />
        </label>

        <label className="block text-sm font-medium text-brand-ink">
          Email
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="mt-1.5 w-full border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-gold"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-brand-ink">
        Phone (optional)
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-1.5 w-full border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-gold"
        />
      </label>

      <label className="block text-sm font-medium text-brand-ink">
        Message
        <textarea
          required
          name="message"
          rows={5}
          defaultValue={initialListing ? `I'd like to arrange a viewing for ${initialListing}.` : ""}
          className="mt-1.5 w-full resize-none border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-gold"
        />
      </label>

      {status === "error" && errorMessage && (
        <p className="text-sm font-medium text-status-reduced">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center gap-2 border border-brand-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background disabled:opacity-60"
      >
        {status === "submitting" && <Loader2 className="animate-spin" size={16} />}
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
