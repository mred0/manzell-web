"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

// Underline-style fields (no boxed borders) to match the premium editorial
// card used across the redesigned pages, rather than the plain bordered
// inputs the form used before.
const fieldClasses =
  "mt-1 w-full border-0 border-b border-brand-border bg-transparent px-0.5 py-2.5 text-sm text-brand-ink outline-none transition-colors focus:border-brand-gold-deep";
const labelTextClasses =
  "block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-brand-ink/55";

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
      <div className="flex flex-col items-center gap-3 border border-brand-border bg-white p-10 text-center shadow-[0_30px_60px_-30px_rgba(36,26,28,0.3)]">
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
      className="border border-brand-border bg-white p-8 shadow-[0_30px_60px_-30px_rgba(36,26,28,0.3)] md:p-11"
    >
      {initialListing && (
        <>
          <input type="hidden" name="listingId" value={initialRef ?? ""} />
          <input type="hidden" name="listingTitle" value={initialListing} />
        </>
      )}

      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
        Send an Enquiry
      </p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-brand-ink">
        Tell us what you&rsquo;re looking for
      </h2>

      {initialListing && (
        <div className="mt-6 bg-brand-surface px-4 py-3 text-sm text-brand-ink/80">
          Regarding: <span className="font-semibold">{initialListing}</span>
        </div>
      )}

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={labelTextClasses}>Full name</span>
          <input required name="name" type="text" autoComplete="name" className={fieldClasses} />
        </label>

        <label className="block">
          <span className={labelTextClasses}>Email</span>
          <input required name="email" type="email" autoComplete="email" className={fieldClasses} />
        </label>
      </div>

      <label className="mt-6 block">
        <span className={labelTextClasses}>
          Phone <span className="normal-case text-brand-ink/40">(optional)</span>
        </span>
        <input name="phone" type="tel" autoComplete="tel" className={fieldClasses} />
      </label>

      <label className="mt-6 block">
        <span className={labelTextClasses}>Message</span>
        <textarea
          required
          name="message"
          rows={4}
          defaultValue={initialListing ? `I'd like to arrange a viewing for ${initialListing}.` : ""}
          className={`${fieldClasses} resize-none`}
        />
      </label>

      {status === "error" && errorMessage && (
        <p className="mt-5 text-sm font-medium text-status-reduced">{errorMessage}</p>
      )}

      <div className="mt-8 flex items-center justify-between gap-6">
        <p className="max-w-[220px] text-[11px] leading-relaxed text-brand-ink/50">
          We reply personally &mdash; never an automated response.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex shrink-0 items-center gap-2 border border-brand-gold px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-gold-deep transition-all duration-300 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.75)_0%,rgba(233,201,138,0.4)_60%,rgba(233,201,138,0.55)_100%)] hover:text-brand-plum hover:shadow-[0_0_18px_-2px_rgba(233,201,138,0.7)] disabled:opacity-60"
        >
          {status === "submitting" && <Loader2 className="animate-spin" size={16} />}
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
