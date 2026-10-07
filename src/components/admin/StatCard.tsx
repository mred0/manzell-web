interface StatCardProps {
  label: string;
  figure: number;
  badge: string;
  /** 0-100 bar heights, oldest/lowest bucket first. */
  spark: number[];
  /** Enquiries card only — flips the figure/badge/spark to the terracotta
   * "needs attention" colour instead of the default sage "on track" one. */
  urgent?: boolean;
}

export default function StatCard({ label, figure, badge, spark, urgent }: StatCardProps) {
  return (
    <div className="border border-brand-border bg-white p-5 shadow-[0_26px_50px_-28px_rgba(36,26,28,0.28)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-ink/50">
          {label}
        </span>
        <span
          className={`whitespace-nowrap text-[10.5px] font-bold ${
            urgent ? "text-admin-urgent" : "text-admin-ok"
          }`}
        >
          {badge}
        </span>
      </div>
      <p
        className={`mt-2 font-display text-[28px] font-bold italic tracking-tight tabular-nums ${
          urgent ? "text-admin-urgent" : "text-brand-ink"
        }`}
      >
        {figure}
      </p>
      <div className="mt-3 flex h-[26px] items-end gap-[3px]" aria-hidden>
        {spark.map((height, index) => (
          <i
            key={index}
            className={`flex-1 rounded-[1px] ${urgent ? "bg-admin-urgent" : "bg-brand-gold"}`}
            style={{ height: `${height}%`, opacity: index === spark.length - 1 ? 1 : 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
