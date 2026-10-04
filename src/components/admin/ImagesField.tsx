"use client";

import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/types/listing";

/**
 * The general-purpose reusable stock-photo pool in /public/photos (see the
 * "Real stock photography" note in the project doc) — 12 exterior shots (2
 * per property type) + 27 interior room shots. Built from the same naming
 * convention scripts/lib/listing-photos.mjs uses, so this list and the
 * generator can't silently drift apart.
 */
function buildStockPhotos(): { src: string; label: string }[] {
  const exteriorTypes: Array<[string, string]> = [
    ["apartment", "Apartment"],
    ["penthouse", "Penthouse"],
    ["maisonette", "Maisonette"],
    ["townhouse", "Townhouse"],
    ["detached-house", "Detached house"],
    ["mews-house", "Mews house"],
  ];
  const interiorRooms: Array<[string, string, number]> = [
    ["livingroom", "Living room", 5],
    ["kitchen", "Kitchen", 5],
    ["bedroom", "Bedroom", 4],
    ["bathroom", "Bathroom", 4],
    ["dining", "Dining room", 4],
    ["study", "Study", 3],
    ["hallway", "Entrance hallway", 2],
  ];

  const photos: { src: string; label: string }[] = [];
  for (const [slug, label] of exteriorTypes) {
    for (const n of [1, 2]) {
      photos.push({
        src: `/photos/exterior-${slug}-0${n}.jpg`,
        label: `Exterior — ${label} ${n === 1 ? "A" : "B"}`,
      });
    }
  }
  for (const [slug, label, count] of interiorRooms) {
    for (let n = 1; n <= count; n++) {
      photos.push({ src: `/photos/interior-${slug}-0${n}.jpg`, label: `${label} ${n}` });
    }
  }
  return photos;
}

const STOCK_PHOTOS = buildStockPhotos();

interface ImageEntry {
  src: string;
  alt: string;
}

function serializeImages(images: ImageEntry[]): string {
  return images.map((img) => `${img.src} | ${img.alt}`).join("\n");
}

/**
 * Visual replacement for the old "one per line, src | alt text" textarea.
 * Renders each photo as an actual thumbnail with up/down reorder controls —
 * the first image is always the cover shown on listing cards and the
 * property-page gallery hero (see PropertyCard.tsx / PropertyGallery.tsx),
 * so being able to see and reorder them here (rather than counting lines
 * in a textarea) directly controls what a visitor sees first.
 *
 * Still writes the exact same "src | alt" lines into a hidden `images`
 * input on every change, so src/app/admin/actions.ts's form parsing needs
 * no changes at all — this is a new front end on the same wire format.
 */
export default function ImagesField({
  initial,
  titleFallback,
}: {
  initial: Listing["images"] | undefined;
  /** Used as part of the default alt text when a newly added photo has none. */
  titleFallback: string;
}) {
  const [images, setImages] = useState<ImageEntry[]>(initial ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Keep the hidden input's actual DOM value in sync with state, and fire a
  // real "input" event so the readiness checklist above (which listens for
  // input/change on the <form>, not React state) picks up the change too.
  useEffect(() => {
    const el = hiddenInputRef.current;
    if (!el) return;
    const serialized = serializeImages(images);
    if (el.value !== serialized) {
      el.value = serialized;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, [images]);

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function updateAlt(index: number, alt: string) {
    setImages((current) => current.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function addPhoto(src: string, label: string) {
    if (images.some((img) => img.src === src)) return;
    setImages((current) => [
      ...current,
      { src, alt: `${label} at ${titleFallback || "this property"}` },
    ]);
  }

  return (
    <div>
      <input type="hidden" name="images" ref={hiddenInputRef} defaultValue={serializeImages(images)} />

      {images.length === 0 ? (
        <p className="border border-dashed border-brand-border p-6 text-center text-sm text-brand-ink/50">
          No photos yet — a default placeholder graphic will be used until you add some from the
          library below.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, index) => (
            <div key={`${img.src}-${index}`} className="border border-brand-border bg-white">
              <div className="relative aspect-[4/3] bg-brand-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 border border-brand-border bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-ink/70">
                  {index === 0 ? "Cover" : `#${index + 1}`}
                </span>
              </div>
              <div className="space-y-2 p-2.5">
                <input
                  value={img.alt}
                  onChange={(e) => updateAlt(index, e.target.value)}
                  placeholder="Alt text"
                  className="w-full border border-brand-border bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-gold"
                />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      title="Move earlier"
                      className="border border-brand-border px-2 py-1 text-[10px] font-semibold text-brand-ink/60 transition-colors hover:border-brand-ink hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      &uarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      title="Move later"
                      className="border border-brand-border px-2 py-1 text-[10px] font-semibold text-brand-ink/60 transition-colors hover:border-brand-ink hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      &darr;
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-[10px] font-semibold uppercase tracking-wider text-status-reduced hover:text-brand-plum"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          className="inline-flex items-center gap-2 border border-brand-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-background"
        >
          {pickerOpen ? "Close photo library" : "+ Add from photo library"}
        </button>

        {pickerOpen && (
          <div className="mt-3 max-h-80 overflow-y-auto border border-brand-border bg-brand-surface p-3">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {STOCK_PHOTOS.map((photo) => {
                const added = images.some((img) => img.src === photo.src);
                return (
                  <button
                    key={photo.src}
                    type="button"
                    onClick={() => addPhoto(photo.src, photo.label)}
                    disabled={added}
                    title={added ? `${photo.label} already added` : `Add "${photo.label}"`}
                    className="group border border-brand-border bg-white text-left transition-colors hover:border-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.src}
                        alt={photo.label}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <p className="truncate px-1.5 py-1 text-[10px] text-brand-ink/60">
                      {added ? "Added" : photo.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
