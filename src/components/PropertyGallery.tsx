"use client";

import { useEffect, useState } from "react";
import type { ListingImage } from "@/types/listing";

/**
 * Property detail page photo gallery: a large hero photo with a thumbnail
 * strip beneath it, and a full-screen lightbox (prev/next + click-to-zoom,
 * then scroll to pan) opened by clicking the hero photo. Sharp, bordered
 * edges with a soft drop shadow — the "Editorial Catalogue, sharp + shadow"
 * concept Hemang picked over a softened/rounded alternative.
 */
export default function PropertyGallery({ images }: { images: ListingImage[] }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const heroImage = images[heroIndex] ?? images[0];

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setHeroIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setHeroIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, images.length]);

  function openLightbox() {
    setZoomed(false);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setZoomed(false);
  }

  function next() {
    setZoomed(false);
    setHeroIndex((i) => (i + 1) % images.length);
  }

  function prev() {
    setZoomed(false);
    setHeroIndex((i) => (i - 1 + images.length) % images.length);
  }

  return (
    <div>
      <button
        type="button"
        onClick={openLightbox}
        className="relative block w-full cursor-zoom-in p-0 text-left"
        aria-label="View full screen"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          className="h-[420px] w-full object-cover shadow-[0_34px_64px_-24px_rgba(36,26,28,0.32)] sm:h-[480px] lg:h-[560px]"
        />
        <span className="absolute left-4 top-4 border border-brand-border bg-background/95 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-ink">
          Gallery
        </span>
        <span className="absolute right-4 top-4 bg-brand-ink/72 px-3.5 py-1.5 font-display text-sm italic text-background">
          {heroIndex + 1} / {images.length}
        </span>
        <span className="absolute bottom-4 right-4 bg-brand-ink/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-background">
          View full screen &middot; click to zoom
        </span>
      </button>

      {images.length > 1 && (
        <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setHeroIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === heroIndex}
              className={`h-[86px] w-full overflow-hidden shadow-[0_10px_22px_-14px_rgba(36,26,28,0.28)] transition-opacity hover:opacity-80 ${
                i === heroIndex ? "border-2 border-brand-gold-deep" : "border border-brand-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen photo viewer"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-brand-ink/95 p-9"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close full screen photo"
            className="absolute right-8 top-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-background hover:opacity-70"
          >
            Close &#10005;
          </button>
          <span className="absolute left-8 top-7 font-display text-base italic text-background">
            {heroIndex + 1} / {images.length}
          </span>

          {images.length > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-4xl text-background hover:opacity-70"
            >
              &#8249;
            </button>
          )}

          <div className="h-[72vh] w-[86vw] overflow-auto text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              onClick={() => setZoomed((z) => !z)}
              className={
                zoomed
                  ? "inline-block w-[1700px] max-w-none cursor-zoom-out align-middle shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)]"
                  : "inline-block max-h-[72vh] w-auto max-w-full cursor-zoom-in object-contain align-middle shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)]"
              }
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-5 top-1/2 -translate-y-1/2 text-4xl text-background hover:opacity-70"
            >
              &#8250;
            </button>
          )}

          <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-background/70">
            Click photo to zoom in and pan &middot; {heroImage.alt}
          </p>
        </div>
      )}
    </div>
  );
}
