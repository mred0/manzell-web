"use client";

/**
 * Generates and downloads a CSV entirely client-side — no server route to
 * keep in sync with whatever filtering the caller has already applied.
 * Mirrors the "Export CSV" button on Manzell's real production CRM
 * (manzell.com/admin), which appears on every list page there.
 */
export default function ExportCsvButton({
  headers,
  rows,
  filename,
  className,
}: {
  headers: string[];
  rows: string[][];
  filename: string;
  className?: string;
}) {
  function escapeCell(value: string): string {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  function handleExport() {
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className={
        className ??
        "inline-flex items-center gap-2 border border-brand-border bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink/70 transition-colors hover:border-brand-ink hover:text-brand-ink"
      }
    >
      Export CSV
    </button>
  );
}
