"use client";

import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/types/listing";
import ImagesField from "@/components/admin/ImagesField";

const inputClass =
  "mt-1.5 w-full border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold";
const labelClass = "block text-sm font-medium text-brand-ink";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className={labelClass}>
      {label}
      {children}
    </label>
  );
}

/** Renders newline-per-item fields back into their editable text-block form. */
function linesValue(items: string[] | undefined) {
  return (items ?? []).join("\n");
}

interface ReadinessCheck {
  label: string;
  done: boolean;
}

/**
 * A lighter, admin-facing cousin of the "required to publish" validation
 * the form already enforces via the `required` attribute: a few editorial
 * nudges (features, photos, lease details) that are never hard blockers
 * but make a listing feel finished. Recomputed live from the form's own
 * FormData on every change — see the `input`/`change` listener below —
 * rather than wiring every field into React state.
 */
function computeReadiness(formData: FormData): ReadinessCheck[] {
  const str = (name: string) => ((formData.get(name) as string | null) ?? "").trim();
  const hasLines = (name: string) =>
    str(name)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean).length > 0;

  const purpose = str("purpose");
  const tenure = str("tenure");

  return [
    {
      label: "Address & location set",
      done: Boolean(str("title") && str("addressLine") && str("area") && str("postcodeDistrict")),
    },
    {
      label: purpose === "let" ? "Rent set" : "Price set",
      done: purpose === "let" ? Boolean(str("rentPcm")) : Boolean(str("price")),
    },
    {
      label: "Summary & description written",
      done: Boolean(str("summary")) && hasLines("description"),
    },
    {
      label: "Key features listed",
      done: hasLines("features"),
    },
    {
      label: "Photos added",
      done: hasLines("images"),
    },
    {
      label: "Lease details set",
      done:
        tenure === "freehold"
          ? true
          : Boolean(str("serviceChargeAnnual") || str("leaseYearsRemaining")),
    },
  ];
}

/**
 * Shared create/edit form for a listing. `action` is a server action bound
 * to the right create/update function by the page that renders this (see
 * src/app/admin/actions.ts) — this component has no idea which one it is.
 */
export default function ListingForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: Listing;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [readiness, setReadiness] = useState<ReadinessCheck[]>([]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    function recompute() {
      setReadiness(computeReadiness(new FormData(form!)));
    }

    recompute();
    form.addEventListener("input", recompute);
    form.addEventListener("change", recompute);
    return () => {
      form.removeEventListener("input", recompute);
      form.removeEventListener("change", recompute);
    };
  }, []);

  const readyCount = readiness.filter((check) => check.done).length;
  const allReady = readiness.length > 0 && readyCount === readiness.length;

  return (
    <form action={action} ref={formRef} className="space-y-8">
      <section className="border border-brand-border bg-white p-6 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
              Listing readiness
            </p>
            <h2 className="mt-1 font-display text-lg italic text-brand-ink">
              {readyCount} of {readiness.length || 6} ready to publish
            </h2>
          </div>
          <span
            className={`h-2.5 w-2.5 flex-none rounded-full ${
              allReady ? "bg-status-let" : readyCount === 0 ? "bg-brand-ink/25" : "bg-status-sstc"
            }`}
            aria-hidden
          />
        </div>
        <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {readiness.map((check) => (
            <li
              key={check.label}
              className={`flex items-center gap-2 text-sm ${
                check.done ? "text-brand-ink" : "text-brand-ink/45"
              }`}
            >
              <span
                className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border text-[10px] leading-none ${
                  check.done
                    ? "border-status-let bg-status-let text-white"
                    : "border-brand-border text-transparent"
                }`}
                aria-hidden
              >
                &#10003;
              </span>
              {check.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-5 border border-brand-border bg-white p-6 sm:grid-cols-2 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
        <Field label="Title">
          <input name="title" required defaultValue={initial?.title} className={inputClass} />
        </Field>
        <Field label="Slug (URL-safe, unique)">
          <input name="slug" required defaultValue={initial?.slug} className={inputClass} />
        </Field>

        <Field label="Purpose">
          <select name="purpose" required defaultValue={initial?.purpose ?? "sale"} className={inputClass}>
            <option value="sale">For sale</option>
            <option value="let">To let</option>
          </select>
        </Field>
        <Field label="Status">
          <select name="status" required defaultValue={initial?.status ?? "for-sale"} className={inputClass}>
            <option value="for-sale">For sale</option>
            <option value="under-offer">Under offer</option>
            <option value="sstc">SSTC</option>
            <option value="to-let">To let</option>
            <option value="let-agreed">Let agreed</option>
          </select>
        </Field>

        <Field label="Property type">
          <select
            name="propertyType"
            required
            defaultValue={initial?.propertyType ?? "apartment"}
            className={inputClass}
          >
            <option value="apartment">Apartment</option>
            <option value="penthouse">Penthouse</option>
            <option value="maisonette">Maisonette</option>
            <option value="townhouse">Townhouse</option>
            <option value="detached-house">Detached house</option>
            <option value="mews-house">Mews house</option>
          </select>
        </Field>
        <Field label="Tenure">
          <select name="tenure" required defaultValue={initial?.tenure ?? "freehold"} className={inputClass}>
            <option value="freehold">Freehold</option>
            <option value="leasehold">Leasehold</option>
            <option value="share-of-freehold">Share of freehold</option>
          </select>
        </Field>

        <Field label="Address line">
          <input
            name="addressLine"
            required
            defaultValue={initial?.addressLine}
            className={inputClass}
          />
        </Field>
        <Field label="Area">
          <input name="area" required defaultValue={initial?.area} className={inputClass} />
        </Field>
        <Field label="Postcode district">
          <input
            name="postcodeDistrict"
            required
            defaultValue={initial?.postcodeDistrict}
            className={inputClass}
          />
        </Field>
        <Field label="Date listed">
          <input
            name="dateListed"
            type="date"
            defaultValue={initial?.dateListed ?? new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} />
          Feature on homepage
        </label>
      </section>

      <section className="grid gap-5 border border-brand-border bg-white p-6 sm:grid-cols-2 lg:grid-cols-4 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
        <Field label="Price (£, sale)">
          <input name="price" type="number" min={0} defaultValue={initial?.price} className={inputClass} />
        </Field>
        <Field label="Rent (£ pcm, let)">
          <input
            name="rentPcm"
            type="number"
            min={0}
            defaultValue={initial?.rentPcm}
            className={inputClass}
          />
        </Field>
        <Field label="Bedrooms">
          <input
            name="bedrooms"
            type="number"
            min={0}
            required
            defaultValue={initial?.bedrooms}
            className={inputClass}
          />
        </Field>
        <Field label="Bathrooms">
          <input
            name="bathrooms"
            type="number"
            min={0}
            required
            defaultValue={initial?.bathrooms}
            className={inputClass}
          />
        </Field>
        <Field label="Receptions">
          <input
            name="receptions"
            type="number"
            min={0}
            required
            defaultValue={initial?.receptions}
            className={inputClass}
          />
        </Field>
        <Field label="Size (sqft)">
          <input
            name="sizeSqft"
            type="number"
            min={0}
            required
            defaultValue={initial?.sizeSqft}
            className={inputClass}
          />
        </Field>
        <Field label="EPC rating">
          <select name="epcRating" required defaultValue={initial?.epcRating ?? "C"} className={inputClass}>
            {["A", "B", "C", "D", "E", "F", "G"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Council tax band">
          <input
            name="councilTaxBand"
            required
            defaultValue={initial?.councilTaxBand}
            className={inputClass}
          />
        </Field>
        <Field label="Service charge (£/yr, optional)">
          <input
            name="serviceChargeAnnual"
            type="number"
            min={0}
            defaultValue={initial?.serviceChargeAnnual}
            className={inputClass}
          />
        </Field>
        <Field label="Lease years remaining (optional)">
          <input
            name="leaseYearsRemaining"
            type="number"
            min={0}
            defaultValue={initial?.leaseYearsRemaining}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-5 border border-brand-border bg-white p-6 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
        <Field label="Summary (one or two sentences)">
          <textarea
            name="summary"
            required
            rows={2}
            defaultValue={initial?.summary}
            className={inputClass}
          />
        </Field>
        <Field label="Description (one paragraph per line)">
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={linesValue(initial?.description)}
            className={inputClass}
          />
        </Field>
        <Field label="Features (one per line)">
          <textarea
            name="features"
            rows={5}
            defaultValue={linesValue(initial?.features)}
            className={inputClass}
          />
        </Field>
        <div>
          <p className={labelClass}>Photos</p>
          <div className="mt-1.5">
            <ImagesField initial={initial?.images} titleFallback={initial?.title ?? ""} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 border border-brand-ink px-8 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background"
        >
          {initial ? "Save changes" : "Create listing"}
        </button>
      </div>
    </form>
  );
}
